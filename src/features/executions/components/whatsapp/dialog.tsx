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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  provider: z.enum(["twilio", "meta"]),
  // Twilio
  accountSid: z.string().optional(),
  authToken: z.string().optional(),
  fromNumber: z.string().optional(),
  // Meta
  phoneNumberId: z.string().optional(),
  accessToken: z.string().optional(),
  // Common
  toPhone: z.string().optional(),
  messageBody: z
    .string()
    .min(1, "Message body is required"),
});

export type WhatsAppFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: WhatsAppFormValues) => void;
  defaultValues?: Partial<WhatsAppFormValues>;
}

export const WhatsAppDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<WhatsAppFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName ?? "whatsapp",
      provider: defaultValues.provider ?? "twilio",
      accountSid: defaultValues.accountSid ?? "",
      authToken: defaultValues.authToken ?? "",
      fromNumber: defaultValues.fromNumber ?? "",
      phoneNumberId: defaultValues.phoneNumberId ?? "",
      accessToken: defaultValues.accessToken ?? "",
      toPhone: defaultValues.toPhone ?? "",
      messageBody: defaultValues.messageBody ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName ?? "whatsapp",
        provider: defaultValues.provider ?? "twilio",
        accountSid: defaultValues.accountSid ?? "",
        authToken: defaultValues.authToken ?? "",
        fromNumber: defaultValues.fromNumber ?? "",
        phoneNumberId: defaultValues.phoneNumberId ?? "",
        accessToken: defaultValues.accessToken ?? "",
        toPhone: defaultValues.toPhone ?? "",
        messageBody: defaultValues.messageBody ?? "",
      });
    }
  }, [open, defaultValues, form]);

  const watchProvider = form.watch("provider");
  const watchVariableName = form.watch("variableName") || "whatsapp";

  const handleSubmit = (values: WhatsAppFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>WhatsApp — Send Message</DialogTitle>
          <DialogDescription>
            Send a WhatsApp message via Twilio or Meta Cloud API. Use{" "}
            <code className="bg-muted px-1 rounded text-xs">{`{{razorpay.customer_phone}}`}</code>{" "}
            for the recipient.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 mt-2">

            {/* Variable name */}
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="whatsapp" {...field} />
                  </FormControl>
                  <FormDescription>
                    Reference output:{" "}
                    <code className="bg-muted px-1 rounded text-xs">{`{{${watchVariableName}.messageId}}`}</code>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Provider selector */}
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger id="whatsapp-provider">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio WhatsApp</SelectItem>
                      <SelectItem value="meta">Meta Cloud API</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Twilio fields */}
            {watchProvider === "twilio" && (
              <>
                <FormField
                  control={form.control}
                  name="accountSid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account SID</FormLabel>
                      <FormControl>
                        <Input placeholder="ACxxxx… (or set TWILIO_ACCOUNT_SID env)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="authToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auth Token</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="(or set TWILIO_AUTH_TOKEN env)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fromNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Number (E.164)</FormLabel>
                      <FormControl>
                        <Input placeholder="+14155238886 (or set TWILIO_WHATSAPP_FROM env)" {...field} />
                      </FormControl>
                      <FormDescription>Your Twilio WhatsApp-enabled number</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Meta Cloud API fields */}
            {watchProvider === "meta" && (
              <>
                <FormField
                  control={form.control}
                  name="phoneNumberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number ID</FormLabel>
                      <FormControl>
                        <Input placeholder="(or set META_WHATSAPP_PHONE_NUMBER_ID env)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accessToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Token</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="(or set META_WHATSAPP_ACCESS_TOKEN env)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Recipient */}
            <FormField
              control={form.control}
              name="toPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Phone (E.164 or template)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="{{razorpay.customer_phone}} or +919876543210"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave blank to auto-use{" "}
                    <code className="bg-muted px-1 rounded text-xs">razorpay.customer_phone</code>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message body */}
            <FormField
              control={form.control}
              name="messageBody"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Body</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Hi {{razorpay.customer_name}}, your order {{razorpay.order_id}} of ₹{{razorpay.amount}} has been confirmed!`}
                      className="min-h-[100px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use <code className="bg-muted px-1 rounded text-xs">{`{{razorpay.field}}`}</code> for dynamic values
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
