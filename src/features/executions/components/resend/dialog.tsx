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
  variableName: z
    .string()
    .min(1, "Variable name is required")
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message: "Must start with a letter or underscore, no spaces",
    }),
  apiKey: z.string().optional(),
  fromEmail: z.string().min(1, "From Email is required"),
  toEmail: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  messageBody: z.string().min(1, "Message body is required"),
});

export type ResendFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ResendFormValues) => void;
  defaultValues?: Partial<ResendFormValues>;
}

export const ResendDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<ResendFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName ?? "resend",
      apiKey: defaultValues.apiKey ?? "",
      fromEmail: defaultValues.fromEmail ?? "onboarding@resend.dev",
      toEmail: defaultValues.toEmail ?? "",
      subject: defaultValues.subject ?? "Order Confirmed!",
      messageBody: defaultValues.messageBody ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName ?? "resend",
        apiKey: defaultValues.apiKey ?? "",
        fromEmail: defaultValues.fromEmail ?? "onboarding@resend.dev",
        toEmail: defaultValues.toEmail ?? "",
        subject: defaultValues.subject ?? "Order Confirmed!",
        messageBody: defaultValues.messageBody ?? "",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "resend";

  const handleSubmit = (values: ResendFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resend — Send Email</DialogTitle>
          <DialogDescription>
            Send an email using Resend. Use {"{{razorpay.customer_email}}"} for the recipient.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 mt-2">
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="resend" {...field} />
                  </FormControl>
                  <FormDescription>
                    Reference output:{" "}
                    <code className="bg-muted px-1 rounded text-xs">{`{{${watchVariableName}.messageId}}`}</code>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="(or set RESEND_API_KEY env)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fromEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Email</FormLabel>
                  <FormControl>
                    <Input placeholder="onboarding@resend.dev" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="toEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Email</FormLabel>
                  <FormControl>
                    <Input placeholder="{{razorpay.customer_email}}" {...field} />
                  </FormControl>
                  <FormDescription>
                    Leave blank to auto-use <code className="bg-muted px-1 rounded text-xs">razorpay.customer_email</code>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Order {{razorpay.order_id}} confirmed!" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="messageBody"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Body (HTML)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`<p>Hi {{razorpay.customer_name}},</p><p>Your order of ₹{{razorpay.amount}} is confirmed!</p>`}
                      className="min-h-[100px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use Handlebars syntax like <code className="bg-muted px-1 rounded text-xs">{`{{razorpay.field}}`}</code>
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
