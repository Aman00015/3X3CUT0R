import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { WorkflowNode } from "@/components/workflow-node";
import { NodeStatusIndicator } from "@/components/react-flow/node-status-indicator";
import Image from "next/image";

const conditionDataSchema = z.object({
  label: z.string(),
  expression: z.string(),
  routes: z.array(z.string()),
  rules: z.array(z.any()),
  evaluationMode: z.enum(['first_match', 'all_matches']),
  notes: z.string(),
});

export type ConditionData = z.infer<typeof conditionDataSchema>;

const DEFAULT_CONDITION_DATA: ConditionData = {
  label: 'Condition',
  expression: '',
  routes: ['true', 'false', 'default'],
  rules: [{ route: 'true', operator: 'equals', value: 'true' }],
  evaluationMode: 'first_match',
  notes: '',
};

export function ConditionNode({ id, data, selected }: any) {
  const { updateNodeData } = useReactFlow();
  const [panelOpen, setPanelOpen] = useState(false);
  const [routesInput, setRoutesInput] = useState('');

  const nodeData = { ...DEFAULT_CONDITION_DATA, ...data };

  const form = useForm<ConditionData>({
    resolver: zodResolver(conditionDataSchema),
    defaultValues: nodeData,
  });

  useEffect(() => {
    if (panelOpen) {
      form.reset(nodeData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelOpen]);

  const handleSubmit = (values: ConditionData) => {
    updateNodeData(id, values);
    setPanelOpen(false);
  };

  const handleRoutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const parts = val.split(',').map(s => s.trim().replace(/\s+/g, '_')).filter(s => s);
    if (!parts.includes('default')) parts.push('default');
    form.setValue('routes', [...new Set(parts)]);
  };

  const getPortColor = (route: string) => {
    if (route === 'true' || route === 'yes') return 'bg-green-500';
    if (route === 'false' || route === 'no') return 'bg-red-500';
    if (route === 'default') return 'bg-gray-500';
    return 'bg-amber-500';
  };

  const handleDelete = () => {
    // Basic delete
  };

  return (
    <>
      <WorkflowNode
        name={nodeData.label || "Condition"}
        description={nodeData.expression || "No expression"}
        onSettings={() => setPanelOpen(true)}
      >
        <NodeStatusIndicator status="initial" variant="border">
          <BaseNode status="initial" onDoubleClick={() => setPanelOpen(true)}>
            <BaseNodeContent>
              <Image src="/logos/branch.svg" alt="Condition icon" width={16} height={16} />
              
              <div className="flex flex-col gap-1 mt-2">
                {nodeData.routes.map((route, idx) => (
                  <div key={route} className="flex justify-end items-center relative h-5 pr-2">
                    <span className="text-[10px] text-muted-foreground mr-1 capitalize">{route}</span>
                    <BaseHandle 
                      id={`route_${route}`} 
                      type="source" 
                      position={Position.Right} 
                      className={`w-2 h-2 ${getPortColor(route)}`} 
                      style={{ right: -8, top: '50%' }}
                    />
                  </div>
                ))}
              </div>

              <BaseHandle
                id="target-1"
                type="target"
                position={Position.Left}
              />
            </BaseNodeContent>
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>

      <Dialog open={panelOpen} onOpenChange={setPanelOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Condition Config</DialogTitle>
            <DialogDescription>Configure routing logic.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Node Label</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expression"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expression</FormLabel>
                    <FormControl><Textarea className="font-mono min-h-[60px]" placeholder="{{data.budget}} > 5000" {...field} /></FormControl>
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Routes (comma separated)</FormLabel>
                <FormControl>
                  <Input 
                    defaultValue={form.getValues('routes').join(', ')}
                    onChange={handleRoutesChange}
                  />
                </FormControl>
                <div className="text-xs text-muted-foreground mt-1">
                  Active routes: {form.watch('routes')?.join(', ')}
                </div>
              </FormItem>

              <FormField
                control={form.control}
                name="rules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rules JSON</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="font-mono min-h-[120px]" 
                        value={JSON.stringify(field.value, null, 2)}
                        onChange={(e) => {
                          try { field.onChange(JSON.parse(e.target.value)); } catch {}
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="evaluationMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evaluation Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="first_match">First Match</SelectItem>
                        <SelectItem value="all_matches">All Matches</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
