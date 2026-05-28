"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Field } from "@/components/ui/field";
import { FormCallout } from "@/components/ui/form-callout";
import { FormSubmittingBridge } from "@/components/ui/form-submitting-bridge";
import { SetupFormCard } from "@/components/ui/setup-form-card";
import { joinHangout } from "@/lib/hangouts";
import { buildInviteUrl, extractSlugFromInviteLink } from "@/lib/invite";
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
  formId?: string;
  onSubmittingChange?: (isSubmitting: boolean) => void;
};

export function JoinHangoutForm({
  slug: slugFromUrl,
  hangoutTitle,
  showInviteLinkField = false,
  formId = "join-hangout-form",
  onSubmittingChange,
}: JoinHangoutFormProps) {
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
    setError,
    formState: { errors },
  } = useForm<JoinFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      inviteLink: defaultInviteLink,
      nickname: "",
      realName: "",
    },
  });

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
    router.push(`/h/${slug}/waiting`);
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

        {showInviteLinkField && (
          <Field
            id="inviteLink"
            label="Invitation link"
            placeholder="rolli.app/h/a3f9c2b1e8d4"
            error={errors.inviteLink?.message}
            readOnly={Boolean(slugFromUrl)}
            {...register("inviteLink")}
          />
        )}

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

        {submitError && (
          <p className="rounded-2xl bg-pink/10 px-4 py-3 text-center text-[13px] text-pink-accent">
            {submitError}
          </p>
        )}
      </form>
    </SetupFormCard>
  );
}
