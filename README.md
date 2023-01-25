# @lewnelson/grpc-ts

This library is an abstraction on [@grpc/grpc-js](https://github.com/grpc/grpc-node/tree/master) to provide a simpler interface for making requests from a gRPC client and generating fully typed gRPC clients from `.proto` files.

Go from this:

```typescript
client.getName(new GetNameRequest(), (error: Error | null, response: GetNameResponse | undefined) => {
  // handle response in callback
});
```

to this:

```typescript
const response = await client.unaryRequest("getName", new GetNameRequest());
```

## Install

```bash
npm install @lewnelson/grpc-ts
```

## Usage

### Generating clients

Recursively search `./path/to/protos` directory for `.proto` files and generate the output to `./path/to/output` directory.

```bash
npx grpc-ts generate ./path/to/protos ./path/to/output
```

Generating clients from a single `.proto` file.

```bash
npx grpc-ts generate ./path/to/protos/file.proto ./path/to/output
```

Generating clients from proto files, but not searching recursively.

```bash
npx grpc-ts generate --no-recursive ./path/to/protos ./path/to/output
```

The generator uses [grpc-tools](https://github.com/grpc/grpc-node/tree/master/packages/grpc-tools) to generate both TypeScript types and JavaScript code.

### Creating a client

```typescript
import * as grpc from "@grpc/grpc-js";
import { createClient } from "@lewnelson/grpc-ts";
import { GeneratedClient } from "./path/to/output/generated/generated_grpc_pb";

// Creating a client with insecure credentials
const client = createClient(GeneratedClient, "localhost:50051");

// Creating a client with SSL credentials
const client = createClient(
  GeneratedClient,
  "localhost:50051",
  { credentials: grpc.credentials.createSsl() }
);

```

### Making unary requests

All unary requests are available on `client.unaryRequest`. The first argument is the name of the method to call. Only methods which return a `grpc.ClientUnaryCall` are available on `client.unaryRequest`. The second argument is the request object. This maps to the method name.

See [examples/unaryRequests.ts](./examples/unaryRequests.ts) for examples.

### Making server streaming requests

All server streaming requests are available on `client.serverStreamRequest`. The first argument is the name of the method to call. Only methods which return a `grpc.ClientReadableStream` are available on `client.serverStreamRequest`. The second argument is the request object. This maps to the method name.

See [examples/serverStreaming.ts](./examples/serverStreaming.ts) for examples.

### Making client streaming requests

All client streaming requests are available on `client.clientStreamRequest`. The first argument is the name of the method to call. Only methods which return a `grpc.ClientWritableStream` are available on `client.clientStreamRequest`. The second argument is the callback when the server makes the unary response.

See [examples/clientStreaming.ts](./examples/clientStreaming.ts) for examples.

### Making bidirectional streaming requests

All bidirectional streaming requests are available on `client.duplexStreamRequest`. The first argument is the name of the method to call. Only methods which return a `grpc.ClientDuplexStream` are available on `client.duplexStreamRequest`. Optionally you can bind a callback to read the server stream when calling the `client.duplexStreamRequest` function.

See [examples/bidirectionalStreaming.ts](./examples/bidirectionalStreaming.ts) for examples.
