import { apiRequest } from '../api/client';

export const MAX_IMAGE_UPLOAD_BYTES = 300 * 1024;
export const MAX_IMAGE_UPLOAD_LABEL = '300 KB';
export const IMAGE_UPLOAD_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

export type ImageUploadSection = 'services' | 'banners' | 'offers' | 'clients';

export const IMAGE_UPLOAD_SPECS: Record<
  ImageUploadSection,
  { ratio: string; size: string; label: string }
> = {
  services: {
    ratio: '4:3',
    size: '1200×900',
    label: 'service gallery',
  },
  banners: {
    ratio: '8:3',
    size: '1600×600',
    label: 'homepage banner',
  },
  offers: {
    ratio: '3:2',
    size: '900×600',
    label: 'special offer',
  },
  clients: {
    ratio: '2:1',
    size: '480×240',
    label: 'client logo',
  },
};

export function getImageUploadHint(section: ImageUploadSection) {
  const spec = IMAGE_UPLOAD_SPECS[section];
  return `Recommended aspect ratio ${spec.ratio} (${spec.size} px) for ${spec.label} images. Maximum file size: ${MAX_IMAGE_UPLOAD_LABEL}. Supported formats: JPG, PNG, WebP, or GIF. Compress large photos before uploading.`;
}

export function formatImageUploadLimitError() {
  return `Image is too large. Maximum upload size is ${MAX_IMAGE_UPLOAD_LABEL}.`;
}

function assertImageFile(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file (JPG, PNG, WebP, or GIF).');
  }
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error(formatImageUploadLimitError());
  }
}

export function isCloudinaryUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes('res.cloudinary.com');
  } catch {
    return false;
  }
}

/** @deprecated Prefer uploadImage for Cloudinary-backed storage. */
export async function readImageFile(file: File): Promise<string> {
  assertImageFile(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Could not read that image. Try another file.'));
    };
    reader.onerror = () => reject(new Error('Could not read that image. Try another file.'));
    reader.readAsDataURL(file);
  });
}

export async function uploadImage(file: File, section: ImageUploadSection): Promise<string> {
  assertImageFile(file);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('section', section);
  const result = await apiRequest<{ url: string }>('/api/uploads', {
    method: 'POST',
    formData,
    auth: true,
  });
  return result.url;
}

/**
 * Deletes a Cloudinary-hosted image. Local preset paths are ignored safely.
 * Returns true when a remote delete was requested successfully.
 */
export async function deleteUploadedImage(url: string): Promise<boolean> {
  const trimmed = url.trim();
  if (!trimmed || !isCloudinaryUrl(trimmed)) return false;

  await apiRequest<{ ok: boolean }>('/api/uploads', {
    method: 'DELETE',
    auth: true,
    body: { url: trimmed },
  });
  return true;
}
