import * as grpc from "@grpc/grpc-js";
import { Empty } from "google-protobuf/google/protobuf/empty_pb";
import {
  handleUnaryCall,
  handleClientStreamingCall,
  handleServerStreamingCall,
  handleBidiStreamingCall,
} from "@grpc/grpc-js/build/src/server-call";
import { UsersService } from "../generated/users/users_grpc_pb";
import {
  CreateUserRequest,
  EmitUserActionRequest,
  EmitUserActionResponse,
  GetUserByIdRequest,
  GetUsersByTeamIdRequest,
  UpdateUserRequest,
  User,
  UserResponse,
  UsersResponse,
  UserUpdatedResponse,
} from "../generated/users/users_pb";

const shouldFail = (process.env.SHOULD_FAIL ?? "").toLowerCase() === "true";
const port = process.env.PORT;

if (!port) {
  console.error("PORT environment variable not set");
  process.exit(1);
}

class GrpcError extends Error implements grpc.StatusObject {
  constructor(
    message: string,
    public code: grpc.status,
    public metadata: grpc.Metadata = new grpc.Metadata()
  ) {
    super(message);
  }

  get details(): string {
    return this.message;
  }
}

const respond = <TResponse, TCallback extends grpc.sendUnaryData<TResponse>>(
  callback: TCallback,
  {
    onError,
    onSuccess,
  }: {
    onError: {
      status: grpc.status;
      message: string;
    };
    onSuccess: TResponse;
  }
) => {
  if (shouldFail) {
    callback(new GrpcError(onError.message, onError.status), null);
  } else {
    callback(null, onSuccess);
  }
};

const getUserById: handleUnaryCall<GetUserByIdRequest, UserResponse> = (
  call,
  callback
) => {
  const response = new UserResponse();
  const user = new User();
  user.setId(call.request.getId());
  user.setName("John Doe");
  user.setEmail("john.doe@acme.org");
  user.setTeamId("team-1");
  response.setUser(user);

  respond(callback, {
    onError: { message: "User not found", status: grpc.status.NOT_FOUND },
    onSuccess: response,
  });
};

const createUser: handleUnaryCall<CreateUserRequest, UserResponse> = (
  call,
  callback
) => {
  const response = new UserResponse();
  const user = new User();
  user.setId("user-2");
  user.setName(call.request.getUser()?.getName() ?? "");
  user.setEmail(call.request.getUser()?.getEmail() ?? "");
  user.setTeamId(call.request.getUser()?.getTeamId() ?? "");
  response.setUser(user);

  respond(callback, {
    onError: {
      message: "User with email already exists",
      status: grpc.status.ALREADY_EXISTS,
    },
    onSuccess: response,
  });
};

const getUsersByTeamId: handleUnaryCall<
  GetUsersByTeamIdRequest,
  UsersResponse
> = (call, callback) => {
  const response = new UsersResponse();
  const users = [
    {
      id: "user-1",
      name: "John Doe",
      email: "john.doe@acme.org",
      teamId: call.request.getTeamId(),
    },
    {
      id: "user-2",
      name: "Jane Doe",
      email: "jane.doe@acme.org",
      teamId: call.request.getTeamId(),
    },
  ];

  users.forEach((user) => {
    const userResponse = new User();
    userResponse.setId(user.id);
    userResponse.setName(user.name);
    userResponse.setEmail(user.email);
    userResponse.setTeamId(user.teamId);

    response.addUsers(userResponse);
  });

  respond(callback, {
    onError: {
      message: "Invalid team id",
      status: grpc.status.INVALID_ARGUMENT,
    },
    onSuccess: response,
  });
};

const userCreated: handleServerStreamingCall<Empty, UserResponse> = (call) => {
  const userOne = new User();
  const userTwo = new User();
  userOne.setId("user-1");
  userOne.setName("John Doe");
  userOne.setEmail("john.doe@acme.org");
  userOne.setTeamId("team-1");
  userTwo.setId("user-2");
  userTwo.setName("Jane Doe");
  userTwo.setEmail("jane.doe@acme.org");
  userTwo.setTeamId("team-1");

  const userOneResponse = new UserResponse();
  userOneResponse.setUser(userOne);
  const userTwoResponse = new UserResponse();
  userTwoResponse.setUser(userTwo);

  if (shouldFail) {
    call.emit(
      "error",
      new GrpcError("Unable to create user", grpc.status.UNKNOWN)
    );
  } else {
    call.write(userOneResponse);
    call.write(userTwoResponse);
  }

  call.end();
  console.log("UserCreated stream ended");
};

const emitUserAction: handleClientStreamingCall<
  EmitUserActionRequest,
  EmitUserActionResponse
> = (call, callback) => {
  const events: EmitUserActionRequest[] = [];
  call.on("data", (chunk: EmitUserActionRequest) => {
    events.push(chunk);
    console.log(
      `EmitUserAction received chunk: ${JSON.stringify(chunk.toObject())}`
    );
  });

  call.on("end", () => {
    console.log("EmitUserAction stream ended");
    const response = new EmitUserActionResponse();
    response.setEventsList(events);
    response.setEventsProcessed(events.length);
    respond(callback, {
      onError: {
        message: "Failed to process events",
        status: grpc.status.RESOURCE_EXHAUSTED,
      },
      onSuccess: response,
    });
  });
};

const updateUser: handleBidiStreamingCall<
  UpdateUserRequest,
  UserUpdatedResponse
> = (call) => {
  call.on("data", (chunk: UpdateUserRequest) => {
    console.log(
      `UpdateUser received chunk: ${JSON.stringify(chunk.toObject())}`
    );

    if (shouldFail) {
      call.emit(
        "error",
        new GrpcError("Unable to update user", grpc.status.FAILED_PRECONDITION)
      );

      call.end();
      console.log("UpdateUser stream ended");
    } else {
      const response = new UserUpdatedResponse();
      response.setUserId(chunk.getUserId());
      call.write(response);
    }
  });

  call.on("end", () => {
    console.log("UpdateUser stream ended");
  });
};

export const main = (): void => {
  const server = new grpc.Server();
  server.addService(UsersService, {
    getUserById,
    createUser,
    getUsersByTeamId,
    userCreated,
    emitUserAction,
    updateUser,
  });

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("Failed to bind server", err);
        process.exit(1);
      }

      server.start();
      console.log(`Server listening on 0.0.0.0:${port}`);
    }
  );
};

main();
