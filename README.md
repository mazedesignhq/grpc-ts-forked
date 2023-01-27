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
const response = await client.getName(new GetNameRequest());
```

## Install

Ensure you also install `@grpc/grpc-js` as a peer dependency.

```bash
npm install @lewnelson/grpc-ts @grpc/grpc-js@^1.8.4
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
import { GeneratedClient } from "./path/to/output/generated/client";

// Creating a client with insecure credentials
const client = new GeneratedClient("localhost:50051");

// Creating a client with SSL credentials
const client = new GeneratedClient(
  "localhost:50051",
  { credentials: grpc.credentials.createSsl() }
);

```

For full usage see [Examples](./examples/README.md).