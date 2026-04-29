import React, { useState, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { BaseTriggerNode } from '@/features/triggers/components/base-trigger-node';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import cronstrue from 'cronstrue';
import parser from 'cron-parser';

const cronDataSchema = z.object({
  label: z.string().default('Daily Schedule'),
  mode: z.enum(['simple', 'advanced']).default('simple'),
  frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'yearly']).default('daily'),
  time: z.string().default('09:00'),
  timezone: z.string().default('auto'),
  active: z.boolean().default(true),
  maxExecutions: z.number().nullable().default(null),
  cronExpression: z.string().default('0 9 * * *'),
  notes: z.string().default(''),
});

export type CronData = z.infer<typeof cronDataSchema>;

export function CronTriggerNode({ id, data, selected }: any) {
  const { updateNodeData } = useReactFlow();
  const [panelOpen, setPanelOpen] = useState(false);
  const [nextRuns, setNextRuns] = useState<string[]>([]);
  const [cronError, setCronError] = useState('');

  const nodeData = cronDataSchema.parse(data || {});

  const form = useForm<CronData>({
    resolver: zodResolver(cronDataSchema),
    defaultValues: nodeData,
  });

  useEffect(() => {
    if (panelOpen) {
      form.reset(nodeData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelOpen]);

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (value.mode === 'advanced' && value.cronExpression) {
        try {
          const interval = parser.parseExpression(value.cronExpression);
          const runs = [];
          for (let i = 0; i < 5; i++) {
            runs.push(interval.next().toString());
          }
          setNextRuns(runs);
          setCronError('');
        } catch (err: any) {
          setCronError(err.message);
          setNextRuns([]);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const handleSubmit = (values: CronData) => {
    updateNodeData(id, values);
    setPanelOpen(false);
  };

  const cronSummary = React.useMemo(() => {
    try {
      return cronstrue.toString(nodeData.cronExpression);
    } catch {
      return 'Invalid Cron';
    }
  }, [nodeData.cronExpression]);

  return (
    <>
      <BaseTriggerNode
        {...({ id, data, selected } as any)}
        icon="/logos/schedule.svg"
        name={nodeData.label || "Daily Schedule"}
        description={cronSummary}
        onSettings={() => setPanelOpen(true)}
        onDoubleClick={() => setPanelOpen(true)}
      />

      <Dialog open={panelOpen} onOpenChange={setPanelOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cron Trigger</DialogTitle>
            <DialogDescription>Configure your scheduling settings.</DialogDescription>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="advanced">Advanced (Cron)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {form.watch('mode') === 'simple' && (
                <>
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hourly">Every Hour</SelectItem>
                            <SelectItem value="daily">Every Day</SelectItem>
                            <SelectItem value="weekly">Every Week</SelectItem>
                            <SelectItem value="monthly">Every Month</SelectItem>
                            <SelectItem value="yearly">Every Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  {form.watch('frequency') !== 'hourly' && (
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time (HH:MM)</FormLabel>
                          <FormControl><Input type="time" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </>
              )}

              {form.watch('mode') === 'advanced' && (
                <FormField
                  control={form.control}
                  name="cronExpression"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cron Expression</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      {cronError ? (
                        <FormMessage>{cronError}</FormMessage>
                      ) : (
                        <FormDescription>
                          Next runs: {nextRuns.map((r, i) => <div key={i}>{r}</div>)}
                        </FormDescription>
                      )}
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                    </div>
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
