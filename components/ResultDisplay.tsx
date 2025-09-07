import React from 'react';
import { ImageContainer } from './ImageContainer';
import { DownloadIcon } from './icons/DownloadIcon';

interface ResultDisplayProps {
  originalImage: string;
  editedImage: string;
  onReset: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalImage, editedImage, onReset }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = editedImage;
    link.download = `edited-photo-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-normal tracking-wider text-black/60 mb-4">Original</h2>
          <ImageContainer src={originalImage} alt="Original image" />
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-normal tracking-wider text-black/60 mb-4">Enhanced</h2>
          <ImageContainer src={editedImage} alt="Edited image" />
        </div>
      </div>
      <div className="flex items-center space-x-6 mt-12">
        <button
          onClick={handleDownload}
          className="group flex items-center justify-center px-6 py-3 bg-black text-white rounded-md transition-all duration-220ms ease-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-black"
        >
          <DownloadIcon />
          <span className="ml-2">Download</span>
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 border border-black text-black rounded-md transition-all duration-200 ease-out hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          Start Over
        </button>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};