/* eslint-disable @typescript-eslint/no-unused-vars */
import * as grpc from "@grpc/grpc-js";

export type GrpcClientConstructorArgs = [
  address: string,
  credentials: grpc.ChannelCredentials,
  options?: object
];

export type GrpcClientClass<TGrpcClient> = {
  new (...args: GrpcClientConstructorArgs): TGrpcClient;
};

/** A generic type for specifying call options on a gRPC call. */
export type GrpcCall<TExtras extends object = object> = {
  metadata?: grpc.Metadata;
  options?: grpc.CallOptions;
} & TExtras;

export type OnData<TResponseType> = (
  complete: boolean,
  error: Error | null,
  chunk: TResponseType | null
) => void;

export type GrpcReadStreamCall<
  TGrpcClient,
  TFn extends keyof ReadableStreamFunctions<TGrpcClient>
> = GrpcCall<{
  onData?: OnData<ReadableStreamResponseType<TGrpcClient, TFn>>;
}>;

export type GrpcReadWriteStreamCall<
  TGrpcClient,
  TFn extends keyof DuplexStreamFunctions<TGrpcClient>
> = GrpcCall<{
  onData?: OnData<DuplexStreamResponseType<TGrpcClient, TFn>>;
}>;

export type IgnoredFunctions =
  | "waitForReady"
  | "close"
  | "getChannel"
  | "makeUnaryRequest"
  | "makeClientStreamRequest"
  | "makeServerStreamRequest"
  | "makeBidiStreamRequest";

export type UnaryGrpcFunctions<TClient> = {
  [K in keyof TClient as Parameters<
    TClient[K] extends (...args: infer TArgs) => grpc.ClientUnaryCall
      ? TClient[K]
      : () => never
  > extends [
    argument: infer TArgument,
    metadata: grpc.Metadata | null,
    options: grpc.CallOptions | null,
    callback: (error: grpc.ServiceError, response: infer Response) => void
  ]
    ? K extends IgnoredFunctions
      ? never
      : K
    : never]: TClient[K];
};

export type DuplexStreamFunctions<TClient> = {
  [K in keyof TClient as Parameters<
    TClient[K] extends (
      ...args: infer TArgs
    ) => grpc.ClientDuplexStream<infer TRequest, infer TResponse>
      ? TClient[K]
      : () => never
  > extends [metadata?: grpc.Metadata | null, options?: grpc.CallOptions | null]
    ? K extends IgnoredFunctions
      ? never
      : K extends keyof UnaryGrpcFunctions<TClient>
      ? never
      : K extends keyof ReadableStreamFunctions<TClient>
      ? never
      : K extends keyof WriteableStreamFunctions<TClient>
      ? never
      : K
    : never]: TClient[K];
};

export type ReadableStreamFunctions<TClient> = {
  [K in keyof TClient as Parameters<
    TClient[K] extends (
      ...args: infer TArgs
    ) => grpc.ClientReadableStream<infer TResponse>
      ? TClient[K]
      : () => never
  > extends [
    argument: infer TArgument,
    metadata?: grpc.Metadata | null,
    options?: grpc.CallOptions | null
  ]
    ? K extends IgnoredFunctions
      ? never
      : K
    : never]: TClient[K];
};

export type WriteableStreamFunctions<TClient> = {
  [K in keyof TClient as Parameters<
    TClient[K] extends (
      ...args: infer TArgs
    ) => grpc.ClientWritableStream<infer TRequest>
      ? TClient[K]
      : () => never
  > extends [
    metadata: grpc.Metadata | null,
    options: grpc.CallOptions | null,
    callback: (
      error: grpc.ServiceError | null,
      response: infer TResponse
    ) => void
  ]
    ? K extends IgnoredFunctions
      ? never
      : K
    : never]: TClient[K];
};

type RequestType<TFn> = TFn extends (...rest: infer TArgs) => infer TReturns
  ? TArgs[0]
  : never;

export type UnaryRequestType<
  TGrpcClient,
  TFn extends keyof UnaryGrpcFunctions<TGrpcClient>
> = RequestType<TGrpcClient[TFn]>;

export type ReadableStreamRequestType<
  TGrpcClient,
  TFn extends keyof ReadableStreamFunctions<TGrpcClient>
> = RequestType<TGrpcClient[TFn]>;

export type WriteableStreamRequestType<
  TGrpcClient,
  TFn extends keyof WriteableStreamFunctions<TGrpcClient>
> = TGrpcClient[TFn] extends (
  ...args: infer TArgs
) => grpc.ClientWritableStream<infer R>
  ? R
  : never;

export type DuplexStreamRequestType<
  TGrpcClient,
  TFn extends keyof DuplexStreamFunctions<TGrpcClient>
> = TGrpcClient[TFn] extends (
  ...args: infer TArgs
) => grpc.ClientDuplexStream<infer TRequestType, infer TResponseType>
  ? TRequestType
  : never;

