// This file was generated using @lewnelson/grpc-ts
// Do not modify this file directly

const { createClient } = require("@lewnelson/grpc-ts");
const grpc = require("./example_grpc_pb");

class ExampleClient {
  constructor() {
    this.client = createClient(grpc.ExampleClient, ...arguments);
  }

  getName() {
    return this.client.unaryRequest("getName", ...arguments);
  }

  streamMessages() {
    return this.client.serverStreamRequest("streamMessages", ...arguments);
  }

  emitMessages() {
    return this.client.clientStreamRequest("emitMessages", ...arguments);
  }

  chat() {
    return this.client.duplexStreamRequest("chat", ...arguments);
  }
}

exports.ExampleClient = ExampleClient;

    