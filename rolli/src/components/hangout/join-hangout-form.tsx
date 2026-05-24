"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
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
};

export function JoinHangoutForm({
  slug: slugFromUrl,
  hangoutTitle,
  showInviteLinkField = false,
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
    formState: { errors, isSubmitting },
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
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {hangoutTitle && (
          <div className="rounded-2xl bg-lavender/30 px-4 py-3 text-sm text-ink">
            You&apos;re joining{" "}
            <span className="font-medium">{hangoutTitle}</span>
          </div>
        )}

        {showInviteLinkField && (
          <Field
            id="inviteLink"
            label="Invitation link"
            placeholder="rolli.app/h/your-hangout-slug"
            error={errors.inviteLink?.message}
            readOnly={Boolean(slugFromUrl)}
            {...register("inviteLink")}
          />
        )}

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

        {submitError && <p className="text-sm text-pink">{submitError}</p>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Joining…" : "Join hangout"}
        </Button>
      </form>
    </Card>
  );
}
