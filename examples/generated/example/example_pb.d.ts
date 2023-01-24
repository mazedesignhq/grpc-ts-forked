// package: example
// file: example.proto

import * as jspb from "google-protobuf";

export class GetNameRequest extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetNameRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetNameRequest): GetNameRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetNameRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetNameRequest;
  static deserializeBinaryFromReader(message: GetNameRequest, reader: jspb.BinaryReader): GetNameRequest;
}

export namespace GetNameRequest {
  export type AsObject = {
    id: string,
  }
}

export class GetNameResponse extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetNameResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetNameResponse): GetNameResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetNameResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetNameResponse;
  static deserializeBinaryFromReader(message: GetNameResponse, reader: jspb.BinaryReader): GetNameResponse;
}

export namespace GetNameResponse {
  export type AsObject = {
    name: string,
  }
}

export class StreamMessagesRequest extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamMessagesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StreamMessagesRequest): StreamMessagesRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StreamMessagesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamMessagesRequest;
  static deserializeBinaryFromReader(message: StreamMessagesRequest, reader: jspb.BinaryReader): StreamMessagesRequest;
}

export namespace StreamMessagesRequest {
  export type AsObject = {
    id: string,
  }
}

export class StreamMessagesResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamMessagesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: StreamMessagesResponse): StreamMessagesResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StreamMessagesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamMessagesResponse;
  static deserializeBinaryFromReader(message: StreamMessagesResponse, reader: jspb.BinaryReader): StreamMessagesResponse;
}

export namespace StreamMessagesResponse {
  export type AsObject = {
    message: string,
  }
}

export class EmitMessagesRequest extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EmitMessagesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: EmitMessagesRequest): EmitMessagesRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EmitMessagesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EmitMessagesRequest;
  static deserializeBinaryFromReader(message: EmitMessagesRequest, reader: jspb.BinaryReader): EmitMessagesRequest;
}

export namespace EmitMessagesRequest {
  export type AsObject = {
    message: string,
  }
}

export class EmitMessagesResponse extends jspb.Message {
  getMessagesProcessed(): number;
  setMessagesProcessed(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EmitMessagesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: EmitMessagesResponse): EmitMessagesResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EmitMessagesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EmitMessagesResponse;
  static deserializeBinaryFromReader(message: EmitMessagesResponse, reader: jspb.BinaryReader): EmitMessagesResponse;
}

export namespace EmitMessagesResponse {
  export type AsObject = {
    messagesProcessed: number,
  }
}

export class ChatRequest extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): void;

  getUserId(): string;
  setUserId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChatRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ChatRequest): ChatRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChatRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChatRequest;
  static deserializeBinaryFromReader(message: ChatRequest, reader: jspb.BinaryReader): ChatRequest;
}

export namespace ChatRequest {
  export type AsObject = {
    message: string,
    userId: string,
  }
}

export class ChatResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): void;

  getUserId(): string;
  setUserId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChatResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ChatResponse): ChatResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChatResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChatResponse;
  static deserializeBinaryFromReader(message: ChatResponse, reader: jspb.BinaryReader): ChatResponse;
}

export namespace ChatResponse {
  export type AsObject = {
    message: string,
    userId: string,
  }
}

