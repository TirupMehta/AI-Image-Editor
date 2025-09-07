import React from 'react';

interface EditControlsProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onEnhance: () => void;
  disabled: boolean;
}

export const EditControls: React.FC<EditControlsProps> = ({ prompt, onPromptChange, onEnhance, disabled }) => {
  return (
    <div className="w-full max-w-lg flex flex-col items-center space-y-6 animate-fade-slide-up">
      <div className="w-full">
        <label htmlFor="prompt" className="block text-sm font-medium text-black/80 mb-2 text-center tracking-wide">
          Or, customize the enhancement prompt
        </label>
        <textarea
          id="prompt"
          rows={3}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="w-full p-3 border border-black/20 rounded-md focus:ring-2 focus:ring-black focus:border-black outline-none transition-all duration-200 bg-white placeholder-black/40 text-center"
          placeholder="e.g., Make it look like a professional product shot"
          disabled={disabled}
        />
      </div>
      <button
        onClick={onEnhance}
        disabled={disabled}
        className="px-10 py-3 bg-black text-white rounded-md transition-all duration-220ms ease-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-black disabled:bg-black/50 disabled:cursor-not-allowed"
      >
        {disabled ? 'Processing...' : 'Enhance Photo'}
      </button>
       <style>{`
        @keyframes fade-slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide-up {
          animation: fade-slide-up 0.5s cubic-bezier(0.2, 0.9, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};