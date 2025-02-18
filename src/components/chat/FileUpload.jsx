import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const ACCEPTED_FILE_TYPES = {
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  'application/pdf': ['.pdf'],
  'text/*': ['.txt', '.md', '.json', '.csv', '.js', '.jsx', '.ts', '.tsx', '.html', '.css'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const FileUpload = ({ onFileSelect, onError }) => {
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => {
        if (file.size > MAX_FILE_SIZE) {
          return '文件大小超过限制(10MB)';
        }
        return '不支持的文件类型';
      });
      onError(errors[0]);
      return;
    }

    const file = acceptedFiles[0];
    if (file.size > MAX_FILE_SIZE) {
      onError('文件大小超过限制(10MB)');
      return;
    }

    // 读取文件内容
    const reader = new FileReader();
    reader.onload = () => {
      onFileSelect({
        name: file.name,
        type: file.type,
        size: file.size,
        content: reader.result
      });
    };
    reader.onerror = () => onError('文件读取失败');

    if (file.type.startsWith('text/') || file.type === 'application/json') {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  }, [onFileSelect, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1,
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`p-4 border-2 border-dashed rounded-lg transition-all duration-200 ${
        isDragActive
          ? 'border-purple-500 bg-purple-50'
          : 'border-gray-300 hover:border-purple-400'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center text-center">
        <svg
          className="w-8 h-8 text-gray-400 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-sm text-gray-600">
          {isDragActive ? (
            '释放文件以上传'
          ) : (
            <>
              拖放文件到此处，或<span className="text-purple-600">点击选择文件</span>
            </>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          支持的文件类型: 图片, PDF, Word, Excel, 文本文件等
        </p>
        <p className="text-xs text-gray-500">
          最大文件大小: 10MB
        </p>
      </div>
    </div>
  );
};

export default React.memo(FileUpload); 