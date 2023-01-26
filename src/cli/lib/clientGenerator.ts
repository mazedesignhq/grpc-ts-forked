import ts from "typescript";
import { basename } from "path";

enum MethodType {
  unary = "unary",
  readableStream = "readableStream",
  writeableStream = "writeableStream",
  duplexStream = "duplexStream",
}

type ClientClassWithMethods = {
  name: string;
  methods: {
    methodName: string;
    type: MethodType;
  }[];
};

const getGenericMethod = (type: MethodType) => {
  switch (type) {
    case MethodType.unary:
      return "unaryRequest";
    case MethodType.readableStream:
      return "serverStreamRequest";
    case MethodType.writeableStream:
      return "clientStreamRequest";
    case MethodType.duplexStream:
      return "duplexStreamRequest";
  }
};

const getJavaScriptOutput = (
  clientClasses: ClientClassWithMethods[],
  grpcPbPath: string
) => {
  const grpcPbImport = basename(grpcPbPath, ".d.ts");
  return `const { createClient } = require("@lewnelson/grpc-ts");
const grpc = require("./${grpcPbImport}");

${clientClasses
  .map((clientClass) => {
    return `class ${clientClass.name} {
  constructor() {
    this.client = createClient(grpc.${clientClass.name}, ...arguments);
  }

  ${clientClass.methods
    .map(({ methodName, type }) => {
      return `${methodName}() {
    return this.client.${getGenericMethod(type)}("${methodName}", ...arguments);
  }`;
    })
    .join("\n\n  ")}
}

exports.${clientClass.name} = ${clientClass.name};
`;
  })
  .join("\n\n")}
    `;
};

