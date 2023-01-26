import * as grpc from "@grpc/grpc-js";
import {
  UnaryGrpcFunctions,
  GrpcCall,
  GrpcClientClass,
  GrpcClientConstructorArgs,
  UnaryRequestType,
  UnaryResponseType,
  UnaryGrpcFunction,
  ReadableStreamFunctions,
  ReadableStreamRequestType,
  ReadableStreamGrpcFunction,
  WriteableStreamFunctions,
  WriteableStreamGrpcFunction,
  WriteStreamReturnType,
  DuplexStreamFunctions,
  ReadWriteStreamReturnType,
  DuplexStreamGrpcFunction,
  GrpcReadStreamCall,
  GrpcReadWriteStreamCall,
  OnData,
  WriteAsyncCallback,
  WriteStreamOnResponse,
  ReadStreamReturnType,
} from "./types";

/**
 * Generic gRPC client that wraps the gRPC client and provides a more convenient
 * interface to access unary requests and streams.
 */
export class GenericClient<TGrpcClient extends grpc.Client> {
  /** Generated grpc client class */
  private readonly client: TGrpcClient;

  /**
   * Make a unary request to the gRPC server
   *
   * @remarks
   *   Wrapper to access unary requests in the gRPC client. Returns a promise that
   *   resolves to the response of the unary request instead of using
   *   callbacks.
   * @example
   *   Here is an example where a client implements a unary request function of "health" which accepts an empty request object and returns a response object of type HealthCheckResponse.
   *   ```
   *   // Empty is available from the generated js file for the proto
   *   const request = new Empty();
   *   // response is of type HealthCheckResponse
   *   const response = await client.unaryRequest("health", request);
   *   ```
   *
   * @param fn Name of the unary request function
   * @param request Corresponding request object
   * @param callOptions {@link GrpcCall} Optional object
   * @returns Promise that resolves to the response type of the unary request
   * @throws {@link grpc.ServiceError} When the request fails
   */
  public unaryRequest<TFn extends keyof UnaryGrpcFunctions<TGrpcClient>>(
    fn: TFn,
    request: UnaryRequestType<TGrpcClient, TFn>,
    callOptions: GrpcCall = {}
  ): Promise<NonNullable<UnaryResponseType<TGrpcClient, TFn>>> {
    const { metadata, options } = callOptions;
    return new Promise((resolve, reject) => {
      (this.client[fn] as UnaryGrpcFunction<TGrpcClient, TFn>)(
        request,
        metadata ?? new grpc.Metadata(),
        options ?? {},
        (
          error: grpc.ServiceError | null,
          response: UnaryResponseType<TGrpcClient, TFn>
        ) => {
          if (error || !response) {
            reject(error);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  private attachReadListeners<TResponseType>(
    stream: grpc.ClientReadableStream<TResponseType>,
    onData: OnData<TResponseType>
  ) {
    stream.on("data", (chunk: TResponseType) => {
      onData(false, null, chunk);
    });

    stream.on("end", () => {
      onData(true, null, null);
    });

    stream.on("error", (error) => {
      onData(false, error, null);
    });
  }

  /**
   * Make a stream request to the gRPC server to read a streamed response
   *
   * @remarks
   *   Wrapper to access streams in the gRPC client for requests which return a
   *   stream. Provides a convenient interface to bind the onData callback at
   *   the same time as making the request.
   *
   *   When the onData callback is not provided you need to handle the stream
   *   events yourself.
   * @example
   *   Here is an example where the client streams data objects from the server.
   *   ```
   *   // Generated instance of the Request class for the call is available from the generated js file for the proto
   *   const request = new Empty();
   *   // readStreamFunction is the name of the function in the generated client
   *   client.read("readStreamFunction", request, { onData: (complete, error, chunk) => { ...handle data... } });
   *   ```
   *
   * @param fn Name of the stream request function
   * @param request Corresponding request object
   * @param callOptions {@link GrpcReadStreamCall} Optional object
   * @returns Read stream {@link grpc.GrpcReadStreamCall}
   */
  public serverStreamRequest<
    TFn extends keyof ReadableStreamFunctions<TGrpcClient>
  >(
    fn: TFn,
    request: ReadableStreamRequestType<TGrpcClient, TFn>,
    callOptions: GrpcReadStreamCall<TGrpcClient, TFn> = {}
  ): ReadStreamReturnType<TGrpcClient, TFn> {
    const { metadata, options, onData } = callOptions;
    const stream = (
      this.client[fn] as ReadableStreamGrpcFunction<TGrpcClient, TFn>
    )(request, metadata ?? new grpc.Metadata(), options ?? {});

    if (onData) this.attachReadListeners(stream, onData);
    return stream;
  }

  private writeAsync<TRequestType>(
    stream: grpc.ClientWritableStream<TRequestType>
  ): WriteAsyncCallback<TRequestType> {
    return (chunk: TRequestType): Promise<void> => {
      return new Promise((resolve) => {
        const result = stream.write(chunk);
        if (!result) {
          stream.once("drain", resolve);
        } else {
          process.nextTick(resolve);
        }
      });
    };
  }

  /**
   * Make a request to stream data to the server
   *
   * @remarks
   *   Wrapper to create a stream request to the gRPC server where the client
   *   streams data to the server. Provides a more convenient interface to write
   *   data to the stream.
   * @example
   *   Here is an example where the client streams data objects to the server.
   *   ```
   *   // Generated instance of the Request class for the call is available from the generated js file for the proto
   *   const request = new Data();
   *   // writeStreamFunction is the name of the function in the generated client
   *   const stream = client.write("writeStreamFunction", { onData: (error, chunk) => { ...handle responses... } });
   *   // Write data to the stream using promises
   *   await stream.writeAsync(request);
   *   ```
   *
   * @param fn Name of the stream request function
   * @param callOptions {@link GrpcCall} Optional object
   * @returns Write stream with additional "writeAsync" function
   *   {@link WriteStreamReturnType}
   */
  public clientStreamRequest<
    TFn extends keyof WriteableStreamFunctions<TGrpcClient>
  >(
    fn: TFn,
    onResponse: WriteStreamOnResponse<TGrpcClient, TFn>,
    callOptions: GrpcCall = {}
  ): WriteStreamReturnType<TGrpcClient, TFn> {
    const { metadata, options } = callOptions;
    const stream = (
      this.client[fn] as WriteableStreamGrpcFunction<TGrpcClient, TFn>
    )(metadata ?? new grpc.Metadata(), options ?? {}, onResponse);

    return {
      _stream: stream,
      write: this.writeAsync(stream),
      end: stream.end.bind(stream),
    };
  }

  /**
   * Create a duplex stream to the gRPC server to read and write data as a
   * stream
   *
   * @remarks
   *   Wrapper to create a duplex stream request to the gRPC server where the data
   *   can be streamed to and from the server. Provides a similar interface to a
   *   combination of both {@link GenericClient.read} and
   *   {@link GenericClient.write}.
   * @example
   *   Here is an example where the client streams data objects to the server and the server streams data objects back to the client.
   *   ```
   *   // Generated instance of the Request class for the call is available from the generated js file for the proto
   *   const request = new Data();
   *   // readWriteStreamFunction is the name of the function in the generated client
   *   const stream = client.readWrite("readWriteStreamFunction", { onData: (complete, error, chunk) => { ...handle data... } });
   *   // Write data to the stream using promises
   *   await stream.writeAsync(request);
   *   ```
   *
   * @param fn Name of the stream request function
   * @param callOptions {@link GrpcReadWriteStreamCall} Optional object
   * @returns Duplex stream with additional "writeAsync" function
   *   {@link ReadWriteStreamReturnType}
   */
  public duplexStreamRequest<
    TFn extends keyof DuplexStreamFunctions<TGrpcClient>
  >(
    fn: TFn,
    callOptions: GrpcReadWriteStreamCall<TGrpcClient, TFn> = {}
  ): ReadWriteStreamReturnType<TGrpcClient, TFn> {
    const { metadata, options, onData } = callOptions;
    const stream = (
      this.client[fn] as DuplexStreamGrpcFunction<TGrpcClient, TFn>
    )(metadata ?? new grpc.Metadata(), options ?? {});

    if (onData) this.attachReadListeners(stream, onData);
    return {
      _stream: stream,
      end: stream.end.bind(stream),
      write: this.writeAsync(stream),
    } as ReadWriteStreamReturnType<TGrpcClient, TFn>;
  }

  constructor(
    Client: GrpcClientClass<TGrpcClient>,
    clientConstructorArgs: GrpcClientConstructorArgs
  ) {
    const client = new Client(...clientConstructorArgs);
    this.client = client;
  }

  get _client() {
    return this.client;
  }
}
