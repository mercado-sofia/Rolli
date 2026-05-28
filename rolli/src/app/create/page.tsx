"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { InviteLinkCard } from "@/components/hangout/invite-link-card";
import { SetupFlowHeader } from "@/components/layout/setup-flow-header";
import { SetupFlowShell } from "@/components/layout/setup-flow-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { SetupFormCard } from "@/components/ui/setup-form-card";
import { createHangoutWithKeeper } from "@/lib/hangouts";
import { buildInviteUrl } from "@/lib/invite";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
import { SETUP_FLOW_TOTAL_STEPS, setupFlowSteps } from "@/lib/setup-flow";
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

const CREATE_FORM_ID = "create-hangout-form";

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
    watch,
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
      <SetupFlowShell
        hint="Share the link with friends, then enter when you're ready."
        header={
          <SetupFlowHeader
            currentStep={setupFlowSteps.createLinkReady}
            totalSteps={SETUP_FLOW_TOTAL_STEPS}
            onBack={() => {
              setCreated(null);
              setStep(2);
            }}
            backLabel="Back to identity"
            title="Ready to roll!"
            sublabel="Share with your friends"
          />
        }
        footer={
          <Button
            type="button"
            onClick={enterWaitingRoom}
            className={APP_PRIMARY_BUTTON_CLASS}
          >
            Enter waiting room
          </Button>
        }
      >
        <InviteLinkCard
          inviteUrl={created.inviteUrl}
          hangoutTitle={created.title}
        />
      </SetupFlowShell>
    );
  }

  const currentStep =
    step === 1 ? setupFlowSteps.createTitle : setupFlowSteps.createIdentity;

  return (
    <SetupFlowShell
      hint={
        step === 1
          ? "Something your friends will recognize works best."
          : "Only your nickname shows until the hangout ends."
      }
      header={
        <SetupFlowHeader
          currentStep={currentStep}
          totalSteps={SETUP_FLOW_TOTAL_STEPS}
          backHref={step === 1 ? "/start" : undefined}
          onBack={step === 2 ? () => setStep(1) : undefined}
          backLabel={step === 1 ? "Back to start" : "Back to title"}
          title={step === 1 ? "New hangout" : "Your identity"}
          sublabel={
            step === 1 ? "Name your hangout" : "Set your anonymous identity"
          }
          detail={
            step === 2 ? (
              <>
                Hangout:{" "}
                <span className="font-medium text-ink">{watch("title")}</span>
              </>
            ) : undefined
          }
        />
      }
      footer={
        step === 1 ? (
          <Button
            type="button"
            onClick={handleProceedToIdentityStep}
            disabled={isSubmitting}
            className={APP_PRIMARY_BUTTON_CLASS}
          >
            Proceed
          </Button>
        ) : (
          <Button
            type="submit"
            form={CREATE_FORM_ID}
            disabled={isSubmitting}
            className={APP_PRIMARY_BUTTON_CLASS}
          >
            {isSubmitting ? "Creating…" : "Generate link"}
          </Button>
        )
      }
    >
      <SetupFormCard>
        <form
          id={CREATE_FORM_ID}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {step === 1 ? (
            <Field
              id="title"
              label="Hangout title"
              placeholder="2AM McDo Recovery"
              error={errors.title?.message}
              {...register("title")}
            />
          ) : (
            <>
              <Field
                id="nickname"
                label="Anonymous nickname"
                placeholder="Enter nickname here"
                error={errors.nickname?.message}
                {...register("nickname")}
              />
              <Field
                id="realName"
                label="Real name (hidden)"
                placeholder="Enter real name here"
                error={errors.realName?.message}
                {...register("realName")}
              />
            </>
          )}
          {submitError && (
            <p className="rounded-2xl bg-pink/10 px-4 py-3 text-center text-[13px] text-pink-accent">
              {submitError}
            </p>
          )}
        </form>
      </SetupFormCard>
    </SetupFlowShell>
  );
}
