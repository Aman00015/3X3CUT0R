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
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, "Variable name is required")
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message: "Must start with a letter or underscore, no spaces",
    }),
  databaseId: z.string().min(1, "Notion Database ID is required"),
  notionApiKey: z.string().optional(),
});

export type NotionFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: NotionFormValues) => void;
  defaultValues?: Partial<NotionFormValues>;
}

const NOTION_PROPERTY_FIELDS = [
  { label: "Title", key: "order_id", note: "Mapped from razorpay.order_id" },
  { label: "Amount", key: "amount" },
  { label: "Currency", key: "currency" },
  { label: "Customer Name", key: "customer_name" },
  { label: "Customer Email", key: "customer_email" },
  { label: "Payment ID", key: "payment_id" },
  { label: "Date", key: "created_at", note: "ISO date from razorpay.created_at" },
];

export const NotionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<NotionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName ?? "notion",
      databaseId: defaultValues.databaseId ?? "",
      notionApiKey: defaultValues.notionApiKey ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName ?? "notion",
        databaseId: defaultValues.databaseId ?? "",
        notionApiKey: defaultValues.notionApiKey ?? "",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "notion";

  const handleSubmit = (values: NotionFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Notion — Save Page</DialogTitle>
          <DialogDescription>
            Creates a new page in your Notion database. Automatically handles Razorpay payments or Google Form lead submissions.
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
                    <Input placeholder="notion" {...field} />
                  </FormControl>
                  <FormDescription>
                    Reference the created page in later nodes:{" "}
                    <code className="bg-muted px-1 rounded text-xs">{`{{${watchVariableName}.page_id}}`}</code>{" "}
                    <code className="bg-muted px-1 rounded text-xs">{`{{${watchVariableName}.url}}`}</code>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="databaseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notion Database ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Copy from your Notion database URL:{" "}
                    <code className="bg-muted px-1 rounded text-xs">notion.so/&lt;database-id&gt;?v=…</code>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notionApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notion API Key (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="secret_… (falls back to NOTION_API_KEY env var)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your Notion Integration token. Leave blank to use the{" "}
                    <code className="bg-muted px-1 rounded text-xs">NOTION_API_KEY</code> env var.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Property mapping preview */}
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h4 className="font-medium text-sm">Database Properties Mapped</h4>
              <div className="flex flex-wrap gap-2">
                {NOTION_PROPERTY_FIELDS.map((f) => (
                  <Badge
                    key={f.key}
                    variant="secondary"
                    className="text-xs cursor-pointer"
                    title={f.note ?? `razorpay.${f.key}`}
                    onClick={() => {
                      navigator.clipboard.writeText(`{{razorpay.${f.key}}}`);
                      toast.success(`Copied {{razorpay.${f.key}}}`);
                    }}
                  >
                    {f.label}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                These properties are auto-populated from the Razorpay trigger context.
              </p>
            </div>

            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
