"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { JoinHangoutForm } from "@/components/hangout/join-hangout-form";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { fetchHangoutBySlug } from "@/lib/hangouts";
import { useSessionStore } from "@/store/session-store";
import type { Hangout } from "@/types/hangout";

export default function InviteLandingPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const sessionHangout = useSessionStore((state) => state.hangout);
  const sessionParticipant = useSessionStore((state) => state.participant);

  const [hangout, setHangout] = useState<Hangout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      if (
        sessionParticipant &&
        sessionHangout?.slug === slug &&
        sessionHangout.id === data.id
      ) {
        router.replace(`/h/${slug}/waiting`);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [slug, sessionHangout, sessionParticipant, router]);

  if (loading) {
    return (
      <MobileShell className="justify-center">
        <p className="text-center text-muted">Loading invitation…</p>
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
