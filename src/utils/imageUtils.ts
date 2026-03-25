/**
 * Image utility functions for processing and validating images
 */

interface ValidateImageOptions {
  maxSize?: number;
  allowedTypes?: string[];
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface ImageDimensions {
  width: number;
  height: number;
}

interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: string;
}

interface CompressOptions {
  maxSizeKB?: number;
  quality?: number;
  outputFormat?: string;
}

interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
  outputFormat?: string;
}

/**
 * Validate image file
 */
export const validateImageFile = (file: File, options: ValidateImageOptions = {}): ValidationResult => {
  const {
    maxSize = 5 * 1024 * 1024,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  } = options;

  const errors: string[] = [];

  if (!file.type.startsWith('image/')) {
    errors.push('File must be an image');
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`Image type must be one of: ${allowedTypes.join(', ')}`);
  }

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1024 / 1024);
    errors.push(`Image size must be less than ${maxSizeMB}MB`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Convert file to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Get image dimensions from file
 */
export const getImageDimensions = (file: File): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

/**
 * Resize image to specified dimensions
 */
export const resizeImage = (file: File, options: ResizeOptions = {}): Promise<string> => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
    outputFormat = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    img.onload = () => {
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      resolve(canvas.toDataURL(outputFormat, quality));
    };
    
    img.onerror = () => reject(new Error('Failed to load image for resizing'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Compress image to reduce file size
 */
export const compressImage = (file: File, options: CompressOptions = {}): Promise<string> => {
  const {
    maxSizeKB = 500,
    quality = 0.8,
    outputFormat = 'image/jpeg',
  } = options;

  return new Promise(async (resolve, reject) => {
    try {
      let compressedImage = await fileToBase64(file);
      let currentQuality = quality;
      
      while (currentQuality > 0.1) {
        const base64Data = compressedImage.split(',')[1];
        const sizeInKB = Math.round((base64Data.length * 3) / 4 / 1024);
        
        if (sizeInKB <= maxSizeKB) break;
        
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        await new Promise<void>((resolveImg) => {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            compressedImage = canvas.toDataURL(outputFormat, currentQuality);
            resolveImg();
          };
          img.src = compressedImage;
        });
        
        currentQuality -= 0.1;
      }
      
      resolve(compressedImage);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate a unique filename for uploaded images
 */
export const generateImageFilename = (file: File, prefix = 'img'): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop();
  return `${prefix}_${timestamp}_${randomString}.${extension}`;
};

/**
 * Check if a string is a valid base64 image
 */
export const isValidBase64Image = (base64String: unknown): boolean => {
  if (typeof base64String !== 'string') return false;
  const base64Pattern = /^data:image\/[a-z]+;base64,/;
  return base64Pattern.test(base64String);
};

/**
 * Extract file extension from base64 string
 */
export const getExtensionFromBase64 = (base64String: string): string => {
  const mime = base64String.split(':')[1]?.split(';')[0];
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  return extensions[mime] || 'jpg';
};

/**
 * Create a thumbnail from an image
 */
export const createThumbnail = (image: File | string, options: ThumbnailOptions = {}): Promise<string> => {
  const {
    width = 150,
    height = 150,
    quality = 0.8,
    outputFormat = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    img.onload = () => {
      let { width: imgWidth, height: imgHeight } = img;
      const aspectRatio = imgWidth / imgHeight;
      
      if (aspectRatio > 1) {
        imgHeight = width / aspectRatio;
        imgWidth = width;
      } else {
        imgWidth = height * aspectRatio;
        imgHeight = height;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      
      const x = (width - imgWidth) / 2;
      const y = (height - imgHeight) / 2;
      ctx.drawImage(img, x, y, imgWidth, imgHeight);
      
      resolve(canvas.toDataURL(outputFormat, quality));
    };
    
    img.onerror = () => reject(new Error('Failed to create thumbnail'));
    img.src = typeof image === 'string' ? image : URL.createObjectURL(image);
  });
};

/**
 * Store image in localStorage with size limit
 */
export const storeImageInLocalStorage = (key: string, base64Image: string, maxStorageMB = 10): boolean => {
  try {
    const sizeInMB = Math.round(base64Image.length * 3 / 4 / 1024 / 1024);
    if (sizeInMB > maxStorageMB) {
      console.warn(`Image size (${sizeInMB}MB) exceeds storage limit (${maxStorageMB}MB)`);
      return false;
    }
    localStorage.setItem(key, base64Image);
    return true;
  } catch (error) {
    console.error('Failed to store image in localStorage:', error);
    return false;
  }
};

/**
 * Retrieve image from localStorage
 */
export const getImageFromLocalStorage = (key: string): string | null => {
  try {
    const image = localStorage.getItem(key);
    return image && isValidBase64Image(image) ? image : null;
  } catch (error) {
    console.error('Failed to retrieve image from localStorage:', error);
    return null;
  }
};
