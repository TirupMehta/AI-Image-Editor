import { PixelCrop } from 'react-image-crop';

export function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return reject(new Error('Failed to get canvas context.'));
    }
    
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );
    
    resolve(canvas.toDataURL('image/png'));
  });
}

export function getExtendedImg(
  imageSrc: string,
  targetWidth: number,
  targetHeight: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;

    image.onload = () => {
      // Create a new canvas element
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Get the 2D rendering context
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Failed to get canvas context.'));
      }

      // Explicitly clear the canvas to ensure the background is transparent.
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate the coordinates to draw the image in the center.
      // Use naturalWidth/Height to ensure we use the image's original dimensions.
      const x = (canvas.width - image.naturalWidth) / 2;
      const y = (canvas.height - image.naturalHeight) / 2;

      // Draw the original image onto the canvas at its full size.
      ctx.drawImage(image, x, y, image.naturalWidth, image.naturalHeight);

      // Export the canvas content to a PNG data URL, which supports transparency.
      try {
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (e) {
        console.error("Canvas toDataURL failed:", e);
        reject(new Error("Failed to export the extended image."));
      }
    };

    image.onerror = (error) => {
      console.error("Failed to load image for extending:", error);
      reject(new Error('The image could not be loaded for the extend operation.'));
    };
  });
}

export function createThumbnail(
  base64Image: string,
  maxWidth: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Image;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = img.width / img.height;
      canvas.width = maxWidth;
      canvas.height = maxWidth / ratio;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject('Could not get canvas context');
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8)); // Use JPEG for smaller size
    };
    img.onerror = (err) => reject(err);
  });
}


function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? a : greatestCommonDivisor(b, a % b);
}

export function getAspectRatioDescription(width: number, height: number): string {
    if (!width || !height) return '';
    
    const decimalRatio = width / height;

    if (Math.abs(decimalRatio - 16 / 9) < 0.01) return '16:9 cinematic widescreen';
    if (Math.abs(decimalRatio - 4 / 3) < 0.01) return '4:3 standard';
    if (Math.abs(decimalRatio - 1) < 0.01) return '1:1 square';
    if (Math.abs(decimalRatio - 4 / 5) < 0.01) return '4:5 portrait';
    if (Math.abs(decimalRatio - 9 / 16) < 0.01) return '9:16 vertical';
    
    const gcd = greatestCommonDivisor(Math.round(width), Math.round(height));
    const aspectWidth = Math.round(width / gcd);
    const aspectHeight = Math.round(height / gcd);
    
    return `${aspectWidth}:${aspectHeight}`;
}