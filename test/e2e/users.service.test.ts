import * as grpc from "@grpc/grpc-js";
import { Empty } from "google-protobuf/google/protobuf/empty_pb";
import execa from "execa";
import { OnData } from "@lewnelson/grpc-ts";
import { UsersClient } from "../generated/users";
import {
  CreateUserRequest,
  EmitUserActionRequest,
  EmitUserActionResponse,
  GetUserByIdRequest,
  GetUsersByTeamIdRequest,
  UpdateUserRequest,
  UserAction,
  UserInputData,
  UserResponse,
  UserUpdatedResponse,
} from "../generated/users/users_pb";

type ServerProcess = execa.ExecaChildProcess<string>;

const VALID_SERVER_PORT = 50091;
const INVALID_SERVER_PORT = 50092;

interface ServerEnv {
  PORT: number;
  SHOULD_FAIL?: boolean;
}

const waitForServerStdOut = (
  server: ServerProcess,
  expectedMessage: string | RegExp,
  onFailMessage: string,
  ttl: number
) => {
  return new Promise<void>((resolve, reject) => {
    const serverTimeout = setTimeout(() => {
      server.kill();
      reject(new Error(onFailMessage));
    }, ttl);

    const onData = (chunk: unknown) => {
      const message = chunk?.toString() as string;
      if (message.match(expectedMessage)) {
        server.stdout?.removeListener("data", onData);
        clearTimeout(serverTimeout);
        setTimeout(resolve, 500);
      }
    };

    server.stdout?.on("data", onData);
  });
};

const waitForCallCount = (mock: jest.Mock, n: number, timeout: number) => {
  return new Promise<void>((resolve, reject) => {
    let interval: NodeJS.Timer | null = null;
    const timeoutRef = setTimeout(() => {
      if (interval !== null) clearInterval(interval);
      reject(
        new Error("Timed out waiting for call count to be reached for mock")
      );
    }, timeout);

    interval = setInterval(() => {
      if (mock.mock.calls.length === n) {
        if (interval !== null) clearInterval(interval);
        clearTimeout(timeoutRef);
        resolve();
      }
    }, 100);
  });
};

const startServer = (env: ServerEnv): [ServerProcess, Promise<void>] => {
  const server = execa("npm", ["run", "start:test-server"], {
    env: {
      PORT: `${env.PORT}`,
      SHOULD_FAIL: `${env.SHOULD_FAIL}`,
    },
  });

  const serverPromise = waitForServerStdOut(
    server,
    /Server listening on/,
    "Server failed to start",
    4000
  );

  return [server, serverPromise];
};

const startServers = (): [
  serverProcesses: { valid: ServerProcess; invalid: ServerProcess },
  serversReady: Promise<void[]>
] => {
  const [validServerProcess, validServerReady] = startServer({
    PORT: VALID_SERVER_PORT,
  });

  const [invalidServerProcess, invalidServerReady] = startServer({
    PORT: INVALID_SERVER_PORT,
    SHOULD_FAIL: true,
  });

  const serverProcesses = {
    valid: validServerProcess,
    invalid: invalidServerProcess,
  };

  const serversReady = Promise.all([validServerReady, invalidServerReady]);
  return [serverProcesses, serversReady];
};

