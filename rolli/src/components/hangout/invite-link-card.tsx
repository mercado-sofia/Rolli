"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";

type InviteLinkCardProps = {
  inviteUrl: string;
  hangoutTitle: string;
};

export function InviteLinkCard({ inviteUrl, hangoutTitle }: InviteLinkCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <GlassPanel className="space-y-4">
      <div>
        <p className="text-sm font-medium text-muted">Invitation link</p>
        <p className="mt-1 text-sm text-muted">
          Share this with friends for{" "}
          <span className="font-medium text-ink">{hangoutTitle}</span>
        </p>
      </div>

      <div
        className={cn(
          "break-all rounded-2xl border border-lavender/50 bg-lavender/20 px-4 py-3",
          "font-mono text-sm text-ink",
        )}
      >
        {inviteUrl}
      </div>

      <Button
        type="button"
        variant="secondary"
        className="gap-2"
        onClick={copyLink}
      >
        {copied ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" />
            Copy link
          </>
        )}
      </Button>
    </GlassPanel>
  );
}