export const generateClientDeclarationAndJavaScript = async (
  grpcPbPath: string
) => {
  const program = ts.createProgram([grpcPbPath], {});
  const source = program.getSourceFile(grpcPbPath);
  if (!source) return;

  const createImport = (
    imports: ({ original?: string; name: string } | string)[],
    from: string
  ) => {
    return ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        false,
        undefined,
        ts.factory.createNamedImports(
          imports.map((importDefinition) => {
            let original: string | undefined;
            let name: string;
            if (typeof importDefinition === "string") {
              name = importDefinition;
            } else {
              original = importDefinition.original;
              name = importDefinition.name;
            }

            return ts.factory.createImportSpecifier(
              false,
              original ? ts.factory.createIdentifier(original) : undefined,
              ts.factory.createIdentifier(name)
            );
          })
        )
      ),
      ts.factory.createStringLiteral(from)
    );
  };

  const hasSomeOf = (classes: ClientClassWithMethods[], type: MethodType) => {
    return classes.some((clientClass) =>
      clientClass.methods.some((method) => method.type === type)
    );
  };

  const getRequestType = (type: MethodType): string => {
    switch (type) {
      case MethodType.unary:
        return "UnaryRequest";
      case MethodType.readableStream:
        return "ReadableStreamRequest";
      case MethodType.writeableStream:
        return "WriteableStreamRequest";
      case MethodType.duplexStream:
        return "DuplexStreamRequest";
    }
  };

  const createInterface = (clientClass: ClientClassWithMethods) => {
    const members = clientClass.methods.map(({ methodName, type }) => {
      return ts.factory.createPropertySignature(
        undefined,
        methodName,
        undefined,
        ts.factory.createTypeReferenceNode(getRequestType(type), [
          ts.factory.createTypeReferenceNode(
            `grpc_${clientClass.name}`,
            undefined
          ),
          ts.factory.createLiteralTypeNode(
            ts.factory.createStringLiteral(methodName)
          ),
        ])
      );
    });

    return ts.factory.createInterfaceDeclaration(
      ts.factory.createModifiersFromModifierFlags(ts.ModifierFlags.Export),
      `I${clientClass.name}`,
      undefined,
      undefined,
      members
    );
  };

  const createClass = (clientClass: ClientClassWithMethods) => {
    const members = clientClass.methods.map(({ methodName, type }) => {
      return ts.factory.createPropertyDeclaration(
        undefined,
        methodName,
        undefined,
        ts.factory.createTypeReferenceNode(getRequestType(type), [
          ts.factory.createTypeReferenceNode(
            `grpc_${clientClass.name}`,
            undefined
          ),
          ts.factory.createLiteralTypeNode(
            ts.factory.createStringLiteral(methodName)
          ),
        ]),
        undefined
      );
    });

    return ts.factory.createClassDeclaration(
      ts.factory.createModifiersFromModifierFlags(ts.ModifierFlags.Export),
      clientClass.name,
      undefined,
      [
        ts.factory.createHeritageClause(ts.SyntaxKind.ImplementsKeyword, [
          ts.factory.createExpressionWithTypeArguments(
            ts.factory.createIdentifier(`I${clientClass.name}`),
            undefined
          ),
        ]),
      ],
      [
        ts.factory.createConstructorDeclaration(
          undefined,
          [
            ts.factory.createParameterDeclaration(
              undefined,
              undefined,
              "address",
              undefined,
              ts.factory.createIndexedAccessTypeNode(
                ts.factory.createTypeReferenceNode("Parameters", [
                  ts.factory.createTypeQueryNode(
                    ts.factory.createIdentifier("createClient")
                  ),
                ]),
                ts.factory.createLiteralTypeNode(
                  ts.factory.createNumericLiteral("1")
                )
              )
            ),
            ts.factory.createParameterDeclaration(
              undefined,
              undefined,
              "options",
              ts.factory.createToken(ts.SyntaxKind.QuestionToken),
              ts.factory.createIndexedAccessTypeNode(
                ts.factory.createTypeReferenceNode("Parameters", [
                  ts.factory.createTypeQueryNode(
                    ts.factory.createIdentifier("createClient")
                  ),
                ]),
                ts.factory.createLiteralTypeNode(
                  ts.factory.createNumericLiteral("2")
                )
              )
            ),
          ],
          undefined
        ),
        ...members,
      ]
    );
  };

  const extendsGrpcClient = (node: ts.ClassLikeDeclaration) => {
    return node.heritageClauses?.some((clause) => {
      return clause.types.some((type) => {
        return type.expression.getText(source) === "grpc.Client";
      });
    });
  };

  const isClientClassNode = (
    node: ts.Node
  ): node is ts.ClassLikeDeclaration => {
    if (!ts.isClassLike(node)) return false;
    if (!extendsGrpcClient(node)) return false;
    return true;
  };

  const isMethodReturningType =
    (returnType: string) => (node: ts.MethodDeclaration) => {
      if (!node.type || !ts.isTypeReferenceNode(node.type)) return false;
      return node.type.typeName.getText(source) === returnType;
    };

  const getMethodsMatchingReturnType = (
    node: ts.ClassLikeDeclaration,
    returnType: string
  ) => {
    const matchesReturnType = isMethodReturningType(returnType);
    return node.members.reduce((methods, member) => {
      if (!ts.isMethodDeclaration(member)) return methods;
      if (!matchesReturnType(member)) return methods;
      if (
        methods.some(
          (existingMethod) =>
            existingMethod.name.getText(source) === member.name.getText(source)
        )
      ) {
        return methods;
      }

      return [...methods, member];
    }, [] as ts.MethodDeclaration[]);
  };

  const findClientClassNodes = () => {
    const classes: ClientClassWithMethods[] = [];
    ts.forEachChild(source, (node) => {
      if (!isClientClassNode(node)) return;
      if (!node.name) return;
      classes.push({
        name: node.name.getText(source),
        methods: [
          ...(
            getMethodsMatchingReturnType(node, "grpc.ClientUnaryCall") || []
          ).map((method) => ({
            methodName: method.name.getText(source),
            type: MethodType.unary,
          })),
          ...(
            getMethodsMatchingReturnType(node, "grpc.ClientReadableStream") ||
            []
          ).map((method) => ({
            methodName: method.name.getText(source),
            type: MethodType.readableStream,
          })),
          ...(
            getMethodsMatchingReturnType(node, "grpc.ClientWritableStream") ||
            []
          ).map((method) => ({
            methodName: method.name.getText(source),
            type: MethodType.writeableStream,
          })),
          ...(
            getMethodsMatchingReturnType(node, "grpc.ClientDuplexStream") || []
          ).map((method) => ({
            methodName: method.name.getText(source),
            type: MethodType.duplexStream,
          })),
        ],
      });
    });

    return classes;
  };

  const clientClasses = findClientClassNodes();
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  const grpcTSImports = ["createClient"];
  const grpcImportsMap: [MethodType, string][] = [
    [MethodType.unary, "UnaryRequest"],
    [MethodType.readableStream, "ReadableStreamRequest"],
    [MethodType.writeableStream, "WriteableStreamRequest"],
    [MethodType.duplexStream, "DuplexStreamRequest"],
  ];

  grpcImportsMap.forEach(([type, importName]) => {
    if (hasSomeOf(clientClasses, type)) {
      grpcTSImports.push(importName);
    }
  });

  const genericImportClause = createImport(grpcTSImports, "@lewnelson/grpc-ts");
  const statements: ts.Statement[][] = [[genericImportClause]];

  const pushToStatement = (
    newline: boolean,
    ...statementsToPush: ts.Statement[]
  ) => {
    if (newline) {
      statements.push([...statementsToPush]);
    } else {
      statements[statements.length - 1].push(...statementsToPush);
    }
  };

  const classImports = clientClasses.map((clientClass) => ({
    original: clientClass.name,
    name: `grpc_${clientClass.name}`,
  }));

  pushToStatement(
    false,
    createImport(classImports, `./${basename(grpcPbPath, ".d.ts")}`)
  );

  clientClasses.forEach((clientClass) => {
    pushToStatement(true, createInterface(clientClass));
    pushToStatement(true, createClass(clientClass));
  });

  const declarationOutput = statements
    .map((statements) => {
      const source = ts.factory.createSourceFile(
        statements,
        ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None
      );

      return printer.printFile(source);
    })
    .join("\n");

  const javascriptOutput = getJavaScriptOutput(clientClasses, grpcPbPath);
  const fileComment =
    "// This file was generated using @lewnelson/grpc-ts\n// Do not modify this file directly\n\n";

  return {
    declaration: `${fileComment}${declarationOutput}`,
    javascript: `${fileComment}${javascriptOutput}`,
  };
};
