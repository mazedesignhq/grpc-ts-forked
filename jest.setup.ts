import * as grpc from "@grpc/grpc-js";

expect.extend({
  toThrowGrpcException(
    received: unknown,
    message: string | RegExp,
    expectedStatusCode: grpc.status
  ) {
    if (!(received instanceof Error)) {
      return {
        pass: false,
        message: () => `Expected to throw an Error but received ${received}`,
      };
    }

    // gRPC service error formats error messages as "<STATUS_CODE_INT> <STATUS_CODE_STRING>: <message>"
    const errorMessage = (received?.message ?? "")
      .split(":")[1]
      .replace(/^\s{0,}/, "");

    if (message instanceof RegExp) {
      if (!message.test(errorMessage)) {
        return {
          pass: false,
          message: () =>
            `Expected to throw an Error with message matching ${message} but received "${errorMessage}"`,
        };
      }
    } else if (errorMessage !== message) {
      return {
        pass: false,
        message: () =>
          `Expected to throw an Error with message ${message} but received "${errorMessage}"`,
      };
    }

    if ((received as grpc.ServiceError).code !== expectedStatusCode) {
      return {
        pass: false,
        message: () =>
          `Expected to throw an Error with status code ${expectedStatusCode} but received ${
            (received as grpc.ServiceError).code
          }`,
      };
    }

    return {
      pass: true,
      message: () =>
        `Expected to throw an Error with status code ${expectedStatusCode}`,
    };
  },
});
