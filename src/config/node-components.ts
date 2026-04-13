import { InitialNode } from "@/components/initial-node";
import { NodeType } from "@/generated/prisma";
import { NodeTypes } from "@xyflow/react";

export const nodeComponents={
    [NodeType.INTIAL] : InitialNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;