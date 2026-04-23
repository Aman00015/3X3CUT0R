"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OUTPUT_FIELDS = [
  { key: "razorpay.payment_id", label: "Payment ID" },
  { key: "razorpay.order_id", label: "Order ID" },
  { key: "razorpay.amount", label: "Amount (₹)" },
  { key: "razorpay.currency", label: "Currency" },
  { key: "razorpay.customer_email", label: "Customer Email" },
  { key: "razorpay.customer_phone", label: "Customer Phone" },
  { key: "razorpay.customer_name", label: "Customer Name" },
  { key: "razorpay.created_at", label: "Created At" },
];

export const RazorpayTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/webhooks/razorpay?workflowId=${workflowId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied to clipboard");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Razorpay — Payment Captured</DialogTitle>
          <DialogDescription>
            Configure this webhook URL in your Razorpay Dashboard to trigger
            this workflow on every successful payment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Webhook URL */}
          <div className="space-y-2">
            <Label htmlFor="rz-webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="rz-webhook-url"
                value={webhookUrl}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
              >
                <CopyIcon className="size-4" />
              </Button>
            </div>
          </div>

          {/* Setup instructions */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Setup instructions</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open your Razorpay Dashboard → Settings → Webhooks</li>
              <li>Click "Add New Webhook"</li>
              <li>Paste the URL above and select event: <code className="bg-background px-1 rounded">payment.captured</code></li>
              <li>Set your webhook secret and add it as <code className="bg-background px-1 rounded">RAZORPAY_WEBHOOK_SECRET</code> in your env</li>
            </ol>
          </div>

          {/* Output variables */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Available Output Variables</h4>
            <div className="flex flex-wrap gap-2">
              {OUTPUT_FIELDS.map((f) => (
                <Badge
                  key={f.key}
                  variant="secondary"
                  className="font-mono text-xs cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(`{{${f.key}}}`);
                    toast.success(`Copied {{${f.key}}}`);
                  }}
                  title={f.label}
                >
                  {`{{${f.key}}}`}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Click a badge to copy it to clipboard</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
