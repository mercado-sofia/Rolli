"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { BackHomeButton } from "@/components/hangout/back-home-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useResignPhotosOnVisibility } from "@/hooks/use-resign-photos-on-visibility";
import { downloadPhotosAsZip, downloadSinglePhoto } from "@/lib/download-photos";
import { getGallery, signGalleryPhotoUrls } from "@/lib/gallery";
import type { RevealPerspective } from "@/types/reveal";

type GalleryExperienceProps = {
  hangoutId: string;
  sessionToken: string;
  hangoutTitle: string;
};

type GalleryFilter = "all" | string;

export function GalleryExperience({
  hangoutId,
  sessionToken,
  hangoutTitle,
}: GalleryExperienceProps) {
  const [perspectives, setPerspectives] = useState<RevealPerspective[]>([]);
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [signedAt, setSignedAt] = useState<number | null>(null);

  const retryLoad = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  const resignPhotos = useCallback(async () => {
    const { data, error } = await getGallery(hangoutId, sessionToken);
    if (error || !data) return;

    const signed = await signGalleryPhotoUrls(data.perspectives);
    setPerspectives(signed);
    setSignedAt(Date.now());
  }, [hangoutId, sessionToken]);

  useResignPhotosOnVisibility({
    signedAt,
    onResign: resignPhotos,
    enabled: !loading && perspectives.length > 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadError(null);
      setLoading(true);

      const { data, error } = await getGallery(hangoutId, sessionToken);
      if (cancelled) return;

      if (error || !data) {
        setPerspectives([]);
        setSignedAt(null);
        setLoadError(error ?? "Could not load gallery");
        setLoading(false);
        return;
      }

      const signed = await signGalleryPhotoUrls(data.perspectives);
      if (cancelled) return;

      setPerspectives(signed);
      setSignedAt(Date.now());
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [hangoutId, reloadKey, sessionToken]);

  const filteredPerspectives = useMemo(() => {
    if (filter === "all") return perspectives;
    return perspectives.filter((p) => p.participantId === filter);
  }, [filter, perspectives]);

  const visiblePhotos = useMemo(() => {
    return filteredPerspectives.flatMap((perspective) =>
      perspective.photos
        .filter((photo) => photo.signedUrl)
        .map((photo) => ({
          id: photo.id,
          url: photo.signedUrl!,
          fileName: photo.fileName ?? `${perspective.nickname}.jpg`,
          nickname: perspective.nickname,
        })),
    );
  }, [filteredPerspectives]);

  const totalPhotos = perspectives.reduce(
    (sum, perspective) => sum + perspective.photos.length,
    0,
  );

  async function handleDownloadPack(
    packId: string,
    zipName: string,
    photos: { url: string; fileName: string }[],
  ) {
    setDownloading(packId);
    setDownloadError(null);

    try {
      await downloadPhotosAsZip(zipName, photos);
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : "Download failed",
      );
    } finally {
      setDownloading(null);
    }
  }

  async function handleDownloadSingle(
    photoId: string,
    url: string,
    fileName: string,
  ) {
    setDownloading(photoId);
    setDownloadError(null);

    try {
      await downloadSinglePhoto(url, fileName);
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : "Download failed",
      );
    } finally {
      setDownloading(null);
    }
  }

  if (loading) {
    return (
      <p className="text-center text-sm text-muted">Loading gallery…</p>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-pink">{loadError}</p>
        <Button type="button" variant="secondary" onClick={retryLoad}>
          Try again
        </Button>
      </div>
    );
  }

  const allDownloadable = perspectives.flatMap((perspective) =>
    perspective.photos
      .filter((photo) => photo.signedUrl)
      .map((photo) => ({
        url: photo.signedUrl!,
        fileName: photo.fileName ?? `${perspective.nickname}.jpg`,
      })),
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm font-medium text-muted">Gallery</p>
        <h2 className="font-display mt-1 text-2xl text-ink">{hangoutTitle}</h2>
        <p className="mt-2 text-sm text-muted">
          {totalPhotos} {totalPhotos === 1 ? "memory" : "memories"} from{" "}
          {perspectives.length}{" "}
          {perspectives.length === 1 ? "perspective" : "perspectives"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={filter === "all" ? "primary" : "secondary"}
          className="w-auto! shrink-0 px-4"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        {perspectives.map((perspective) => (
          <Button
            key={perspective.participantId}
            type="button"
            variant={filter === perspective.participantId ? "primary" : "secondary"}
            className="w-auto! shrink-0 px-4"
            onClick={() => setFilter(perspective.participantId)}
          >
            {perspective.nickname}
          </Button>
        ))}
      </div>

      <Card className="space-y-3">
        <p className="text-sm font-medium text-ink">Download</p>
        {downloadError && (
          <p className="text-sm text-pink">{downloadError}</p>
        )}
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={allDownloadable.length === 0 || Boolean(downloading)}
            onClick={() =>
              void handleDownloadPack(
                "full-album",
                `${hangoutTitle}-full-album`,
                allDownloadable,
              )
            }
          >
            {downloading === "full-album"
              ? "Preparing zip…"
              : "Download full album (zip)"}
          </Button>
          {filter !== "all" && visiblePhotos.length > 0 && (
            <Button
              type="button"
              variant="secondary"
              disabled={Boolean(downloading)}
              onClick={() =>
                void handleDownloadPack(
                  `perspective-${filter}`,
                  `${hangoutTitle}-${filteredPerspectives[0]?.nickname ?? "perspective"}`,
                  visiblePhotos.map((photo) => ({
                    url: photo.url,
                    fileName: photo.fileName,
                  })),
                )
              }
            >
              {downloading === `perspective-${filter}`
                ? "Preparing zip…"
                : "Download this perspective (zip)"}
            </Button>
          )}
        </div>
      </Card>

      {visiblePhotos.length === 0 ? (
        <Card className="text-center text-sm text-muted">
          No photos in this view.
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredPerspectives.map((perspective) => (
            <div key={perspective.participantId} className="space-y-3">
              <p className="font-medium text-ink">{perspective.nickname}</p>
              <div className="grid grid-cols-2 gap-3">
                {perspective.photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="relative aspect-3/4 overflow-hidden rounded-2xl bg-lavender/30"
                  >
                    {photo.signedUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.signedUrl}
                        alt={`${perspective.nickname} memory ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted">
                        Unavailable
                      </div>
                    )}
                    {photo.signedUrl && (
                      <button
                        type="button"
                        className="absolute bottom-2 right-2 rounded-full bg-ink/80 px-3 py-1 text-xs text-white"
                        disabled={downloading === photo.id}
                        onClick={() =>
                          void handleDownloadSingle(
                            photo.id,
                            photo.signedUrl!,
                            photo.fileName ??
                              `${perspective.nickname}-${index + 1}.jpg`,
                          )
                        }
                      >
                        {downloading === photo.id ? "…" : "Save"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <BackHomeButton />
    </div>
  );
}
