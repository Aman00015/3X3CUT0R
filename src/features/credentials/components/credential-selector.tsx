"use client";

import { CredentialType } from "@/generated/prisma";
import { useCredentialsByType } from "../hooks/use-credentials";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CredentialSelectorProps {
  type: CredentialType;
  value: string;
  onChange: (value: string) => void;
}

export function CredentialSelector({
  type,
  value,
  onChange,
}: CredentialSelectorProps) {
  const { data: credentials, isLoading } = useCredentialsByType(type);

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <div className="flex gap-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select ${type} credential`} />
        </SelectTrigger>
        <SelectContent>
          {credentials?.map((credential) => (
            <SelectItem key={credential.id} value={credential.id}>
              {credential.name}
            </SelectItem>
          ))}
          {credentials?.length === 0 && (
            <div className="p-2 text-sm text-muted-foreground">
              No credentials found
            </div>
          )}
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon" asChild>
        <Link href="/credentials" target="_blank">
          <PlusIcon className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
