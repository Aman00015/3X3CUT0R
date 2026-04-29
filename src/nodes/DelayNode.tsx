import React, { useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { BaseExecutionNode } from '@/features/executions/components/base-execution-node';
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const delayDataSchema = z.object({
  label: z.string().default('Delay'),
  mode: z.enum(['fixed', 'until', 'condition']).default('fixed'),
  hours: z.number().default(0),
  minutes: z.number().default(5),
  seconds: z.number().default(0),
  untilDate: z.string().default(''),
  untilTime: z.string().default(''),
  timezone: z.string().default('auto'),
  resumeCondition: z.string().default('business_hours'),
  maxWaitHours: z.number().nullable().default(null),
  passThroughData: z.boolean().default(true),
  appendMetadata: z.boolean().default(false),
  isWaiting: z.boolean().default(false),
  notes: z.string().default(''),
});

export type DelayData = z.infer<typeof delayDataSchema>;

export function DelayNode({ id, data, selected }: any) {
  const { updateNodeData } = useReactFlow();
  const [panelOpen, setPanelOpen] = useState(false);

  const nodeData = delayDataSchema.parse(data || {});

  const form = useForm<DelayData>({
    resolver: zodResolver(delayDataSchema),
    defaultValues: nodeData,
  });

  useEffect(() => {
    if (panelOpen) {
      form.reset(nodeData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelOpen]);

  const handleSubmit = (values: DelayData) => {
    updateNodeData(id, values);
    setPanelOpen(false);
  };

  const getDelaySummary = () => {
    if (nodeData.mode === 'fixed') {
      return `Wait ${nodeData.hours}h ${nodeData.minutes}m ${nodeData.seconds}s`;
    }
    if (nodeData.mode === 'until') {
      return `Wait until ${nodeData.untilDate} ${nodeData.untilTime}`;
    }
    return `Wait for ${nodeData.resumeCondition.replace('_', ' ')}`;
  };

  return (
    <>
      <BaseExecutionNode
        {...({ id, data, selected } as any)}
        icon="/logos/delay.svg"
        name={nodeData.label || "Delay"}
        description={getDelaySummary()}
        onSettings={() => setPanelOpen(true)}
        onDoubleClick={() => setPanelOpen(true)}
      />

      <Dialog open={panelOpen} onOpenChange={setPanelOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delay Config</DialogTitle>
            <DialogDescription>Configure how long this node should wait.</DialogDescription>
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
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delay Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Duration</SelectItem>
                        <SelectItem value="until">Wait Until Specific Time</SelectItem>
                        <SelectItem value="condition">Wait Until Condition (Smart Delay)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {form.watch('mode') === 'fixed' && (
                <div className="grid grid-cols-3 gap-2">
                  <FormField control={form.control} name="hours" render={({ field }) => (
                    <FormItem><FormLabel>Hours</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value)||0)} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="minutes" render={({ field }) => (
                    <FormItem><FormLabel>Minutes</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value)||0)} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="seconds" render={({ field }) => (
                    <FormItem><FormLabel>Seconds</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value)||0)} /></FormControl></FormItem>
                  )} />
                </div>
              )}

              {form.watch('mode') === 'until' && (
                <div className="grid grid-cols-2 gap-2">
                  <FormField control={form.control} name="untilDate" render={({ field }) => (
                    <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="untilTime" render={({ field }) => (
                    <FormItem><FormLabel>Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>
                  )} />
                </div>
              )}

              {form.watch('mode') === 'condition' && (
                <FormField
                  control={form.control}
                  name="resumeCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="business_hours">Business Hours (Mon-Fri 9-5)</SelectItem>
                          <SelectItem value="end_of_day">End of Day</SelectItem>
                          <SelectItem value="next_week">Start of Next Week</SelectItem>
                          <SelectItem value="next_month">Start of Next Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="maxWaitHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Wait Cap (Hours, Optional)</FormLabel>
                    <FormControl><Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)} /></FormControl>
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
