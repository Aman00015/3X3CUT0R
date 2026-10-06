"use client";

import { type MouseEvent, useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  type Node,
  Background,
  Controls,
  MiniMap,
  Panel,
} from '@xyflow/react';
import { useLiveblocksFlow, Cursors } from '@liveblocks/react-flow';
import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';

import '@xyflow/react/dist/style.css';
import { nodeComponents } from '@/config/node-components';
import { AddNodeButton } from './add-node-button';
import { useSetAtom } from 'jotai';
import { editorAtom } from '../store/atoms';
import { NodeType } from '@/generated/prisma';
import { ExecuteWorkflowButton } from './execute-workflow-button';
import { useLatestExecutionByWorkflow } from '@/features/executions/hooks/use-executions';
import { OutputViewerDrawer } from './output-viewer-drawer';
import { detectFormat, type StructuredNodeOutput } from '@/features/executions/lib/structured-output';

// Removed OUTPUT_NODE_TYPE

const getNodeOutputFromExecution = (
  executionOutput: unknown,
  nodeId: string | null,
): StructuredNodeOutput | null => {
  if (!executionOutput || typeof executionOutput !== 'object' || !nodeId) {
    return null;
  }

  const outputRecord = executionOutput as Record<string, unknown>;
  const outputNodes = outputRecord.__outputNodes;

  if (!outputNodes || typeof outputNodes !== 'object') {
    return null;
  }

  const nodeOutput = (outputNodes as Record<string, unknown>)[nodeId];

  if (!nodeOutput) {
    return null;
  }

  return detectFormat(nodeOutput);
};

export const EditorLoading = () => {
  return <LoadingView message="Loading editor..." />;
};

export const EditorError = () => {
  return <ErrorView message="Error loading editor" />;
};

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const {
    data: workflow
  } = useSuspenseWorkflow(workflowId);

  const setEditor = useSetAtom(editorAtom);

  // Determine role: owner, editor, or viewer
  const trpc = useTRPC();
  const accessQuery = useQuery(trpc.shares.myAccess.queryOptions({ workflowId }));
  const role = accessQuery.data?.role ?? 'OWNER';
  const isViewer = role === 'VIEWER';

  // Liveblocks: shared nodes & edges synced across all users in the room
  // Viewers must NOT pass initialNodes — writing to storage is forbidden for READ_ACCESS users
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useLiveblocksFlow(
    isViewer
      ? {} // viewer: read from existing storage, don't seed it
      : { initialNodes: workflow.nodes as Node[], initialEdges: workflow.edges },
  );

  const [outputPanelOpen, setOutputPanelOpen] = useState(false);
  const [selectedOutputNodeId, setSelectedOutputNodeId] = useState<string | null>(null);
  const latestExecution = useLatestExecutionByWorkflow(workflowId, outputPanelOpen);

  const onNodeDoubleClick = useCallback(
    (_: MouseEvent, node: Node) => {
      if (node.type !== NodeType.OUTPUT) {
        return;
      }

      setSelectedOutputNodeId(node.id);
      setOutputPanelOpen(true);
    },
    [],
  );

  const hasManualTrigger = useMemo(() => {
    return nodes?.some((node) => node.type === NodeType.MANUAL_TRIGGER) ?? false;
  }, [nodes]);

  const selectedNodeOutput = useMemo(() => {
    return getNodeOutputFromExecution(
      latestExecution.data?.output,
      selectedOutputNodeId,
    );
  }, [latestExecution.data?.output, selectedOutputNodeId]);

  return (
    <div className='size-full'>
      <ReactFlow
        nodes={nodes ?? []}
        edges={edges ?? []}
        onNodesChange={isViewer ? undefined : onNodesChange}
        onEdgesChange={isViewer ? undefined : onEdgesChange}
        onConnect={isViewer ? undefined : onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        nodesDraggable={!isViewer}
        nodesConnectable={!isViewer}
        elementsSelectable={!isViewer}
        nodeTypes={nodeComponents}
        onInit={setEditor}
        fitView
        snapGrid={[10, 10]}
        snapToGrid
        panOnScroll
        panOnDrag={false}
        selectionOnDrag={!isViewer}
      >
        {/* Live cursors — small custom SVG cursors for each connected user */}
        <div className="[&_.lb-cursor-svg]:!w-4 [&_.lb-cursor-svg]:!h-4">
          <Cursors />
        </div>
        <Background />
        <Controls />
        <MiniMap />
        {/* Viewer badge */}
        {isViewer && (
          <Panel position="top-left">
            <div className="flex items-center gap-1.5 rounded-full bg-background/80 backdrop-blur border px-3 py-1 text-xs text-muted-foreground shadow-sm">
              <Eye className="h-3 w-3" />
              View only
            </div>
          </Panel>
        )}
        {!isViewer && (
          <Panel position="top-right">
            <AddNodeButton />
          </Panel>
        )}
        {hasManualTrigger && !isViewer && (
          <Panel position="bottom-center">
            <ExecuteWorkflowButton workflowId={workflowId} />
          </Panel>
        )}
      </ReactFlow>
      <OutputViewerDrawer
        open={outputPanelOpen}
        onOpenChange={setOutputPanelOpen}
        nodeId={selectedOutputNodeId}
        output={selectedNodeOutput}
      />
    </div>
  );
};
