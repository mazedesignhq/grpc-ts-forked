// GENERATED CODE -- DO NOT EDIT!

// package: example
// file: example.proto

import * as example_pb from "./example_pb";
import * as grpc from "@grpc/grpc-js";

interface IExampleService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  getName: grpc.MethodDefinition<example_pb.GetNameRequest, example_pb.GetNameResponse>;
  streamMessages: grpc.MethodDefinition<example_pb.StreamMessagesRequest, example_pb.StreamMessagesResponse>;
  emitMessages: grpc.MethodDefinition<example_pb.EmitMessagesRequest, example_pb.EmitMessagesResponse>;
  chat: grpc.MethodDefinition<example_pb.ChatRequest, example_pb.ChatResponse>;
}

export const ExampleService: IExampleService;

export interface IExampleServer extends grpc.UntypedServiceImplementation {
  getName: grpc.handleUnaryCall<example_pb.GetNameRequest, example_pb.GetNameResponse>;
  streamMessages: grpc.handleServerStreamingCall<example_pb.StreamMessagesRequest, example_pb.StreamMessagesResponse>;
  emitMessages: grpc.handleClientStreamingCall<example_pb.EmitMessagesRequest, example_pb.EmitMessagesResponse>;
  chat: grpc.handleBidiStreamingCall<example_pb.ChatRequest, example_pb.ChatResponse>;
}

export class ExampleClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  getName(argument: example_pb.GetNameRequest, callback: grpc.requestCallback<example_pb.GetNameResponse>): grpc.ClientUnaryCall;
  getName(argument: example_pb.GetNameRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<example_pb.GetNameResponse>): grpc.ClientUnaryCall;
  getName(argument: example_pb.GetNameRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<example_pb.GetNameResponse>): grpc.ClientUnaryCall;
  streamMessages(argument: example_pb.StreamMessagesRequest, metadataOrOptions?: grpc.Metadata | grpc.CallOptions | null): grpc.ClientReadableStream<example_pb.StreamMessagesResponse>;
  streamMessages(argument: example_pb.StreamMessagesRequest, metadata?: grpc.Metadata | null, options?: grpc.CallOptions | null): grpc.ClientReadableStream<example_pb.StreamMessagesResponse>;
  emitMessages(callback: grpc.requestCallback<example_pb.EmitMessagesResponse>): grpc.ClientWritableStream<example_pb.EmitMessagesRequest>;
  emitMessages(metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<example_pb.EmitMessagesResponse>): grpc.ClientWritableStream<example_pb.EmitMessagesRequest>;
  emitMessages(metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<example_pb.EmitMessagesResponse>): grpc.ClientWritableStream<example_pb.EmitMessagesRequest>;
  chat(metadataOrOptions?: grpc.Metadata | grpc.CallOptions | null): grpc.ClientDuplexStream<example_pb.ChatRequest, example_pb.ChatResponse>;
  chat(metadata?: grpc.Metadata | null, options?: grpc.CallOptions | null): grpc.ClientDuplexStream<example_pb.ChatRequest, example_pb.ChatResponse>;
}
