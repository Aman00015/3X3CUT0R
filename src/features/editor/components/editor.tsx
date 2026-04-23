"use client";

import { type MouseEvent, useState, useCallback, useMemo } from 'react';
import { 
  ReactFlow, 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  Background,
  Controls,
  MiniMap,
  Panel,
} from '@xyflow/react';
import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";

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

  const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
  const [edges, setEdges] = useState<Edge[]>(workflow.edges);
  const [outputPanelOpen, setOutputPanelOpen] = useState(false);
  const [selectedOutputNodeId, setSelectedOutputNodeId] = useState<string | null>(null);
  const latestExecution = useLatestExecutionByWorkflow(workflowId, outputPanelOpen);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

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
    return nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER);
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
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeComponents}
        onInit={setEditor}
        fitView
        snapGrid={[10, 10]}
        snapToGrid
        panOnScroll
        panOnDrag={false}
        selectionOnDrag
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right">
          <AddNodeButton />
        </Panel>
        {hasManualTrigger && (
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
