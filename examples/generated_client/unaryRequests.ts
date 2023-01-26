import { Metadata, ServiceError } from "@grpc/grpc-js";
import { ExampleClient } from "../generated/example";
import { GetNameRequest } from "../generated/example/example_pb";

// Creates client with insecure credentials
const client = new ExampleClient("localhost:50051");

// Making a basic request
(async () => {
  // Create the request
  const request = new GetNameRequest();
  request.setId("id");

  try {
    // Make the request
    const response = await client.getName(request);
    // Do something with the response
    response.getName();
  } catch (error) {
    // Handle the error
    const grpcError = error as ServiceError;
    // grpc.status
    grpcError.code;
    // Error message
    grpcError.message;
  }
})();

// Specifying metadata and call options
(async () => {
  // Create the request
  const request = new GetNameRequest();
  request.setId("id");

  try {
    // Make the request
    const response = await client.getName(request, {
      metadata: new Metadata({ cacheableRequest: true }),
      options: {
        // Specify a deadline on the request 10 seconds from now
        deadline: new Date(Date.now() + 10e3),
      },
    });

    // Do something with the response
    response.getName();
  } catch (error) {
    // Handle the error
  }
})();
