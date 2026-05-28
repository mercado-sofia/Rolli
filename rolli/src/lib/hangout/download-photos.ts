import JSZip from "jszip";

type DownloadPhoto = {
  fileName: string;
  url: string;
};

const MAX_FETCH_ATTEMPTS = 3;
const FETCH_RETRY_DELAY_MS = 400;

function sanitizeFileName(value: string): string {
  return value.replace(/[^\w.-]+/g, "_").slice(0, 64);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function fetchPhotoBlob(url: string): Promise<Blob> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Download failed (${response.status})`);
      }
      return await response.blob();
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Could not download photo");
      if (attempt < MAX_FETCH_ATTEMPTS) {
        await sleep(FETCH_RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw new Error(
    lastError?.message ??
      "Could not download a photo. Check your connection and try again.",
  );
}

function triggerBlobDownload(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

export async function downloadPhotosAsZip(
  zipName: string,
  photos: DownloadPhoto[],
): Promise<void> {
  if (photos.length === 0) {
    throw new Error("No photos to download");
  }

  const zip = new JSZip();

  await Promise.all(
    photos.map(async (photo, index) => {
      const blob = await fetchPhotoBlob(photo.url);
      const fileName =
        photo.fileName || `memory-${String(index + 1).padStart(2, "0")}.jpg`;
      zip.file(fileName, blob);
    }),
  );

  const zipBlob = await zip.generateAsync({ type: "blob" });
  triggerBlobDownload(zipBlob, sanitizeFileName(zipName) + ".zip");
}

export async function downloadSinglePhoto(
  url: string,
  fileName: string,
): Promise<void> {
  const blob = await fetchPhotoBlob(url);
  triggerBlobDownload(blob, sanitizeFileName(fileName));
}
