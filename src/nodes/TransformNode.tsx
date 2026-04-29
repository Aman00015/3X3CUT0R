import React, { useState, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { BaseExecutionNode } from '@/features/executions/components/base-execution-node';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const transformDataSchema = z.object({
  label: z.string().default('Transform'),
  outputVariable: z.string().optional().default(''),
  templateExpression: z.string().min(1, { message: "Expression is required" }),
  notes: z.string().default(''),
});

type TransformData = z.infer<typeof transformDataSchema>;

export function TransformNode({ id, data, selected }: any) {
  const [panelOpen, setPanelOpen] = useState(false);
  const { updateNodeData } = useReactFlow();

  // Parse data with defaults
  const nodeData = transformDataSchema.parse(data || {});

  const form = useForm<TransformData>({
    resolver: zodResolver(transformDataSchema),
    defaultValues: nodeData,
  });

  useEffect(() => {
    if (panelOpen) {
      form.reset(nodeData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelOpen]);

  const handleSubmit = (values: TransformData) => {
    updateNodeData(id, values);
    setPanelOpen(false);
  };

  const description = nodeData.outputVariable 
    ? `Output: {${nodeData.outputVariable}.data}`
    : "Data transformation node";

  return (
    <>
      <BaseExecutionNode
        {...({ id, data, selected } as any)}
        icon="/logos/transform.svg"
        name={nodeData.label || "Transform"}
        description={description}
        onSettings={() => setPanelOpen(true)}
        onDoubleClick={() => setPanelOpen(true)}
      />

      <Dialog open={panelOpen} onOpenChange={setPanelOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Transform Configuration</DialogTitle>
            <DialogDescription>Configure data transformation template</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Node Label</FormLabel>
                    <FormControl>
                      <Input placeholder="Transform" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="outputVariable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Output Variable Name (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. transformed" {...field} />
                    </FormControl>
                    <FormDescription>
                      Reference this output in later nodes as {`{${field.value || 'transformed'}.data}`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="templateExpression"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Expression</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='{"name": "{webhook.payload.name}", "email": "{webhook.payload.email}"}'
                        className="min-h-[150px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Use {`{variable.path}`} syntax to reference data from previous nodes. The result will be parsed as JSON if valid.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {Object.keys(form.formState.errors).length > 0 && (
                <Alert variant="destructive" className="bg-amber-950/20 border-amber-900 text-amber-500">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Required fields missing</AlertTitle>
                  <AlertDescription>
                    Please fill in: {form.formState.errors.templateExpression ? 'Expression' : 'All required fields'}
                  </AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button type="submit" className="w-full bg-[#5c2d2d] hover:bg-[#4a2424] text-white border-none">
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
