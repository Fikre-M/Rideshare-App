import { useState, useRef, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Avatar, 
  IconButton, 
  Paper, 
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ImageUpload = ({
  currentImage,
  onImageChange,
  onImageRemove,
  size = 120,
  disabled = false,
  showPreview = true,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  borderRadius = '50%',
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(currentImage || null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Validate image file
  const validateImage = useCallback((file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return false;
    }

    if (file.size > maxSize) {
      setError(`Image size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return false;
    }

    return true;
  }, [maxSize]);

  // Convert file to base64
  const fileToBase64 = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(async (file) => {
    if (!file || disabled) return;

    setError('');
    
    if (!validateImage(file)) {
      return;
    }

    setIsUploading(true);

    try {
      // Only convert to base64 if we need to show preview
      // Let the parent handle the actual upload
      const base64Image = await fileToBase64(file);
      setPreviewImage(base64Image);
      
      // Notify parent component with both base64 and original file
      if (onImageChange) {
        await onImageChange(base64Image, file);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Failed to process image');
    } finally {
      setIsUploading(false);
    }
  }, [disabled, validateImage, fileToBase64, onImageChange]);

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  // Handle file input change
  const handleInputChange = useCallback((e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle image removal
  const handleRemove = useCallback(() => {
    if (disabled) return;
    
    setPreviewImage(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageRemove) {
      onImageRemove();
    }
  }, [disabled, onImageRemove]);

  // Trigger file input
  const triggerFileInput = useCallback(() => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  }, [disabled, isUploading]);

  return (
    <>
      <Box className={className} sx={{ position: 'relative', display: 'inline-block' }}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          style={{ display: 'none' }}
          disabled={disabled}
        />

        {/* Upload area */}
        <Paper
          sx={{
            position: 'relative',
            width: size,
            height: size,
            borderRadius,
            overflow: 'hidden',
            border: isDragging ? '2px dashed' : '2px solid',
            borderColor: isDragging ? 'primary.main' : 'grey.300',
            backgroundColor: isDragging ? 'primary.light' : 'grey.50',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              borderColor: disabled ? 'grey.300' : 'primary.main',
              backgroundColor: disabled ? 'grey.50' : 'primary.light',
            },
          }}
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Image preview */}
          {previewImage ? (
            <>
              <Avatar
                src={previewImage}
                sx={{
                  width: size,
                  height: size,
                  borderRadius,
                }}
                imgProps={{
                  onClick: (e) => {
                    e.stopPropagation();
                    if (showPreview) {
                      setShowFullPreview(true);
                    }
                  },
                }}
              />
              
              {/* Edit/Remove buttons overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  '&:hover': { opacity: 1 },
                }}
              >
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Change Image">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerFileInput();
                      }}
                      sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.2)' }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove Image">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove();
                      }}
                      sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.2)' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              {isUploading ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <UploadIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Upload Image
                  </Typography>
                </>
              )}
            </Box>
          )}

          {/* Loading overlay */}
          {isUploading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </Paper>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 1, display: 'block', textAlign: 'center' }}
              >
                {error}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload instructions */}
        {!previewImage && !error && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
            Click or drag & drop an image
          </Typography>
        )}
      </Box>

      {/* Full preview dialog */}
      <Dialog
        open={showFullPreview}
        onClose={() => setShowFullPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>Image Preview</Typography>
            <IconButton onClick={() => setShowFullPreview(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            <img
              src={previewImage}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                borderRadius: 8,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFullPreview(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ImageUpload;
