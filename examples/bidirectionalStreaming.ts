import { createClient } from "@lewnelson/grpc-ts";
import { ExampleClient } from "./generated/example/example_grpc_pb";
import { ChatRequest, ChatResponse } from "./generated/example/example_pb";

// Creates client with insecure credentials
const client = createClient(ExampleClient, "localhost:50051");

// Basic implementation
(async () => {
  const stream = client.duplexStreamRequest("chat", {
    onData: (
      complete: boolean,
      error: Error | null,
      chunk: ChatResponse | null
    ) => {
      // When the server streams data to the client
      if (complete) {
        // Stream was ended by the server
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
        chunk.getUserId();
      }
    },
  });

  // Create a request to stream to the server
  const request = new ChatRequest();
  request.setUserId("id");
  request.setMessage("Hello");

  // Stream the message to the server
  await stream.write(request);

  // End the stream on the client
  stream.end();
})();

// Advanced usage
(async () => {
  // Create the stream without binding a callback
  const stream = client.duplexStreamRequest("chat");

  // Access the underlying grpc-js Duplex stream
  stream._stream.on("data", (chunk: unknown) => {
    // Handle data from the server
    (chunk as ChatResponse).getMessage();
  });

  // Write data via the underlying grpc-js Duplex stream
  stream._stream.write(new ChatRequest());
})();
