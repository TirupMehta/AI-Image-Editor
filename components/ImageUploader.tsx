import React, { useRef, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { Gallery } from './Gallery';
import { Session } from '../types';

interface ImageUploaderProps {
  onImageChange: (file: File | null) => void;
  gallery: Session[];
  onLoadSession: (session: Session) => void;
  onDeleteSession: (id: number) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, gallery, onLoadSession, onDeleteSession }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onImageChange(file || null);
  };

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
       <h2 className="text-2xl text-center mb-2 tracking-wide font-medium">AI Photo Enhancer</h2>
       <p className="text-center mb-8 max-w-md text-black/60">
        Upload a photo, choose an AI style, then crop, magic expand, and enhance it to create a professional look.
      </p>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      <button
        onClick={handleClick}
        className="w-full max-w-lg h-80 border-2 border-dashed border-black/30 rounded-lg flex flex-col items-center justify-center text-black/60 hover:bg-black/5 hover:border-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-black"
        aria-label="Upload an image"
      >
        <UploadIcon />
        <span className="mt-4 text-lg">Click to upload an image</span>
        <span className="mt-1 text-sm">PNG, JPG, or WEBP</span>
      </button>

      {gallery.length > 0 && (
          <Gallery 
            sessions={gallery}
            onLoadSession={onLoadSession}
            onDeleteSession={onDeleteSession}
          />
      )}
    </div>
  );
};