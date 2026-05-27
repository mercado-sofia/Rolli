"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { InviteLinkCard } from "@/components/hangout/invite-link-card";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { createHangoutWithKeeper } from "@/lib/hangouts";
import { buildInviteUrl } from "@/lib/invite";
import { useSessionStore } from "@/store/session-store";

const schema = z.object({
  title: z.string().min(3, "Give your hangout a title"),
  nickname: z.string().min(3, "Pick an anonymous nickname"),
  realName: z.string().min(2, "Enter your real name (hidden until reveal)"),
});

type FormValues = z.infer<typeof schema>;

type CreatedHangout = {
  slug: string;
  title: string;
  inviteUrl: string;
};

export default function CreatePage() {
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);
  const [created, setCreated] = useState<CreatedHangout | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", nickname: "", realName: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitError(null);

    const { data, error } = await createHangoutWithKeeper({
      title: values.title,
      nickname: values.nickname,
      realName: values.realName,
    });

    if (error || !data) {
      setSubmitError(error ?? "Could not create hangout");
      return;
    }

    setSession(data.hangout, data.participant);

    const { slug } = data.hangout;
    setCreated({
      slug,
      title: values.title,
      inviteUrl: buildInviteUrl(slug),
    });
  }

  function enterWaitingRoom() {
    if (!created) return;
    router.push(`/h/${created.slug}/waiting`);
  }

  async function handleProceedToIdentityStep() {
    const isTitleValid = await trigger("title");
    if (!isTitleValid) return;
    setStep(2);
    setSubmitError(null);
  }

  if (created) {
    return (
      <MobileShell className="justify-center gap-8">
        <div>
          <p className="text-sm font-medium text-muted">Create</p>
          <h1 className="font-display mt-2 text-3xl text-ink">
            Your link is ready
          </h1>
          <p className="mt-3 text-sm text-muted">
            You&apos;re the Film Keeper. Share the link, then head to the
            waiting room when you&apos;re ready.
          </p>
        </div>

        <InviteLinkCard
          inviteUrl={created.inviteUrl}
          hangoutTitle={created.title}
        />

        <Button type="button" onClick={enterWaitingRoom}>
          Enter waiting room
        </Button>
      </MobileShell>
    );
  }

  return (
    <MobileShell className="justify-center gap-8">
      <div>
        <p className="text-sm font-medium text-muted">Create</p>
        <h1 className="font-display mt-2 text-3xl text-ink">Start a hangout</h1>
        <p className="mt-3 text-sm text-muted">
          {step === 1
            ? "First, name your hangout."
            : "Now set your anonymous identity as Film Keeper."}
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field
            id="title"
            label="Hangout title"
            placeholder="2AM McDo Recovery"
            error={errors.title?.message}
            {...register("title")}
          />
          {step === 2 && (
            <>
              <div className="rounded-2xl bg-lavender/30 px-4 py-3 text-sm text-ink">
                Hangout: <span className="font-medium">{getValues("title")}</span>
              </div>
              <Field
                id="nickname"
                label="Anonymous nickname"
                placeholder="emotionallyoffline"
                error={errors.nickname?.message}
                {...register("nickname")}
              />
              <Field
                id="realName"
                label="Real name (hidden)"
                placeholder="Sofia"
                error={errors.realName?.message}
                {...register("realName")}
              />
            </>
          )}
          {submitError && (
            <p className="text-sm text-pink">{submitError}</p>
          )}
          {step === 1 ? (
            <Button
              type="button"
              onClick={handleProceedToIdentityStep}
              disabled={isSubmitting}
            >
              Proceed
            </Button>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                className="sm:flex-1"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button type="submit" className="sm:flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Generate link"}
              </Button>
            </div>
          )}
        </form>
      </Card>
    </MobileShell>
  );
}
