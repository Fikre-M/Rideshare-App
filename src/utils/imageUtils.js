/**
 * Image utility functions for processing and validating images
 */

/**
 * Validate image file
 * @param {File} file - The image file to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateImageFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    minWidth = 0,
    minHeight = 0,
    maxWidth = 5000,
    maxHeight = 5000,
  } = options;

  const errors = [];

  // Check file type
  if (!file.type.startsWith('image/')) {
    errors.push('File must be an image');
  }

  // Check allowed types
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`Image type must be one of: ${allowedTypes.join(', ')}`);
  }

  // Check file size
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
 * @param {File} file - The image file
 * @returns {Promise<string>} - Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Get image dimensions from file
 * @param {File} file - The image file
 * @returns {Promise<Object>} - Image dimensions {width, height}
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
      });
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
 * @param {File} file - The image file
 * @param {Object} options - Resize options
 * @returns {Promise<string>} - Resized image as base64
 */
export const resizeImage = (file, options = {}) => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
    outputFormat = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and resize image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64
      const resizedImage = canvas.toDataURL(outputFormat, quality);
      resolve(resizedImage);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for resizing'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Compress image to reduce file size
 * @param {File} file - The image file
 * @param {Object} options - Compression options
 * @returns {Promise<string>} - Compressed image as base64
 */
export const compressImage = (file, options = {}) => {
  const {
    maxSizeKB = 500, // Target size in KB
    quality = 0.8,
    outputFormat = 'image/jpeg',
  } = options;

  return new Promise(async (resolve, reject) => {
    try {
      let compressedImage = await fileToBase64(file);
      let currentQuality = quality;
      
      // Keep reducing quality until file size is under target
      while (currentQuality > 0.1) {
        const base64Data = compressedImage.split(',')[1];
        const sizeInKB = Math.round((base64Data.length * 3) / 4 / 1024);
        
        if (sizeInKB <= maxSizeKB) {
          break;
        }
        
        // Resize and compress again with lower quality
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        await new Promise((resolveImg) => {
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
 * @param {File} file - The original file
 * @param {string} prefix - Optional prefix for the filename
 * @returns {string} - Generated filename
 */
export const generateImageFilename = (file, prefix = 'img') => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop();
  return `${prefix}_${timestamp}_${randomString}.${extension}`;
};

/**
 * Check if a string is a valid base64 image
 * @param {string} base64String - The string to check
 * @returns {boolean} - Whether it's a valid base64 image
 */
export const isValidBase64Image = (base64String) => {
  if (typeof base64String !== 'string') return false;
  
  const base64Pattern = /^data:image\/[a-z]+;base64,/;
  return base64Pattern.test(base64String);
};

/**
 * Extract file extension from base64 string
 * @param {string} base64String - The base64 string
 * @returns {string} - File extension
 */
export const getExtensionFromBase64 = (base64String) => {
  const mime = base64String.split(':')[1]?.split(';')[0];
  const extensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  return extensions[mime] || 'jpg';
};

/**
 * Create a thumbnail from an image
 * @param {File|string} image - Image file or base64 string
 * @param {Object} options - Thumbnail options
 * @returns {Promise<string>} - Thumbnail as base64
 */
export const createThumbnail = (image, options = {}) => {
  const {
    width = 150,
    height = 150,
    quality = 0.8,
    outputFormat = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Calculate dimensions to maintain aspect ratio
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
      
      // Clear canvas and center image
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      
      const x = (width - imgWidth) / 2;
      const y = (height - imgHeight) / 2;
      
      ctx.drawImage(img, x, y, imgWidth, imgHeight);
      
      const thumbnail = canvas.toDataURL(outputFormat, quality);
      resolve(thumbnail);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to create thumbnail'));
    };
    
    img.src = typeof image === 'string' ? image : URL.createObjectURL(image);
  });
};

/**
 * Store image in localStorage with size limit
 * @param {string} key - Storage key
 * @param {string} base64Image - Base64 image string
 * @param {number} maxStorageMB - Maximum storage size in MB
 * @returns {boolean} - Whether the image was stored successfully
 */
export const storeImageInLocalStorage = (key, base64Image, maxStorageMB = 10) => {
  try {
    // Check storage quota
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
 * @param {string} key - Storage key
 * @returns {string|null} - Base64 image string or null
 */
export const getImageFromLocalStorage = (key) => {
  try {
    const image = localStorage.getItem(key);
    return image && isValidBase64Image(image) ? image : null;
  } catch (error) {
    console.error('Failed to retrieve image from localStorage:', error);
    return null;
  }
};
