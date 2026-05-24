import JSZip from "jszip";

type DownloadPhoto = {
  fileName: string;
  url: string;
};

function sanitizeFileName(value: string): string {
  return value.replace(/[^\w.-]+/g, "_").slice(0, 64);
}

async function fetchPhotoBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Could not download a photo");
  }
  return response.blob();
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
