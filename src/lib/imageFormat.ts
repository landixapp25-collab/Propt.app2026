export interface ImageFormatResult {
  mediaType: string;
  fileType: string;
}

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function detectImageFormat(file: File): ImageFormatResult {
  if (file.type === 'image/heic' || file.type === 'image/heif') {
    throw new Error('HEIC format not supported. Please convert to JPEG, PNG, GIF, or WebP');
  }

  let mediaType = file.type;

  if (!mediaType || mediaType === '') {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const extensionMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
    };
    mediaType = extensionMap[extension] || '';
  }

  if (mediaType === 'image/jpg') {
    mediaType = 'image/jpeg';
  }

  if (mediaType === 'application/pdf') {
    return {
      mediaType: 'application/pdf',
      fileType: 'pdf',
    };
  }

  if (!VALID_IMAGE_TYPES.includes(mediaType)) {
    throw new Error(
      `Unsupported format: ${mediaType || 'unknown'}. Please upload JPG, PNG, GIF, or WebP`
    );
  }

  const fileType = mediaType.split('/')[1];

  return {
    mediaType,
    fileType,
  };
}

export function imageToBase64(file: File): Promise<{ base64: string; mediaType: string; fileType: string }> {
  return new Promise((resolve, reject) => {
    const format = detectImageFormat(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Failed to read file'));
        return;
      }

      const parts = dataUrl.split(',');
      if (parts.length !== 2) {
        reject(new Error('Invalid data URL format'));
        return;
      }

      const base64Data = parts[1];

      resolve({
        base64: base64Data,
        mediaType: format.mediaType,
        fileType: format.fileType,
      });
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

export function validateImageForAPI(mediaType: string, base64Data: string): void {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

  if (!validTypes.includes(mediaType)) {
    throw new Error(`Unsupported format: ${mediaType}. Must be JPG, PNG, GIF, WebP, or PDF`);
  }

  if (!base64Data || base64Data.includes('data:')) {
    throw new Error('Invalid base64 - should not include data URL prefix');
  }
}
