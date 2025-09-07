import React from 'react';

interface Preset {
  name: string;
  prompt: string;
}

const presets: Preset[] = [
  { 
    name: 'Standard Enhance', 
    prompt: 'Make this photo look more professional and high-quality, with better lighting and sharpness.' 
  },
  { 
    name: 'Cinematic', 
    prompt: 'Give this a cinematic look with dramatic lighting, deep shadows, and rich, moody colors. Add a slight film grain.' 
  },
  { 
    name: 'Vintage', 
    prompt: 'Apply a vintage film aesthetic. Add subtle grain, slightly faded colors, and warm tones characteristic of old photographs.' 
  },
  { 
    name: 'Product Shot', 
    prompt: 'Transform this into a minimalist product shot. Create a clean, bright, seamless background, sharp focus on the subject, and soft, natural-looking shadows.' 
  },
];

interface StylePresetsProps {
  onSelectPreset: (prompt: string) => void;
  activePrompt: string;
}

export const StylePresets: React.FC<StylePresetsProps> = ({ onSelectPreset, activePrompt }) => {
  return (
    <div className="w-full max-w-lg animate-fade-in-fast">
      <p className="text-sm font-medium text-black/80 mb-3 text-center tracking-wide">
        Choose an AI Style Preset
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onSelectPreset(preset.prompt)}
            className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
              ${activePrompt === preset.prompt
                ? 'bg-black text-white'
                : 'bg-white text-black border border-black/20 hover:bg-black/5'
              }
            `}
          >
            {preset.name}
          </button>
        ))}
      </div>
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