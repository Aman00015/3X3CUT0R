"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShareRole } from "@/generated/prisma";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Trash2, Share2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ShareDialogProps {
  workflowId: string;
}

export function ShareDialog({ workflowId }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ShareRole>(ShareRole.VIEWER);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const accessQuery = useQuery(
    trpc.shares.myAccess.queryOptions({ workflowId })
  );

  const sharesQuery = useQuery({
    ...trpc.shares.list.queryOptions({ workflowId }),
    enabled: accessQuery.data?.role === "OWNER",
  });

  const inviteMutation = useMutation(
    trpc.shares.invite.mutationOptions({
      onSuccess: () => {
        setEmail("");
        queryClient.invalidateQueries(trpc.shares.list.queryFilter({ workflowId }));
        toast.success("Invite sent successfully");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  const revokeMutation = useMutation(
    trpc.shares.revoke.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.shares.list.queryFilter({ workflowId }));
        toast.success("Access revoked");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  const updateRoleMutation = useMutation(
    trpc.shares.updateRole.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.shares.list.queryFilter({ workflowId }));
        toast.success("Role updated");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  const handleInvite = () => {
    if (!email) return;
    inviteMutation.mutate({ workflowId, email, role });
  };

  const shares = sharesQuery.data ?? [];

  if (accessQuery.data?.role !== "OWNER") {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Share Workflow
          </DialogTitle>
        </DialogHeader>

        {/* Invite section */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Invite a collaborator by their account email address.
          </p>
          <div className="flex gap-2">
            <Input
              id="share-email-input"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              className="flex-1"
            />
            <Select
              value={role}
              onValueChange={(v) => setRole(v as ShareRole)}
            >
              <SelectTrigger id="share-role-select" className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ShareRole.VIEWER}>Viewer</SelectItem>
                <SelectItem value={ShareRole.EDITOR}>Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button
              id="share-invite-button"
              onClick={handleInvite}
              disabled={!email || inviteMutation.isPending}
            >
              {inviteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Invite"
              )}
            </Button>
          </div>
        </div>

        {/* Existing shares */}
        {shares.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">People with access</p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center gap-3 rounded-lg border p-2"
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={share.user.image ?? undefined} />
                    <AvatarFallback>
                      {share.user.name?.[0]?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {share.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {share.user.email}
                    </p>
                  </div>

                  <Select
                    value={share.role}
                    onValueChange={(v) =>
                      updateRoleMutation.mutate({
                        workflowId,
                        userId: share.userId,
                        role: v as ShareRole,
                      })
                    }
                    disabled={updateRoleMutation.isPending}
                  >
                    <SelectTrigger className="w-24 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ShareRole.VIEWER}>Viewer</SelectItem>
                      <SelectItem value={ShareRole.EDITOR}>Editor</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                    onClick={() =>
                      revokeMutation.mutate({
                        workflowId,
                        userId: share.userId,
                      })
                    }
                    disabled={revokeMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {shares.length === 0 && !sharesQuery.isLoading && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No collaborators yet.{" "}
            <span className="text-foreground">Invite someone above.</span>
          </div>
        )}

        {/* Live collaboration note */}
        <div className="rounded-lg bg-muted/50 border border-border p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">🟢 Live collaboration</p>
          <p>
            <Badge variant="secondary" className="text-[10px] mr-1">Editor</Badge>
            Can add, move, and connect nodes in real time.
          </p>
          <p>
            <Badge variant="secondary" className="text-[10px] mr-1">Viewer</Badge>
            Can see the workflow and live cursors but cannot edit.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
