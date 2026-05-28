"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { JoinHangoutForm } from "@/components/hangout/join-hangout-form";
import { SetupFlowHeader } from "@/components/layout/setup-flow-header";
import { SetupFlowShell } from "@/components/layout/setup-flow-shell";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { fetchHangoutBySlug, rejoinHangout } from "@/lib/hangout/hangouts";
import { hangoutParticipantPath } from "@/lib/hangout/routes";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
import { SETUP_FLOW_TOTAL_STEPS, setupFlowSteps } from "@/lib/hangout/setup-flow";
import { useSessionStore } from "@/store/session-store";
import type { Hangout } from "@/types/hangout";

const INVITE_JOIN_FORM_ID = "invite-join-form";

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
      <MobileShell variant="app" className="justify-center">
        <p className="text-center text-muted">
          {rejoining ? "Rejoining your hangout…" : "Loading invitation…"}
        </p>
      </MobileShell>
    );
  }

  if (error || !hangout) {
    return (
      <SetupFlowShell
        hint="Double-check the link or ask your Film Keeper for a new one."
        header={
          <SetupFlowHeader
            currentStep={1}
            totalSteps={SETUP_FLOW_TOTAL_STEPS}
            backHref="/start"
            title="Link not found"
            sublabel="Invitation"
          />
        }
      >
        <p className="text-center text-sm text-muted">
          {error ?? "This hangout does not exist or the link is incorrect."}
        </p>
      </SetupFlowShell>
    );
  }

  if (hasMatchingSession) {
    return (
      <MobileShell variant="app" className="justify-center">
        <p className="text-center text-muted">Taking you to your hangout…</p>
      </MobileShell>
    );
  }

  if (hangout.status !== "waiting") {
    const isCancelled = hangout.status === "cancelled";

    return (
      <SetupFlowShell
        hint={
          isCancelled
            ? "The Film Keeper cancelled this hangout before it started."
            : "This hangout already started or ended — new guests can't join."
        }
        header={
          <SetupFlowHeader
            currentStep={setupFlowSteps.inviteJoin}
            totalSteps={SETUP_FLOW_TOTAL_STEPS}
            backHref="/"
            title={hangout.title}
            sublabel="Invitation closed"
          />
        }
      >
        <p className="text-center text-sm text-muted">
          {isCancelled
            ? "This hangout was abandoned. New guests cannot join."
            : "This hangout has already started or ended. New guests cannot join."}
        </p>
        <Link
          href="/"
          className="mt-6 block text-center text-sm text-muted underline underline-offset-4"
        >
          Go home
        </Link>
      </SetupFlowShell>
    );
  }

  return (
    <SetupFlowShell
      hint="Join with a nickname — your real name stays secret until reveal."
      header={
        <SetupFlowHeader
          currentStep={setupFlowSteps.inviteJoin}
          totalSteps={SETUP_FLOW_TOTAL_STEPS}
          backHref="/"
          backLabel="Go home"
          title={hangout.title}
          sublabel="You're invited"
        />
      }
      footer={
        <Button
          type="submit"
          form={INVITE_JOIN_FORM_ID}
          disabled={isSubmitting}
          className={APP_PRIMARY_BUTTON_CLASS}
        >
          {isSubmitting ? "Joining…" : "Join hangout"}
        </Button>
      }
    >
      <JoinHangoutForm
        slug={slug}
        hangoutTitle={hangout.title}
        formId={INVITE_JOIN_FORM_ID}
        onSubmittingChange={setIsSubmitting}
      />
    </SetupFlowShell>
  );
}
