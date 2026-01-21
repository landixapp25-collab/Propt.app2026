export interface CompressedImage {
  data: string;
  size: number;
  width: number;
  height: number;
}

export const compressImage = (
  file: File,
  maxSizeMB: number = 2,
  quality: number = 0.85
): Promise<CompressedImage> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        const maxWidth = 1920;
        const maxHeight = 2560;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let currentQuality = quality;
        let compressedData = canvas.toDataURL('image/jpeg', currentQuality);

        const maxBytes = maxSizeMB * 1024 * 1024;
        const base64Length = compressedData.length - 'data:image/jpeg;base64,'.length;
        let currentSize = (base64Length * 3) / 4;

        while (currentSize > maxBytes && currentQuality > 0.1) {
          currentQuality -= 0.05;
          compressedData = canvas.toDataURL('image/jpeg', currentQuality);
          const newBase64Length = compressedData.length - 'data:image/jpeg;base64,'.length;
          currentSize = (newBase64Length * 3) / 4;
        }

        resolve({
          data: compressedData,
          size: currentSize,
          width,
          height,
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
