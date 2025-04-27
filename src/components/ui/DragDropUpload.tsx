import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface DragDropUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  preview?: string | null;
  error?: string | null;
  className?: string;
}

const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onFileSelect,
  accept = "image/*",
  maxSize = 4 * 1024 * 1024, // 4MB default
  icon = <Upload className="h-8 w-8 mx-auto text-gray-400" />,
  title = "Drop image here or click to upload",
  subtitle = "JPEG, PNG or WebP, max 4 MB",
  preview = null,
  error = null,
  className = ""
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    validateAndProcessFile(files[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    validateAndProcessFile(files[0]);
  };

  const validateAndProcessFile = (file: File) => {
    if (!file) return;

    // Validate mime type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      console.error('File too large');
      return;
    }

    onFileSelect(file);
  };

  return (
    <div
      className={`relative border-2 ${
        isDragging ? 'border-navy-500 bg-navy-50' : 'border-dashed border-gray-200'
      } rounded-lg p-8 text-center transition-colors cursor-pointer hover:border-navy-300 ${className}`}
      onClick={() => fileInputRef.current?.click()}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
      ) : (
        <div className="space-y-2">
          {icon}
          <p className="text-gray-600">{title}</p>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      {isDragging && (
        <div className="absolute inset-0 bg-navy-50 bg-opacity-50 rounded-lg flex items-center justify-center">
          <p className="text-navy-600 font-medium">Drop image here</p>
        </div>
      )}
    </div>
  );
};

export default DragDropUpload;