export type UnaryResponseType<
  TGrpcClient,
  TFn extends keyof UnaryGrpcFunctions<TGrpcClient>
> = TGrpcClient[TFn] extends (
  request: UnaryRequestType<TGrpcClient, TFn>,
  metadata: grpc.Metadata | null,
  options: grpc.CallOptions | null,
  callback: (error: grpc.ServiceError | null, response: infer R) => void
) => infer TReturns
  ? R
  : never;

export type ReadableStreamResponseType<
  TGrpcClient,
  TFn extends keyof ReadableStreamFunctions<TGrpcClient>
> = ReturnType<
  TGrpcClient[TFn] extends (...args: infer TArgs) => infer TReturns
    ? TGrpcClient[TFn]
    : () => never
> extends grpc.ClientReadableStream<infer R>
  ? R
  : never;

export type WriteableStreamResponseType<
  TGrpcClient,
  TFn extends keyof WriteableStreamFunctions<TGrpcClient>
> = TGrpcClient[TFn] extends (
  metadata: grpc.Metadata | null,
  options: grpc.CallOptions | null,
  callback: (error: grpc.ServiceError | null, response: infer R) => void
) => grpc.ClientWritableStream<WriteableStreamRequestType<TGrpcClient, TFn>>
  ? R
  : never;

export type DuplexStreamResponseType<
  TGrpcClient,
  TFn extends keyof DuplexStreamFunctions<TGrpcClient>
> = TGrpcClient[TFn] extends (
  ...args: infer TArgs
) => grpc.ClientDuplexStream<infer TRequestType, infer TResponseType>
  ? TResponseType
  : never;

export type UnaryGrpcFunction<
  TGrpcClient extends grpc.Client,
  TFn extends keyof UnaryGrpcFunctions<TGrpcClient>
> = (
  request: UnaryRequestType<TGrpcClient, TFn>,
  metadata: grpc.Metadata | null,
  options: grpc.CallOptions | null,
  callback: (
    error: grpc.ServiceError | null,
    response: UnaryResponseType<TGrpcClient, TFn>
  ) => void
) => grpc.ClientUnaryCall;

export type ReadableStreamGrpcFunction<
  TGrpcClient extends grpc.Client,
  TFn extends keyof ReadableStreamFunctions<TGrpcClient>
> = (
  request: ReadableStreamRequestType<TGrpcClient, TFn>,
  metadata: grpc.Metadata | null,
  options: grpc.CallOptions | null
) => grpc.ClientReadableStream<ReadableStreamResponseType<TGrpcClient, TFn>>;

export type WriteableStreamGrpcFunction<
  TGrpcClient extends grpc.Client,
  TFn extends keyof WriteableStreamFunctions<TGrpcClient>
> = (
  metadata: grpc.Metadata | null,
  options: grpc.CallOptions | null,
  callback: (
    error: grpc.ServiceError | null,
    response: WriteableStreamResponseType<TGrpcClient, TFn>
  ) => void
) => grpc.ClientWritableStream<WriteableStreamRequestType<TGrpcClient, TFn>>;

export type DuplexStreamGrpcFunction<
  TGrpcClient extends grpc.Client,
  TFn extends keyof DuplexStreamFunctions<TGrpcClient>
> = (
  metadata?: grpc.Metadata | null,
  options?: grpc.CallOptions | null
) => grpc.ClientDuplexStream<
  DuplexStreamRequestType<TGrpcClient, TFn>,
  DuplexStreamResponseType<TGrpcClient, TFn>
>;

type WriteAsync<TChunk> = (chunk: TChunk) => Promise<void>;

export type WriteStream<
  TGrpcClient,
  TFn extends keyof WriteableStreamFunctions<TGrpcClient>
> = {
  _stream: grpc.ClientWritableStream<
    WriteableStreamRequestType<TGrpcClient, TFn>
  >;
  end: () => void;
  write: WriteAsync<WriteableStreamRequestType<TGrpcClient, TFn>>;
};

export type WriteStreamOnResponse<
  TGrpcClient,
  TFn extends keyof WriteableStreamFunctions<TGrpcClient>
> = (
  error: grpc.ServiceError | null,
  response: WriteableStreamResponseType<TGrpcClient, TFn>
) => void;

export type WriteStreamReturnType<
  TGrpcClient,
  TFn extends keyof WriteableStreamFunctions<TGrpcClient>
> = WriteStream<TGrpcClient, TFn>;

export type ReadWriteStreamReturnType<
  TGrpcClient,
  TFn extends keyof DuplexStreamFunctions<TGrpcClient>
> = {
  _stream: grpc.ClientDuplexStream<
    DuplexStreamRequestType<TGrpcClient, TFn>,
    DuplexStreamResponseType<TGrpcClient, TFn>
  >;
  end: () => void;
  write: WriteAsync<DuplexStreamRequestType<TGrpcClient, TFn>>;
};

export type WriteAsyncCallback<TRequestType> = (
  chunk: TRequestType
) => Promise<void>;
