import { credentials, Metadata, ServiceError } from "@grpc/grpc-js";
import { ExampleClient } from "../generated/example";
import {
  EmitMessagesRequest,
  EmitMessagesResponse,
} from "../generated/example/example_pb";

// Creates client with insecure credentials
const client = new ExampleClient("localhost:50051");

// Making a basic request
(async () => {
  const stream = client.emitMessages(
    (error: ServiceError | null, response?: EmitMessagesResponse) => {
      if (error) {
        // Server responded with an error
      } else if (response) {
        // Server responded with a response
        response.getMessagesProcessed();
      }
    }
  );

  // Create a request to stream to the server
  const request = new EmitMessagesRequest();
  request.setMessage("message one");

  // Stream the request to the server
  await stream.write(request);

  // Once we've streamed all of the data we want to send, we can end the stream.
  // Generally the server implementation would respond with the unary response
  // at this point triggering our initial callback as the second argument to
  // client.clientStreamRequest
  stream.end();
})();

// Advanced usage
(async () => {
  const stream = client.emitMessages(
    (error: ServiceError | null, response?: EmitMessagesResponse) => {
      if (error) {
        // Server responded with an error
      } else if (response) {
        // Server responded with a response
        response.getMessagesProcessed();
      }
    },
    // Specify metadata and call options
    {
      metadata: new Metadata({ cacheableRequest: true }),
      options: {
        credentials: credentials.createEmpty(),
      },
    }
  );

  // Create a request to stream to the server
  const request = new EmitMessagesRequest();
  request.setMessage("message one");

  // Accessing the underlying grpc.ClientWritableStream
  stream._stream.write(request);

  // End the stream
  stream._stream.end();
})();
