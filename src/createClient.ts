import * as grpc from "@grpc/grpc-js";
import { GenericClient } from "./genericClient";
import { GrpcClientClass, GrpcClientConstructorArgs } from "./types";

/**
 * Create a generic gRPC client from a generated client
 *
 * @remarks
 *   Pass the reference to the generated Client class which was created using
 *   "grpc-ts generate". Specify the address of the server. Optionally specify
 *   the credentials and options for the connection.
 *
 *   For SSL connections ensure you set credentials to
 *   grpc.credentials.createSsl()
 *
 *   For further reference on options see
 *   {@link https://www.npmjs.com/package/@grpc/grpc-js}
 * @example
 *   Creating a client from a generated UsersClient class
 *   ```
 *   import { UsersClient } from "./generated/users_grpc_pb";
 *   import { createClient } from "@lewnelson/grpc-ts";
 *
 *   const client = createClient(UsersClient, "localhost:50051");
 *   ```
 *
 * @param Client The class of the generated client
 * @param address The address of the server to connect to. <host>:<port>
 * @param options.credentials Optional credentials for the connection, defaults
 *   to grpc.credentials.createInsecure()
 * @param options.options Optional options for the connection see
 *   {@link https://www.npmjs.com/package/@grpc/grpc-js} for details
 * @returns Generic client instance {@link GenericClient}
 */
export const createClient = <TGrpcClient extends grpc.Client>(
  Client: GrpcClientClass<TGrpcClient>,
  address: GrpcClientConstructorArgs["0"],
  {
    credentials,
    options,
  }: {
    credentials?: GrpcClientConstructorArgs["1"];
    options?: GrpcClientConstructorArgs["2"];
  } = {}
) => {
  const genericClient = new GenericClient(Client, [
    address,
    credentials ?? grpc.credentials.createInsecure(),
    options,
  ]);

  return genericClient;
};
