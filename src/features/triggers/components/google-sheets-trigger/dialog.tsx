"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CredentialSelector } from "@/features/credentials/components/credential-selector";
import { CredentialType } from "@/generated/prisma";

const googleSheetsTriggerSchema = z.object({
  credentialId: z.string().min(1, "Credential is required"),
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  sheetName: z.string().min(1, "Sheet name is required"),
});

type GoogleSheetsTriggerFormValues = z.infer<typeof googleSheetsTriggerSchema>;

interface GoogleSheetsTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoogleSheetsTriggerDialog({
  open,
  onOpenChange,
}: GoogleSheetsTriggerDialogProps) {
  const form = useForm<GoogleSheetsTriggerFormValues>({
    resolver: zodResolver(googleSheetsTriggerSchema),
    defaultValues: {
      credentialId: "",
      spreadsheetId: "",
      sheetName: "Sheet1",
    },
  });

  const onSubmit = (values: GoogleSheetsTriggerFormValues) => {
    console.log("Sheets Trigger Settings:", values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Google Sheets Trigger</DialogTitle>
          <DialogDescription>
            Configure the Google Sheet to monitor for new rows.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Credential</FormLabel>
                  <FormControl>
                    <CredentialSelector
                      type={CredentialType.GOOGLE_SHEETS}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="spreadsheetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spreadsheet ID</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 1aBcDeFgHiJkLmNoPqRsTuVwXyZ" />
                  </FormControl>
                  <FormDescription>
                    The ID of the Google Sheet (found in the URL).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sheetName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sheet Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Sheet1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Save Trigger</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
