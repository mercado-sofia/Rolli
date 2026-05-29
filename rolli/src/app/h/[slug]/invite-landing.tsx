"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { HangoutInvitationClosed } from "@/components/hangout/hangout-invitation-closed";
import { JoinHangoutForm } from "@/components/hangout/join-hangout-form";
import { SetupFlowHeader } from "@/components/layout/setup-flow-header";
import {
  SetupFlowFooter,
  SetupFlowShell,
  SETUP_FLOW_HEADER_CLASS,
  SETUP_FLOW_MAIN_CENTER_CLASS,
  SETUP_FLOW_MAIN_CLASS,
  SETUP_FLOW_MAIN_INNER_CLASS,
} from "@/components/layout/setup-flow-shell";
import { Button } from "@/components/ui/button";
import { fetchHangoutBySlug, rejoinHangout } from "@/lib/hangout/hangouts";
import { hangoutParticipantPath } from "@/lib/hangout/routes";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
import { SETUP_FLOW_TOTAL_STEPS, setupFlowSteps } from "@/lib/hangout/setup-flow";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils";
import type { Hangout } from "@/types/hangout";

const INVITE_JOIN_FORM_ID = "invite-join-form";

function InviteLandingSkeleton({ message }: { message: string }) {
  return (
    <SetupFlowShell>
      <header className={SETUP_FLOW_HEADER_CLASS}>
        <div className="hidden animate-pulse md:flex md:flex-col md:gap-6">
          <div className="h-9 w-9 rounded-full bg-black/10" />
          <div className="h-3 w-24 rounded-full bg-black/10" />
          <div className="h-10 w-52 rounded-lg bg-black/10" />
        </div>
      </header>
      <main className={cn(SETUP_FLOW_MAIN_CLASS, SETUP_FLOW_MAIN_CENTER_CLASS)}>
        <div className={SETUP_FLOW_MAIN_INNER_CLASS}>
          <div className="md:hidden flex min-h-[45dvh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-highlight/25 border-t-pink-highlight" />
          </div>
          <div className="hidden h-56 w-full animate-pulse rounded-3xl border border-container-border bg-white md:block" />
        </div>
      </main>
      <SetupFlowFooter hint={message}>
        <div className="hidden h-12 w-full animate-pulse rounded-full bg-black/10 md:block" />
      </SetupFlowFooter>
    </SetupFlowShell>
  );
}

