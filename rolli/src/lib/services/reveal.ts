import { createClient } from "@/lib/supabase/client";
import { signPhotoPerspectives } from "@/lib/hangout/signed-photo-urls";
import { mapPerspectives } from "@/lib/services/map-perspectives";
import { parseRevealRpcError } from "@/lib/services/rpc-error";
import { mapHangout, type HangoutRowJson } from "@/lib/supabase/mappers";
import type { Hangout } from "@/types/hangout";
import type { RevealPerspective, RevealState } from "@/types/reveal";

type RevealPerspectiveJson = {
  participant_id: string;
  nickname: string;
  photos: { id: string; storage_path: string; captured_at: string }[] | null;
};

export async function signalRevealPending(
  hangoutId: string,
  sessionToken: string,
): Promise<{ data?: Hangout; error?: string }> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("signal_reveal_pending", {
    p_hangout_id: hangoutId,
    p_session_token: sessionToken,
  });

  if (error) {
    return { error: parseRevealRpcError(error) };
  }

  return { data: mapHangout(data as HangoutRowJson) };
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
    return { error: parseRevealRpcError(error) };
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
    return { error: parseRevealRpcError(error) };
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
    return { error: parseRevealRpcError(error) };
  }

  return { data: mapHangout(data as HangoutRowJson) };
}

export async function signRevealPhotoUrls(
  perspectives: RevealPerspective[],
): Promise<RevealPerspective[]> {
  return signPhotoPerspectives(perspectives);
}
