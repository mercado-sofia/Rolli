import { createClient } from "@/lib/supabase/client";
import type { RevealPerspective } from "@/types/reveal";

const BUCKET = "hangout-photos";
const SIGNED_URL_TTL_SEC = 3600;

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
  const supabase = createClient();

  const signed = await Promise.all(
    perspectives.map(async (perspective) => {
      const photos = await Promise.all(
        perspective.photos.map(async (photo, index) => {
          const { data, error } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(photo.storagePath, SIGNED_URL_TTL_SEC);

          if (error || !data?.signedUrl) {
            return photo;
          }

          return {
            ...photo,
            signedUrl: data.signedUrl,
            fileName: `${perspective.nickname}-${String(index + 1).padStart(2, "0")}.jpg`,
          };
        }),
      );

      return { ...perspective, photos };
    }),
  );

  return signed;
}
