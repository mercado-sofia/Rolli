import { createClient } from "@/lib/supabase/client";
import { mapHangout, type HangoutRowJson } from "@/lib/supabase/mappers";
import type { Hangout } from "@/types/hangout";
import type { RevealPerspective, RevealState } from "@/types/reveal";

const BUCKET = "hangout-photos";
const SIGNED_URL_TTL_SEC = 3600;

function parseRpcError(error: { message?: string; details?: string }): string {
  return error.message ?? error.details ?? "Something went wrong";
}

type RevealPhotoJson = {
  id: string;
  storage_path: string;
  captured_at: string;
};

type RevealPerspectiveJson = {
  participant_id: string;
  nickname: string;
  photos: RevealPhotoJson[] | null;
};

function mapPerspectives(rows: RevealPerspectiveJson[]): RevealPerspective[] {
  return rows.map((row) => ({
    participantId: row.participant_id,
    nickname: row.nickname,
    photos: (row.photos ?? []).map((photo) => ({
      id: photo.id,
      storagePath: photo.storage_path,
      capturedAt: photo.captured_at,
    })),
  }));
}

export async function startReveal(
  hangoutId: string,
  sessionToken: string,
): Promise<{ data?: Hangout; error?: string }> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("start_reveal", {
    p_hangout_id: hangoutId,
    p_session_token: sessionToken,
  });

  if (error) {
    return { error: parseRpcError(error) };
  }

  return { data: mapHangout(data as HangoutRowJson) };
}

export async function getRevealState(
  hangoutId: string,
  sessionToken: string,
): Promise<{ data?: RevealState; error?: string }> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_reveal_state", {
    p_hangout_id: hangoutId,
    p_session_token: sessionToken,
  });

  if (error) {
    return { error: parseRpcError(error) };
  }

  const payload = data as {
    perspectives: RevealPerspectiveJson[];
  };

  return {
    data: {
      perspectives: mapPerspectives(payload.perspectives ?? []),
    },
  };
}

export async function finishReveal(
  hangoutId: string,
  sessionToken: string,
): Promise<{ data?: Hangout; error?: string }> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("finish_reveal", {
    p_hangout_id: hangoutId,
    p_session_token: sessionToken,
  });

  if (error) {
    return { error: parseRpcError(error) };
  }

  return { data: mapHangout(data as HangoutRowJson) };
}

export async function signRevealPhotoUrls(
  perspectives: RevealPerspective[],
): Promise<RevealPerspective[]> {
  const supabase = createClient();

  const signed = await Promise.all(
    perspectives.map(async (perspective) => {
      const photos = await Promise.all(
        perspective.photos.map(async (photo) => {
          const { data, error } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(photo.storagePath, SIGNED_URL_TTL_SEC);

          if (error || !data?.signedUrl) {
            return photo;
          }

          return { ...photo, signedUrl: data.signedUrl };
        }),
      );

      return { ...perspective, photos };
    }),
  );

  return signed;
}