describe("Users service", () => {
  let serverProcesses: { valid: ServerProcess; invalid: ServerProcess };
  let validClient: UsersClient;
  let invalidClient: UsersClient;
  beforeAll(async () => {
    const [processes, serversReady] = startServers();
    serverProcesses = processes;

    await serversReady;

    validClient = new UsersClient(`localhost:${VALID_SERVER_PORT}`);
    invalidClient = new UsersClient(`localhost:${INVALID_SERVER_PORT}`);
  });

  afterAll(() => {
    Object.values(serverProcesses).forEach((serverProcess) => {
      serverProcess.kill();
    });
  });

  describe("unary requests", () => {
    describe("GetUserById", () => {
      it("should return the user when the response is successful", async () => {
        const request = new GetUserByIdRequest();
        request.setId("user-1");

        const response = await validClient.getUserById(request);
        expect(response.toObject()).toEqual({
          user: {
            id: "user-1",
            name: "John Doe",
            email: "john.doe@acme.org",
            teamId: "team-1",
          },
        });
      });

      it("should throw an error when the request fails", async () => {
        await expect(
          invalidClient.getUserById(new GetUserByIdRequest())
        ).rejects.toThrowGrpcException("User not found", grpc.status.NOT_FOUND);
      });
    });

    describe("CreateUser", () => {
      it("should return the newly created user when the response is successful", async () => {
        const request = new CreateUserRequest();
        const user = new UserInputData();
        user.setName("Jane Doe");
        user.setEmail("jane.doe@acme.org");
        user.setTeamId("team-1");

        request.setUser(user);

        const response = await validClient.createUser(request);
        expect(response.toObject()).toEqual({
          user: {
            id: "user-2",
            name: "Jane Doe",
            email: "jane.doe@acme.org",
            teamId: "team-1",
          },
        });
      });

      it("should throw an error when the request fails", async () => {
        await expect(
          invalidClient.createUser(new CreateUserRequest())
        ).rejects.toThrowGrpcException(
          "User with email already exists",
          grpc.status.ALREADY_EXISTS
        );
      });
    });

    describe("GetUsersByTeamId", () => {
      it("should return the users for the team when the response is successful", async () => {
        const request = new GetUsersByTeamIdRequest();
        request.setTeamId("team-1");

        const response = await validClient.getUsersByTeamId(request);
        expect(response.toObject()).toEqual({
          usersList: [
            {
              id: "user-1",
              name: "John Doe",
              email: "john.doe@acme.org",
              teamId: "team-1",
            },
            {
              id: "user-2",
              name: "Jane Doe",
              email: "jane.doe@acme.org",
              teamId: "team-1",
            },
          ],
        });
      });

      it("should throw an error when the request fails", async () => {
        await expect(
          invalidClient.getUsersByTeamId(new GetUsersByTeamIdRequest())
        ).rejects.toThrowGrpcException(
          "Invalid team id",
          grpc.status.INVALID_ARGUMENT
        );
      });
    });
  });

  describe("server streaming", () => {
    describe("UserCreated", () => {
      describe("successful requests", () => {
        const onData = jest.fn<
          ReturnType<OnData<UserResponse>>,
          Parameters<OnData<UserResponse>>
        >();

        beforeAll(async () => {
          const request = new Empty();
          validClient.userCreated(request, {
            onData,
          });

          await waitForServerStdOut(
            serverProcesses.valid,
            "UserCreated stream ended",
            "Failed to check if stream ended for UserCreated",
            1000
          );

          await waitForCallCount(onData, 3, 2000);
        });

        it("the onData callback was called 3 times (2 users and one end)", () => {
          expect(onData).toHaveBeenCalledTimes(3);
        });

        const testCases = [
          {
            index: 0,
            call: "first",
            complete: false,
            chunk: {
              user: {
                id: "user-1",
                name: "John Doe",
                email: "john.doe@acme.org",
                teamId: "team-1",
              },
            },
          },
          {
            index: 1,
            call: "second",
            complete: false,
            chunk: {
              user: {
                id: "user-2",
                name: "Jane Doe",
                email: "jane.doe@acme.org",
                teamId: "team-1",
              },
            },
          },
          {
            index: 2,
            call: "third",
            complete: true,
            chunk: null,
          },
        ];

        describe.each(testCases)(
          "the $call call",
          ({ index, ...expectedOutput }) => {
            let complete: boolean;
            let error: Error | null;
            let chunk: UserResponse | null;
            beforeAll(() => {
              [complete, error, chunk] = onData.mock.calls[index];
            });

            it(`complete was ${expectedOutput.complete}`, () => {
              expect(complete).toBe(expectedOutput.complete);
            });

            it("error was null", () => {
              expect(error).toBeNull();
            });

            if (expectedOutput.chunk === null) {
              it("chunk was null", () => {
                expect(chunk).toBeNull();
              });
            } else {
              it(`chunk was user ${expectedOutput.chunk.user.name}`, () => {
                expect(chunk?.toObject()).toEqual(expectedOutput.chunk);
              });
            }
          }
        );
      });

      describe("when the stream emits an error", () => {
        const onData = jest.fn<
          ReturnType<OnData<UserResponse>>,
          Parameters<OnData<UserResponse>>
        >();

        beforeAll(async () => {
          const request = new Empty();
          invalidClient.userCreated(request, {
            onData,
          });

          await waitForServerStdOut(
            serverProcesses.invalid,
            "UserCreated stream ended",
            "Failed to check if stream ended for UserCreated",
            1000
          );

          await waitForCallCount(onData, 2, 2000);
        });

        it("calls onData twice (once for the error and again when the stream is ended)", () => {
          expect(onData).toHaveBeenCalledTimes(2);
        });

        describe("the first call", () => {
          let complete: boolean;
          let error: Error | null;
          let chunk: UserResponse | null;
          beforeAll(() => {
            [complete, error, chunk] = onData.mock.calls[0];
          });

          it("complete was false", () => {
            expect(complete).toBe(false);
          });

          it("the error is a gRPC exception with a status of UNKNOWN and a message 'Unable to create user'", () => {
            expect(error).toThrowGrpcException(
              "Unable to create user",
              grpc.status.UNKNOWN
            );
          });

          it("chunk was null", () => {
            expect(chunk).toBeNull();
          });
        });

        describe("the second call", () => {
          let complete: boolean;
          let error: Error | null;
          let chunk: UserResponse | null;
          beforeAll(() => {
            [complete, error, chunk] = onData.mock.calls[1];
          });

          it("complete was true", () => {
            expect(complete).toBe(true);
          });

          it("the error was null", () => {
            expect(error).toBeNull();
          });

          it("chunk was null", () => {
            expect(chunk).toBeNull();
          });
        });
      });
    });
  });

  describe("client streaming", () => {
    describe("EmitUserAction", () => {
      let stream: ReturnType<UsersClient["emitUserAction"]>;
      let response: EmitUserActionResponse | undefined;
      let error: grpc.ServiceError | null;
      let onResponse: jest.Mock<
        void,
        [
          error: grpc.ServiceError | null,
          response: EmitUserActionResponse | undefined
        ]
      >;

      describe("successful requests", () => {
        describe("no requests", () => {
          beforeAll(async () => {
            onResponse = jest.fn();
            stream = await validClient.emitUserAction(onResponse);

            const serverOutputPromise = waitForServerStdOut(
              serverProcesses.valid,
              "EmitUserAction stream ended",
              "Failed to check if stream ended for EmitUserAction",
              1000
            );

            stream.end();
            await serverOutputPromise;
            error = onResponse.mock.calls?.[0]?.[0];
            response = onResponse.mock.calls?.[0]?.[1];
          });

          it("error is null", () => {
            expect(error).toBeNull();
          });

          it("should respond with no events processed", () => {
            expect(response?.toObject()).toEqual({
              eventsProcessed: 0,
              eventsList: [],
            });
          });
        });

        describe("multiple requests", () => {
          beforeAll(async () => {
            onResponse = jest.fn();
            stream = await validClient.emitUserAction(onResponse);
            const requestOne = new EmitUserActionRequest();
            requestOne.setUserId("user-1");
            requestOne.setAction(UserAction.USER_ACTION_DOWNLOADED);

            await stream.write(requestOne);

            const requestTwo = new EmitUserActionRequest();
            requestTwo.setUserId("user-2");
            requestTwo.setAction(UserAction.USER_ACTION_UPLOADED);

            await stream.write(requestTwo);
            const serverOutputPromise = waitForServerStdOut(
              serverProcesses.valid,
              "EmitUserAction stream ended",
              "Failed to check if stream ended for EmitUserAction",
              1000
            );

            stream.end();
            await serverOutputPromise;
            error = onResponse.mock.calls?.[0]?.[0];
            response = onResponse.mock.calls?.[0]?.[1];
          });

          it("error is null", () => {
            expect(error).toBeNull();
          });

          it("calls onResponse once the stream has ended", () => {
            expect(onResponse).toHaveBeenCalledTimes(1);
          });

          it("responds with the correct number of events", () => {
            expect(response?.getEventsProcessed()).toBe(2);
          });

          it("responds with the events processed in the correct order", () => {
            expect(response?.toObject()?.eventsList).toEqual([
              {
                userId: "user-1",
                action: UserAction.USER_ACTION_DOWNLOADED,
              },
              {
                userId: "user-2",
                action: UserAction.USER_ACTION_UPLOADED,
              },
            ]);
          });
        });
      });

      describe("failed requests", () => {
        beforeAll(async () => {
          onResponse = jest.fn();
          stream = await invalidClient.emitUserAction(onResponse);
          const serverOutputPromise = waitForServerStdOut(
            serverProcesses.invalid,
            "EmitUserAction stream ended",
            "Failed to check if stream ended for EmitUserAction",
            1000
          );

          stream.end();
          await serverOutputPromise;
          error = onResponse.mock.calls?.[0]?.[0];
          response = onResponse.mock.calls?.[0]?.[1];
        });

        it("response is undefined", () => {
          expect(response).toBeUndefined();
        });

        it("the error is a grpc.ServiceError with status of RESOURCE_EXHAUSTED and message 'Failed to process events'", () => {
          expect(error).toThrowGrpcException(
            "Failed to process events",
            grpc.status.RESOURCE_EXHAUSTED
          );
        });
      });
    });
  });

  describe("duplex streaming", () => {
    describe("UserUpdated", () => {
      let stream: ReturnType<UsersClient["updateUser"]>;
      let onData: jest.Mock<
        ReturnType<OnData<UserUpdatedResponse>>,
        Parameters<OnData<UserUpdatedResponse>>
      >;

      describe("when there are no errors", () => {
        describe("when no requests are sent and the client closes the stream", () => {
          beforeAll(async () => {
            onData = jest.fn();
            stream = validClient.updateUser({ onData });
            stream.end();
            await waitForServerStdOut(
              serverProcesses.valid,
              "UpdateUser stream ended",
              "Failed to check if stream ended for UpdateUser",
              1000
            );
          });

          it("should not call the callback for onData", () => {
            expect(onData).not.toHaveBeenCalled();
          });
        });

        describe("when the client sends multiple requests, then closes the stream", () => {
          beforeAll(async () => {
            onData = jest.fn();
            stream = validClient.updateUser({ onData });

            const requestOne = new UpdateUserRequest();
            requestOne.setUserId("user-1");

            const requestTwo = new UpdateUserRequest();
            requestTwo.setUserId("user-2");

            await stream.write(requestOne);
            await stream.write(requestTwo);

            stream.end();
            await waitForServerStdOut(
              serverProcesses.valid,
              "UpdateUser stream ended",
              "Failed to check if stream ended for UpdateUser",
              1000
            );
          });

          it("should have received two streamed responses, one for each request sent", () => {
            expect(onData).toHaveBeenCalledTimes(2);
          });

          describe("the first call", () => {
            it("complete should be false", () => {
              expect(onData.mock.calls[0]?.[0]).toBe(false);
            });

            it("the error should be null", () => {
              expect(onData.mock.calls[0]?.[1]).toBeNull();
            });

            it("the onData callback should have the user id of 'user-1' (the first request)", () => {
              expect(onData.mock.calls[0]?.[2]?.getUserId()).toBe("user-1");
            });
          });

          describe("the second call", () => {
            it("complete should be false", () => {
              expect(onData.mock.calls[1]?.[0]).toBe(false);
            });

            it("the error should be null", () => {
              expect(onData.mock.calls[1]?.[1]).toBeNull();
            });

            it("the onData callback should have the user id of 'user-2' (the second request)", () => {
              expect(onData.mock.calls[1]?.[2]?.getUserId()).toBe("user-2");
            });
          });
        });
      });

      describe("when the server emits an error", () => {
        beforeAll(async () => {
          onData = jest.fn();
          stream = invalidClient.updateUser({ onData });
          const serverStdOutPromise = waitForServerStdOut(
            serverProcesses.invalid,
            "UpdateUser stream ended",
            "Failed to check if stream ended for UpdateUser",
            1000
          );

          await stream.write(new UpdateUserRequest());
          await serverStdOutPromise;
        });

        it("should call the onData callback twice, once for the error and again for when the stream is closed", () => {
          expect(onData).toHaveBeenCalledTimes(2);
        });

        describe("the first call", () => {
          it("complete should be false", () => {
            expect(onData.mock.calls[0]?.[0]).toBe(false);
          });

          it("should receive a grpc.ServiceError with a status of FAILED_PRECONDITION and a message of 'Unable to update user'", () => {
            expect(onData.mock.calls[0]?.[1]).toThrowGrpcException(
              "Unable to update user",
              grpc.status.FAILED_PRECONDITION
            );
          });

          it("should receive null for data", () => {
            expect(onData.mock.calls[0]?.[2]).toBeNull();
          });
        });

        describe("the second call", () => {
          it("complete should be true", () => {
            expect(onData.mock.calls[1]?.[0]).toBe(true);
          });

          it("should not receive an error", () => {
            expect(onData.mock.calls[1]?.[1]).toBeNull();
          });

          it("should receive null for data", () => {
            expect(onData.mock.calls[1]?.[2]).toBeNull();
          });
        });
      });
    });
  });
});
