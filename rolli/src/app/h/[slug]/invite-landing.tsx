"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { JoinHangoutForm } from "@/components/hangout/join-hangout-form";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { fetchHangoutBySlug, rejoinHangout } from "@/lib/hangouts";
import { hangoutParticipantPath } from "@/lib/hangout-routes";
import { useSessionStore } from "@/store/session-store";
import type { Hangout } from "@/types/hangout";

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
      <MobileShell className="justify-center">
        <p className="text-center text-muted">
          {rejoining ? "Rejoining your hangout…" : "Loading invitation…"}
        </p>
      </MobileShell>
    );
  }

  if (error || !hangout) {
    return (
      <MobileShell className="justify-center gap-6 text-center">
        <div>
          <p className="text-sm font-medium text-muted">Invitation</p>
          <h1 className="font-display mt-2 text-3xl text-ink">
            Link not found
          </h1>
          <p className="mt-3 text-sm text-muted">
            {error ?? "This hangout does not exist or the link is incorrect."}
          </p>
        </div>
        <Button href="/start" variant="secondary">
          Back to start
        </Button>
      </MobileShell>
    );
  }

  if (hasMatchingSession) {
    return (
      <MobileShell className="justify-center">
        <p className="text-center text-muted">Taking you to your hangout…</p>
      </MobileShell>
    );
  }

  if (hangout.status !== "waiting") {
    return (
      <MobileShell className="justify-center gap-6 text-center">
        <div>
          <p className="text-sm font-medium text-muted">Invitation</p>
          <h1 className="font-display mt-2 text-3xl text-ink">
            {hangout.title}
          </h1>
          <p className="mt-3 text-sm text-muted">
            This hangout has already started or ended. New guests cannot join.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-muted underline underline-offset-4"
        >
          Go home
        </Link>
      </MobileShell>
    );
  }

  return (
    <MobileShell className="justify-center gap-8">
      <div>
        <p className="text-sm font-medium text-muted">You&apos;re invited</p>
        <h1 className="font-display mt-2 text-3xl text-ink">{hangout.title}</h1>
        <p className="mt-3 text-sm text-muted">
          Choose an anonymous nickname. Your real name stays hidden until the
          hangout ends.
        </p>
      </div>

      <JoinHangoutForm slug={slug} hangoutTitle={hangout.title} />
    </MobileShell>
  );
}
