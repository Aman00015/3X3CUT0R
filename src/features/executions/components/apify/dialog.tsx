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
import { useEffect } from "react";

const apifySchema = z.object({
  variableName: z.string().min(1, "Variable name is required"),
  credentialId: z.string().min(1, "Credential is required"),
  searchQuery: z.string().min(1, "Search query is required"),
  maxResults: z.coerce.number().min(1).max(1000),
});

export type ApifyFormValues = z.infer<typeof apifySchema>;

interface ApifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ApifyFormValues) => void;
  defaultValues?: Partial<ApifyFormValues>;
}

export function ApifyDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: ApifyDialogProps) {
  const form = useForm<ApifyFormValues>({
    resolver: zodResolver(apifySchema),
    defaultValues: {
      variableName: defaultValues?.variableName || "apify_results",
      credentialId: defaultValues?.credentialId || "",
      searchQuery: defaultValues?.searchQuery || "",
      maxResults: defaultValues?.maxResults ?? 5,
    },
  });

  useEffect(() => {
    if (open && defaultValues) {
      form.reset({
        variableName: defaultValues.variableName || "apify_results",
        credentialId: defaultValues.credentialId || "",
        searchQuery: defaultValues.searchQuery || "",
        maxResults: defaultValues.maxResults ?? 5,
      });
    }
  }, [open, defaultValues, form]);

  const onFormSubmit = (values: ApifyFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Apify Google Maps Scraper</DialogTitle>
          <DialogDescription>
            Extract places and reviews from Google Maps using Apify.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="apify_results" />
                  </FormControl>
                  <FormDescription>
                    Key to store the results in context.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apify API Token</FormLabel>
                  <FormControl>
                    <CredentialSelector
                      type={CredentialType.APIFY}
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
              name="searchQuery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search Query</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Restaurants in Prague" />
                  </FormControl>
                  <FormDescription>
                    The search query for Google Maps.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxResults"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Results</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormDescription>
                    Maximum number of places to crawl.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Save Settings</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
