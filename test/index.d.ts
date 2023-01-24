import * as grpc from "@grpc/grpc-js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> extends CustomMatchers<R> {
      toThrowGrpcException(
        message: string | RegExp,
        expectedStatusCode: grpc.status
      ): CustomMatcherResult;
    }
  }
}

export {};