export function InviteLanding() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const sessionHangout = useSessionStore((state) => state.hangout);
  const sessionParticipant = useSessionStore((state) => state.participant);
  const setSession = useSessionStore((state) => state.setSession);

  const [hangout, setHangout] = useState<Hangout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejoining, setRejoining] = useState(false);
  const [rejoinFailed, setRejoinFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasMatchingSession =
    Boolean(sessionParticipant) &&
    Boolean(sessionHangout) &&
    sessionHangout!.slug === slug &&
    hangout !== null &&
    sessionHangout!.id === hangout.id;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await fetchHangoutBySlug(slug);

      if (cancelled) return;

      if (fetchError || !data) {
        setHangout(null);
        setError(fetchError ?? "Hangout not found");
        setLoading(false);
        return;
      }

      setHangout(data);
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (loading || !hangout || hasMatchingSession || rejoinFailed) return;
    if (!sessionParticipant?.sessionToken) return;
    if (hangout.status !== "waiting") return;

    let cancelled = false;

    async function tryRejoin() {
      setRejoining(true);

      const { data, error: rejoinError } = await rejoinHangout(
        slug,
        sessionParticipant!.sessionToken,
      );

      if (cancelled) return;

      setRejoining(false);

      if (rejoinError || !data) {
        setRejoinFailed(true);
        return;
      }

      setSession(data.hangout, data.participant);
      router.replace(hangoutParticipantPath(slug, data.hangout.status));
    }

    void tryRejoin();

    return () => {
      cancelled = true;
    };
  }, [
    hangout,
    hasMatchingSession,
    loading,
    rejoinFailed,
    router,
    sessionParticipant,
    setSession,
    slug,
  ]);

  useEffect(() => {
    if (loading || !hangout || !hasMatchingSession) return;

    router.replace(hangoutParticipantPath(slug, hangout.status));
  }, [loading, hangout, hasMatchingSession, router, slug]);

  if (loading || rejoining) {
    return (
      <InviteLandingSkeleton
        message={rejoining ? "Rejoining your hangout…" : "Loading invitation…"}
      />
    );
  }

  if (error || !hangout) {
    return (
      <SetupFlowShell>
        <header className={SETUP_FLOW_HEADER_CLASS}>
          <SetupFlowHeader
            currentStep={1}
            totalSteps={SETUP_FLOW_TOTAL_STEPS}
            backHref="/start"
            title="Link not found"
            sublabel="Invitation"
          />
        </header>

        <main
          className={cn(
            SETUP_FLOW_MAIN_CLASS,
            SETUP_FLOW_MAIN_CENTER_CLASS,
          )}
        >
          <div className={SETUP_FLOW_MAIN_INNER_CLASS}>
            <p className="text-center text-sm text-muted">
              {error ?? "This hangout does not exist or the link is incorrect."}
            </p>
          </div>
        </main>

        <SetupFlowFooter hint="Double-check the link or ask your Film Keeper for a new one." />
      </SetupFlowShell>
    );
  }

  if (hasMatchingSession) {
    return <InviteLandingSkeleton message="Taking you to your hangout…" />;
  }

  if (hangout.status !== "waiting") {
    if (hangout.status === "cancelled") {
      return <HangoutInvitationClosed title={hangout.title} />;
    }

    return (
      <SetupFlowShell>
        <header className={SETUP_FLOW_HEADER_CLASS}>
          <SetupFlowHeader
            currentStep={setupFlowSteps.inviteJoin}
            totalSteps={SETUP_FLOW_TOTAL_STEPS}
            backHref="/"
            title={hangout.title}
            sublabel="Invitation closed"
          />
        </header>

        <main
          className={cn(
            SETUP_FLOW_MAIN_CLASS,
            SETUP_FLOW_MAIN_CENTER_CLASS,
          )}
        >
          <div className={SETUP_FLOW_MAIN_INNER_CLASS}>
            <p className="text-center text-sm text-muted">
              This hangout has already started or ended. New guests cannot join.
            </p>
            <Link
              href="/"
              className="mt-6 block text-center text-sm text-muted underline underline-offset-4"
            >
              Go home
            </Link>
          </div>
        </main>

        <SetupFlowFooter hint="This hangout already started or ended — new guests can't join." />
      </SetupFlowShell>
    );
  }

  return (
    <SetupFlowShell>
      <header className={SETUP_FLOW_HEADER_CLASS}>
        <SetupFlowHeader
          currentStep={setupFlowSteps.inviteJoin}
          totalSteps={SETUP_FLOW_TOTAL_STEPS}
          backHref="/"
          backLabel="Go home"
          title={hangout.title}
          sublabel="You're invited"
        />
      </header>

      <main
        className={cn(
          SETUP_FLOW_MAIN_CLASS,
          SETUP_FLOW_MAIN_CENTER_CLASS,
        )}
      >
        <div className={SETUP_FLOW_MAIN_INNER_CLASS}>
          <JoinHangoutForm
            slug={slug}
            hangoutTitle={hangout.title}
            formId={INVITE_JOIN_FORM_ID}
            onSubmittingChange={setIsSubmitting}
          />
        </div>
      </main>

      <SetupFlowFooter hint="Join with a nickname — your real name stays secret until reveal.">
        <Button
          type="submit"
          form={INVITE_JOIN_FORM_ID}
          disabled={isSubmitting}
          className={APP_PRIMARY_BUTTON_CLASS}
        >
          {isSubmitting ? "Joining…" : "Join hangout"}
        </Button>
      </SetupFlowFooter>
    </SetupFlowShell>
  );
}
