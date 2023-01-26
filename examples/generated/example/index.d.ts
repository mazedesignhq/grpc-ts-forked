// This file was generated using @lewnelson/grpc-ts
// Do not modify this file directly

import { createClient, UnaryRequest, ReadableStreamRequest, WriteableStreamRequest, DuplexStreamRequest } from "@lewnelson/grpc-ts";
import { ExampleClient as grpc_ExampleClient } from "./example_grpc_pb";

export interface IExampleClient {
    getName: UnaryRequest<grpc_ExampleClient, "getName">;
    streamMessages: ReadableStreamRequest<grpc_ExampleClient, "streamMessages">;
    emitMessages: WriteableStreamRequest<grpc_ExampleClient, "emitMessages">;
    chat: DuplexStreamRequest<grpc_ExampleClient, "chat">;
}

export class ExampleClient implements IExampleClient {
    constructor(address: Parameters<typeof createClient>[1], options?: Parameters<typeof createClient>[2]);
    getName: UnaryRequest<grpc_ExampleClient, "getName">;
    streamMessages: ReadableStreamRequest<grpc_ExampleClient, "streamMessages">;
    emitMessages: WriteableStreamRequest<grpc_ExampleClient, "emitMessages">;
    chat: DuplexStreamRequest<grpc_ExampleClient, "chat">;
}
