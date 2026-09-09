import { useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, ImagePlus } from 'lucide-react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILES = 5;
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function PhotoUpload({ files, onFilesChange }) {
  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files]
  );

  const onDrop = useCallback(
    (accepted, rejected) => {
      const incoming = accepted.filter(
        (f) => f.size <= MAX_SIZE_BYTES && ACCEPTED_TYPES.includes(f.type)
      );
      const remaining = Math.max(0, MAX_FILES - files.length);
      const roomForMore = remaining > 0;
      const next = [...files, ...incoming].slice(0, MAX_FILES);
      onFilesChange(next);
    },
    [files, onFilesChange]
  );

  const exceeded = files.length >= MAX_FILES;
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: MAX_FILES,
    maxSize: MAX_SIZE_BYTES,
    disabled: exceeded,
    onDrop,
  });

  const removeFile = (index) => {
    const next = files.filter((_, i) => i !== index);
    onFilesChange(next);
    if (previews[index]) URL.revokeObjectURL(previews[index]);
  };

  return (
    <div className="space-y-3">
      {!exceeded && (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg py-8 cursor-pointer text-center transition-colors ${
            isDragActive
              ? 'border-green-600 bg-green-50'
              : 'border-green-300 hover:border-green-600 hover:bg-green-50'
          }`}
        >
          <input {...getInputProps()} />
          <ImagePlus className="h-8 w-8 text-green-600" />
          <p className="text-sm text-on-surface">
            Drag &amp; drop images here, or click to select
          </p>
          <p className="text-xs text-on-surface-variant/70">
            JPEG, PNG or WebP • max {MAX_SIZE_MB}MB each
          </p>
        </div>
      )}

      {files.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {files.map((file, i) => (
            <div key={i} className="relative h-20 w-20 shrink-0">
              <img
                src={previews[i]}
                alt={file.name || `preview-${i}`}
                className="h-full w-full rounded-lg object-cover border border-outline-variant/80"
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label="Remove image"
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length >= MAX_FILES && (
        <p className="text-xs text-amber-600">Maximum 5 images allowed</p>
      )}
    </div>
  );
}