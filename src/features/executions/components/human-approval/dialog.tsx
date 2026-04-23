"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  approverEmail: z.string().min(1, "Approver email is required"),
  timeoutHours: z.string().min(1, "Timeout is required"),
  previewContent: z.string().optional(),
});

export type HumanApprovalFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: HumanApprovalFormValues) => void;
  defaultValues?: Partial<HumanApprovalFormValues>;
}

export const HumanApprovalDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<HumanApprovalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      approverEmail: defaultValues.approverEmail ?? "",
      timeoutHours: defaultValues.timeoutHours ?? "24",
      previewContent: defaultValues.previewContent ?? "{{gemini_chat.post_content}}",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        approverEmail: defaultValues.approverEmail ?? "",
        timeoutHours: defaultValues.timeoutHours ?? "24",
        previewContent: defaultValues.previewContent ?? "{{gemini_chat.post_content}}",
      });
    }
  }, [open, defaultValues, form]);

  const handleSubmit = (values: HumanApprovalFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Human Approval</DialogTitle>
          <DialogDescription>
            Pause the workflow and send an email asking for approval.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 mt-2">
            <FormField
              control={form.control}
              name="approverEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approver Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeoutHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeout (hours)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="168" {...field} />
                  </FormControl>
                  <FormDescription>Max wait time before workflow auto-fails.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="previewContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preview Content (HTML)</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[100px] font-mono text-sm" {...field} />
                  </FormControl>
                  <FormDescription>
                    What the approver will see. Supports <code className="bg-muted px-1 rounded text-xs">{`{{variables}}`}</code>.
                  </FormDescription>
                  <FormMessage />
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
  );
};
