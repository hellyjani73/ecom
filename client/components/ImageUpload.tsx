'use client';

import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Paper,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';

interface ImageUploadProps {
  value?: string | null;
  onChange: (base64: string | null) => void;
  error?: boolean;
  helperText?: string;
}

export default function ImageUpload({ value, onChange, error, helperText }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      onChange(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />
      
      {preview ? (
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Paper
            elevation={2}
            sx={{
              p: 1,
              display: 'inline-block',
              border: error ? '2px solid red' : '1px solid #e0e0e0',
              borderRadius: 1,
            }}
          >
            <Box
              component="img"
              src={preview}
              alt="Preview"
              sx={{
                maxWidth: '200px',
                maxHeight: '200px',
                display: 'block',
                borderRadius: 1,
              }}
            />
          </Paper>
          <IconButton
            onClick={handleRemove}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'error.main',
              color: 'white',
              '&:hover': { bgcolor: 'error.dark' },
            }}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ) : (
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUploadIcon />}
          onClick={handleClick}
          sx={{
            border: error ? '2px solid red' : undefined,
            minHeight: '120px',
            width: '100%',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <ImageIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
          <Typography variant="body2">Upload Image</Typography>
          <Typography variant="caption" color="text.secondary">
            Max 5MB, WebP format
          </Typography>
        </Button>
      )}
      
      {helperText && (
        <Typography
          variant="caption"
          color={error ? 'error' : 'text.secondary'}
          sx={{ mt: 0.5, display: 'block' }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}

