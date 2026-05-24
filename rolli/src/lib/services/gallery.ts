import { createClient } from "@/lib/supabase/client";
import { signPhotoPerspectives } from "@/lib/signed-photo-urls";
import type { RevealPerspective } from "@/types/reveal";

function parseRpcError(error: { message?: string; details?: string }): string {
  return error.message ?? error.details ?? "Something went wrong";
}

type GalleryPhotoJson = {
  id: string;
  storage_path: string;
  captured_at: string;
};

type GalleryPerspectiveJson = {
  participant_id: string;
  nickname: string;
  photos: GalleryPhotoJson[] | null;
};

function mapPerspectives(rows: GalleryPerspectiveJson[]): RevealPerspective[] {
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

export type GalleryData = {
  perspectives: RevealPerspective[];
};

export async function getGallery(
  hangoutId: string,
  sessionToken: string,
): Promise<{ data?: GalleryData; error?: string }> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_gallery", {
    p_hangout_id: hangoutId,
    p_session_token: sessionToken,
  });

  if (error) {
    return { error: parseRpcError(error) };
  }

  const payload = data as { perspectives: GalleryPerspectiveJson[] };

  return {
    data: {
      perspectives: mapPerspectives(payload.perspectives ?? []),
    },
  };
}

export async function signGalleryPhotoUrls(
  perspectives: RevealPerspective[],
): Promise<RevealPerspective[]> {
  return signPhotoPerspectives(perspectives, { includeFileName: true });
}
