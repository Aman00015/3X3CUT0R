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
import { Textarea } from "@/components/ui/textarea";
import { CredentialSelector } from "@/features/credentials/components/credential-selector";
import { CredentialType } from "@/generated/prisma";
import { useEffect } from "react";

const googleSheetsActionSchema = z.object({
  credentialId: z.string().min(1, "Credential is required"),
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  sheetName: z.string().min(1, "Sheet name is required"),
  dataToAppend: z.string().min(1, "Data to append is required"),
});

export type GoogleSheetsActionFormValues = z.infer<typeof googleSheetsActionSchema>;

interface GoogleSheetsActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: GoogleSheetsActionFormValues) => void;
  defaultValues?: Partial<GoogleSheetsActionFormValues>;
}

export function GoogleSheetsActionDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: GoogleSheetsActionDialogProps) {
  const form = useForm<GoogleSheetsActionFormValues>({
    resolver: zodResolver(googleSheetsActionSchema),
    defaultValues: {
      credentialId: defaultValues?.credentialId || "",
      spreadsheetId: defaultValues?.spreadsheetId || "",
      sheetName: defaultValues?.sheetName || "Sheet1",
      dataToAppend: defaultValues?.dataToAppend || "{{variable}}",
    },
  });

  useEffect(() => {
    if (open && defaultValues) {
      form.reset({
        credentialId: defaultValues.credentialId || "",
        spreadsheetId: defaultValues.spreadsheetId || "",
        sheetName: defaultValues.sheetName || "Sheet1",
        dataToAppend: defaultValues.dataToAppend || "{{variable}}",
      });
    }
  }, [open, defaultValues, form]);

  const onFormSubmit = (values: GoogleSheetsActionFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Google Sheets Action</DialogTitle>
          <DialogDescription>
            Add a new row to a specific Google Sheet.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
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

            <FormField
              control={form.control}
              name="dataToAppend"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data to Append (JSON or comma separated)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder='{"Column A": "{{value}}", "Column B": "fixed"}' />
                  </FormControl>
                  <FormDescription>
                    Enter the data to add as a new row. Use variables like {"{{variable_name}}"}.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Save Action</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
