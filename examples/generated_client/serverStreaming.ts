import { Metadata } from "@grpc/grpc-js";
import { ExampleClient } from "../generated/example";
import {
  StreamMessagesRequest,
  StreamMessagesResponse,
} from "../generated/example/example_pb";

// Creates client with insecure credentials
const client = new ExampleClient("localhost:50051");

// Making a basic request
(() => {
  // Create the request
  const request = new StreamMessagesRequest();
  request.setId("id");

  // Make the request
  client.streamMessages(request, {
    onData: (
      complete: boolean,
      error: Error | null,
      chunk: StreamMessagesResponse | null
    ) => {
      if (complete) {
        // The stream has been ended by the server
        return;
      }

      if (error) {
        // The server emitted an error. This may or may not be
        // a grpc.ServiceError, the type is taken from the
        // @grpc/grpc-js library
      }

      if (chunk) {
        // Do something with the response
        chunk.getMessage();
      }
    },
  });
})();

// Advanced usage
(() => {
  // Create the request
  const request = new StreamMessagesRequest();
  request.setId("id");

  // Make the request specifying metadata and call options
  const stream = client.streamMessages(request, {
    metadata: new Metadata({ cacheableRequest: true }),
    options: { deadline: new Date(Date.now() + 10e3) },
  });

  // Access to the stream object exposed by @grpc/grpc-js
  stream.on("data", (chunk: unknown) => {
    // Handle data
    (chunk as StreamMessagesResponse).getMessage();
  });

  // End the stream from the client
  stream.emit("end");
})();
