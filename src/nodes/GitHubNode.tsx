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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const githubDataSchema = z.object({
  label: z.string(),
  auth: z.object({
    method: z.enum(['token', 'app', 'oauth']),
    token: z.string(),
    verified: z.boolean(),
    username: z.string(),
  }),
  owner: z.string(),
  repo: z.string(),
  action: z.string(),
  issueTitle: z.string(),
  issueBody: z.string(),
  issueLabels: z.array(z.string()),
  issueAssignees: z.array(z.string()),
  notes: z.string(),
});

export type GitHubData = z.infer<typeof githubDataSchema>;

const DEFAULT_GITHUB_DATA: GitHubData = {
  label: 'GitHub',
  auth: {
    method: 'token',
    token: '',
    verified: false,
    username: '',
  },
  owner: '',
  repo: '',
  action: 'create_issue',
  issueTitle: '',
  issueBody: '',
  issueLabels: [],
  issueAssignees: [],
  notes: '',
};

export function GitHubNode({ id, data, selected }: any) {
  const { updateNodeData } = useReactFlow();
  const [panelOpen, setPanelOpen] = useState(false);
  const [testResult, setTestResult] = useState('');

  const nodeData = { ...DEFAULT_GITHUB_DATA, ...data };

  const form = useForm<GitHubData>({
    resolver: zodResolver(githubDataSchema),
    defaultValues: nodeData,
  });

  useEffect(() => {
    if (panelOpen) {
      form.reset(nodeData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelOpen]);

  const testConnection = async () => {
    const token = form.getValues('auth.token');
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Invalid Token');
      const json = await res.json();
      form.setValue('auth.verified', true);
      form.setValue('auth.username', json.login);
      setTestResult(`Success: Connected as ${json.login}`);
    } catch (err: any) {
      form.setValue('auth.verified', false);
      setTestResult(`Error: ${err.message}`);
    }
  };

  const handleSubmit = (values: GitHubData) => {
    updateNodeData(id, values);
    setPanelOpen(false);
  };

  const actionLabel = nodeData.action.replace('_', ' ');
  const description = nodeData.owner && nodeData.repo ? `${actionLabel} in ${nodeData.owner}/${nodeData.repo}` : actionLabel;

  return (
    <>
      <BaseExecutionNode
        {...({ id, data, selected } as any)}
        icon="/logos/github.svg"
        name={nodeData.label || "GitHub"}
        description={description}
        onSettings={() => setPanelOpen(true)}
        onDoubleClick={() => setPanelOpen(true)}
      />

      <Dialog open={panelOpen} onOpenChange={setPanelOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>GitHub Config</DialogTitle>
            <DialogDescription>Configure your GitHub integration.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              
              <div className="border p-3 rounded bg-muted/50">
                <h4 className="text-sm font-semibold mb-2">Authentication</h4>
                <FormField
                  control={form.control}
                  name="auth.token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Access Token</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <Button type="button" onClick={testConnection}>Test</Button>
                      </div>
                      {testResult && <FormMessage>{testResult}</FormMessage>}
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="create_issue">Create Issue</SelectItem>
                        <SelectItem value="update_issue">Update Issue</SelectItem>
                        <SelectItem value="close_issue">Close Issue</SelectItem>
                        <SelectItem value="get_issue">Get Issue</SelectItem>
                        <SelectItem value="create_pr">Create PR</SelectItem>
                        <SelectItem value="merge_pr">Merge PR</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="owner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="repo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repository</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {(form.watch('action') === 'create_issue' || form.watch('action') === 'update_issue') && (
                <>
                  <FormField
                    control={form.control}
                    name="issueTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Title</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="issueBody"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Body</FormLabel>
                        <FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}

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
