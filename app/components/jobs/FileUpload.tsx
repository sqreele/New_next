import React, { ChangeEvent, useRef } from 'react';
import { Button } from '@/app/components/ui/button';

export interface FileUploadProps {
  onChange: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onChange,
  maxFiles = 5,
  accept = "image/*",
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }
    onChange(files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple={maxFiles > 1}
        disabled={disabled}
        className="hidden"
      />
      <Button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        variant="outline"
      >
        Select Files
      </Button>
    </div>
  );
};

export default FileUpload;