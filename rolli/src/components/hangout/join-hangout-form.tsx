"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Field } from "@/components/ui/field";
import { FormCallout } from "@/components/ui/form-callout";
import { FormSubmittingBridge } from "@/components/ui/form-submitting-bridge";
import { SetupFormCard } from "@/components/ui/setup-form-card";
import { joinHangout } from "@/lib/hangout/hangouts";
import { buildInviteUrl, extractSlugFromInviteLink } from "@/lib/hangout/invite";
import { hangoutParticipantPath } from "@/lib/hangout/routes";
import { useSessionStore } from "@/store/session-store";

const baseJoinSchema = z.object({
  inviteLink: z.string().optional(),
  nickname: z.string().min(3, "Pick an anonymous nickname"),
  realName: z.string().min(2, "Enter your real name (hidden until reveal)"),
});

const pasteLinkJoinSchema = baseJoinSchema.extend({
  inviteLink: z.string().min(3, "Paste your invitation link"),
});

type JoinFormValues = z.infer<typeof baseJoinSchema>;

type JoinHangoutFormProps = {
  slug?: string;
  hangoutTitle?: string;
  showInviteLinkField?: boolean;
  /** When pasting a link, step 1 = link only, step 2 = identity only. */
  step?: 1 | 2;
  formId?: string;
  onSubmittingChange?: (isSubmitting: boolean) => void;
};

export type JoinHangoutFormHandle = {
  validateLinkStep: () => Promise<boolean>;
};

export const JoinHangoutForm = forwardRef<
  JoinHangoutFormHandle,
  JoinHangoutFormProps
>(function JoinHangoutForm(
  {
    slug: slugFromUrl,
    hangoutTitle,
    showInviteLinkField = false,
    step = 1,
    formId = "join-hangout-form",
    onSubmittingChange,
  },
  ref,
) {
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = showInviteLinkField ? pasteLinkJoinSchema : baseJoinSchema;

  const defaultInviteLink = useMemo(
    () => (slugFromUrl ? buildInviteUrl(slugFromUrl) : ""),
    [slugFromUrl],
  );

  const {
    register,
    handleSubmit,
    trigger,
    setError,
    getValues,
    formState: { errors },
  } = useForm<JoinFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      inviteLink: defaultInviteLink,
      nickname: "",
      realName: "",
    },
  });

  useImperativeHandle(ref, () => ({
    async validateLinkStep() {
      const isValid = await trigger("inviteLink");
      if (!isValid) return false;

      const slug = slugFromUrl ?? extractSlugFromInviteLink(getValues("inviteLink") ?? "");
      if (!slug) {
        setError("inviteLink", { message: "Invalid invitation link" });
        return false;
      }

      return true;
    },
  }));

  const showLinkStep = showInviteLinkField && step === 1;
  const showIdentityStep = !showInviteLinkField || step === 2;

  async function onSubmit(values: JoinFormValues) {
    setSubmitError(null);

    const slug =
      slugFromUrl ?? extractSlugFromInviteLink(values.inviteLink ?? "");

    if (!slug) {
      setSubmitError("Invalid invitation link");
      if (showInviteLinkField) {
        setError("inviteLink", { message: "Invalid invitation link" });
      }
      return;
    }

    const { data, error } = await joinHangout({
      slug,
      nickname: values.nickname,
      realName: values.realName,
    });

    if (error || !data) {
      const message = error ?? "Could not join hangout";
      setSubmitError(message);
      if (showInviteLinkField) {
        setError("inviteLink", { message });
      }
      return;
    }

    setSession(data.hangout, data.participant);
    router.push(hangoutParticipantPath(slug, data.hangout.status));
  }

  return (
    <SetupFormCard>
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {onSubmittingChange ? (
          <FormSubmittingBridge onSubmittingChange={onSubmittingChange} />
        ) : null}
        {hangoutTitle && (
          <FormCallout>
            You&apos;re joining{" "}
            <span className="font-medium text-ink">{hangoutTitle}</span>
          </FormCallout>
        )}

        {showLinkStep && (
          <Field
            id="inviteLink"
            label="Invitation link"
            placeholder="rolli.app/h/a3f9c2b1e8d4"
            error={errors.inviteLink?.message}
            readOnly={Boolean(slugFromUrl)}
            {...register("inviteLink")}
          />
        )}

        {showIdentityStep && (
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
  );
});
