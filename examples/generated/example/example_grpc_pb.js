// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var example_pb = require('./example_pb.js');

function serialize_example_ChatRequest(arg) {
  if (!(arg instanceof example_pb.ChatRequest)) {
    throw new Error('Expected argument of type example.ChatRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_example_ChatRequest(buffer_arg) {
  return example_pb.ChatRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_example_ChatResponse(arg) {
  if (!(arg instanceof example_pb.ChatResponse)) {
    throw new Error('Expected argument of type example.ChatResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_example_ChatResponse(buffer_arg) {
  return example_pb.ChatResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_example_EmitMessagesRequest(arg) {
  if (!(arg instanceof example_pb.EmitMessagesRequest)) {
    throw new Error('Expected argument of type example.EmitMessagesRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_example_EmitMessagesRequest(buffer_arg) {
  return example_pb.EmitMessagesRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_example_EmitMessagesResponse(arg) {
  if (!(arg instanceof example_pb.EmitMessagesResponse)) {
    throw new Error('Expected argument of type example.EmitMessagesResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_example_EmitMessagesResponse(buffer_arg) {
  return example_pb.EmitMessagesResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_example_GetNameRequest(arg) {
  if (!(arg instanceof example_pb.GetNameRequest)) {
    throw new Error('Expected argument of type example.GetNameRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_example_GetNameRequest(buffer_arg) {
  return example_pb.GetNameRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_example_GetNameResponse(arg) {
  if (!(arg instanceof example_pb.GetNameResponse)) {
    throw new Error('Expected argument of type example.GetNameResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_example_GetNameResponse(buffer_arg) {
  return example_pb.GetNameResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_example_StreamMessagesRequest(arg) {
  if (!(arg instanceof example_pb.StreamMessagesRequest)) {
    throw new Error('Expected argument of type example.StreamMessagesRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_example_StreamMessagesRequest(buffer_arg) {
  return example_pb.StreamMessagesRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_example_StreamMessagesResponse(arg) {
  if (!(arg instanceof example_pb.StreamMessagesResponse)) {
    throw new Error('Expected argument of type example.StreamMessagesResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_example_StreamMessagesResponse(buffer_arg) {
  return example_pb.StreamMessagesResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var ExampleService = exports.ExampleService = {
  // Unary RPC
getName: {
    path: '/example.Example/GetName',
    requestStream: false,
    responseStream: false,
    requestType: example_pb.GetNameRequest,
    responseType: example_pb.GetNameResponse,
    requestSerialize: serialize_example_GetNameRequest,
    requestDeserialize: deserialize_example_GetNameRequest,
    responseSerialize: serialize_example_GetNameResponse,
    responseDeserialize: deserialize_example_GetNameResponse,
  },
  // Server streaming RPC
streamMessages: {
    path: '/example.Example/StreamMessages',
    requestStream: false,
    responseStream: true,
    requestType: example_pb.StreamMessagesRequest,
    responseType: example_pb.StreamMessagesResponse,
    requestSerialize: serialize_example_StreamMessagesRequest,
    requestDeserialize: deserialize_example_StreamMessagesRequest,
    responseSerialize: serialize_example_StreamMessagesResponse,
    responseDeserialize: deserialize_example_StreamMessagesResponse,
  },
  // Client streaming RPC
emitMessages: {
    path: '/example.Example/EmitMessages',
    requestStream: true,
    responseStream: false,
    requestType: example_pb.EmitMessagesRequest,
    responseType: example_pb.EmitMessagesResponse,
    requestSerialize: serialize_example_EmitMessagesRequest,
    requestDeserialize: deserialize_example_EmitMessagesRequest,
    responseSerialize: serialize_example_EmitMessagesResponse,
    responseDeserialize: deserialize_example_EmitMessagesResponse,
  },
  // Bidirectional streaming RPC
chat: {
    path: '/example.Example/Chat',
    requestStream: true,
    responseStream: true,
    requestType: example_pb.ChatRequest,
    responseType: example_pb.ChatResponse,
    requestSerialize: serialize_example_ChatRequest,
    requestDeserialize: deserialize_example_ChatRequest,
    responseSerialize: serialize_example_ChatResponse,
    responseDeserialize: deserialize_example_ChatResponse,
  },
};

exports.ExampleClient = grpc.makeGenericClientConstructor(ExampleService);
