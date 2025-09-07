import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop } from 'react-image-crop';
import { EditMode } from '../types';
import { getCroppedImg, getExtendedImg } from '../utils/imageUtils';
import { CropIcon } from './icons/CropIcon';
import { MagicExpandIcon } from './icons/MagicExpandIcon';
import { LockIcon } from './icons/LockIcon';
import { UnlockIcon } from './icons/UnlockIcon';

interface ImageEditorProps {
  src: string;
  originalSrc: string;
  editMode: EditMode;
  onEditModeChange: (mode: EditMode) => void;
  onEditComplete: (dataUrl: string, details: { type: 'crop' | 'magic-expand', width?: number, height?: number }) => void;
  isExtended: boolean;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ src, originalSrc, editMode, onEditModeChange, onEditComplete, isExtended }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [extendSize, setExtendSize] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  useEffect(() => {
    const image = new Image();
    image.src = src;
    image.onload = () => {
        const dims = { width: image.width, height: image.height };
        setImageSize(dims);
        if (editMode === 'magic-expand') {
            setExtendSize(dims);
        }
    }
  }, [src, editMode]);


  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    // FIX: The explicit `Crop` type is too broad for `centerCrop`, which is overloaded.
    // By removing it and using `as const`, we let TypeScript infer the precise
    // type `{ unit: '%', ... }`, which allows it to select the correct overload.
    const initialCrop = {
      unit: '%' as const,
      x: 5,
      y: 5,
      width: 90,
      height: 90,
    };
    setCrop(centerCrop(initialCrop, width, height));
    setCompletedCrop({
        unit: 'px',
        x: width * 0.05,
        y: height * 0.05,
        width: width * 0.9,
        height: height * 0.9,
    });
  }

  const handleApplyCrop = async () => {
    if (completedCrop && imgRef.current) {
      try {
        const croppedImageUrl = await getCroppedImg(imgRef.current, completedCrop);
        onEditComplete(croppedImageUrl, { type: 'crop' });
      } catch (e) {
        console.error('Error cropping image', e);
      }
    }
  };

  const handleApplyExtend = async () => {
      if (extendSize.width < imageSize.width || extendSize.height < imageSize.height) {
        return; // Prevent applying if dimensions are smaller
      }
      try {
        const extendedUrl = await getExtendedImg(src, extendSize.width, extendSize.height);
        onEditComplete(extendedUrl, { type: 'magic-expand', width: extendSize.width, height: extendSize.height });
      } catch (e) {
        console.error('Error extending image', e);
      }
  }
  
  const handleExtendWidthChange = (newWidthStr: string) => {
    const newWidth = parseInt(newWidthStr, 10) || 0;
    if (lockAspectRatio && imageSize.width > 0) {
        const ratio = imageSize.height / imageSize.width;
        const newHeight = Math.round(newWidth * ratio);
        setExtendSize({ width: newWidth, height: newHeight });
    } else {
        setExtendSize(s => ({ ...s, width: newWidth }));
    }
  };

  const handleExtendHeightChange = (newHeightStr: string) => {
    const newHeight = parseInt(newHeightStr, 10) || 0;
    if (lockAspectRatio && imageSize.height > 0) {
        const ratio = imageSize.width / imageSize.height;
        const newWidth = Math.round(newHeight * ratio);
        setExtendSize({ width: newWidth, height: newHeight });
    } else {
        setExtendSize(s => ({ ...s, height: newHeight }));
    }
  };

  const handleCancelEdit = () => {
    onEditModeChange(null);
    onEditComplete(originalSrc, { type: 'crop' }); // Revert to original
  }

  const renderEditControls = () => {
    if (editMode === 'crop') {
      return (
        <div className="flex items-center space-x-4 mt-6 animate-fade-in-fast">
          <button onClick={handleApplyCrop} className="px-6 py-2 bg-black text-white rounded-md transition-all duration-200 ease-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">Apply Crop</button>
          <button onClick={handleCancelEdit} className="px-6 py-2 border border-black text-black rounded-md transition-all duration-200 ease-out hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">Cancel</button>
        </div>
      );
    }
    if (editMode === 'magic-expand') {
      const canApplyExtend = extendSize.width >= imageSize.width && extendSize.height >= imageSize.height;
      return (
        <div className="flex flex-col items-center mt-6 space-y-4 animate-fade-in-fast">
          <p className="text-sm text-black/80">Expand canvas & let AI fill the gaps:</p>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={extendSize.width}
              onChange={(e) => handleExtendWidthChange(e.target.value)}
              className="w-24 p-2 border border-black/20 rounded-md text-center focus:ring-2 focus:ring-black"
              aria-label="Width"
            />
            <button 
                onClick={() => setLockAspectRatio(l => !l)}
                className="p-2 rounded-md hover:bg-black/10 transition-colors focus:outline-none focus:ring-2 focus:ring-black"
                aria-label={lockAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
            >
                {lockAspectRatio ? <LockIcon /> : <UnlockIcon />}
            </button>
            <input
              type="number"
              value={extendSize.height}
              onChange={(e) => handleExtendHeightChange(e.target.value)}
              className="w-24 p-2 border border-black/20 rounded-md text-center focus:ring-2 focus:ring-black"
              aria-label="Height"
            />
          </div>
          <div className="flex items-center space-x-4 pt-2">
            <button 
              onClick={handleApplyExtend} 
              disabled={!canApplyExtend}
              className="px-6 py-2 bg-black text-white rounded-md transition-all duration-200 ease-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-black/40 disabled:cursor-not-allowed disabled:scale-100"
            >
              Apply Expansion
            </button>
            <button onClick={handleCancelEdit} className="px-4 py-2 border border-black text-black rounded-md transition-all duration-200 ease-out hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">Cancel</button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-8 mt-8">
        <button
          onClick={() => onEditModeChange('crop')}
          className="group flex flex-col items-center text-black/80 hover:text-black transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded-lg p-2"
          aria-label="Crop image"
        >
            <div className="w-14 h-14 border border-black/20 rounded-lg flex items-center justify-center group-hover:border-black transition-colors">
                <CropIcon />
            </div>
            <span className="mt-2 text-sm font-medium tracking-wide">Crop</span>
        </button>
        <button
          onClick={() => onEditModeChange('magic-expand')}
          className="group flex flex-col items-center text-black/80 hover:text-black transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded-lg p-2"
          aria-label="Magic expand image"
        >
            <div className="w-14 h-14 border border-black/20 rounded-lg flex items-center justify-center group-hover:border-black transition-colors">
                <MagicExpandIcon />
            </div>
            <span className="mt-2 text-sm font-medium tracking-wide">Magic Expand</span>
        </button>
      </div>
    );
  };

  return (
    <div className="w-full max-w-lg flex flex-col items-center">
      {editMode === 'crop' ? (
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
        >
          <img
            ref={imgRef}
            alt="Crop me"
            src={src}
            onLoad={onImageLoad}
            className="max-w-full max-h-[60vh] object-contain"
          />
        </ReactCrop>
      ) : (
        <img
          src={src}
          alt="User upload"
          className="max-w-full max-h-[60vh] object-contain rounded-lg"
          style={{ background: editMode === 'magic-expand' || (isExtended && src.includes('data:image/png')) ? 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'10\' height=\'10\' x=\'0\' y=\'0\' fill=\'%23f0f0f0\' /%3E%3Crect width=\'10\' height=\'10\' x=\'10\' y=\'10\' fill=\'%23f0f0f0\' /%3E%3C/svg%3E")' : 'none' }}
        />
      )}
      {renderEditControls()}
      <style>{`
        @keyframes fade-in-fast {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in-fast {
            animation: fade-in-fast 0.3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};
