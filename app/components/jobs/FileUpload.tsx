// Assuming this is the FileUpload component (`FileUpload.tsx`)

import React from 'react';

export interface FileUploadProps {
  files: File[];
  onFileChange: (files: File[]) => void;
  error: string;
  touched: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ files, onFileChange, error, touched }) => {
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const filesArray = Array.from(selectedFiles);
      onFileChange(filesArray);
    }
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFileChange} />
      {touched && error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="mt-2">
        {files.length > 0 && (
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
