import React from 'react';
import { Session } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface GalleryItemProps {
    session: Session;
    onLoadSession: (session: Session) => void;
    onDeleteSession: (id: number) => void;
}

export const GalleryItem: React.FC<GalleryItemProps> = ({ session, onLoadSession, onDeleteSession }) => {
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent loading the session when deleting
        onDeleteSession(session.id);
    };

    return (
        <div 
            className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer border border-black/10 hover:border-black/30 transition-all duration-200"
            onClick={() => onLoadSession(session)}
            role="button"
            aria-label={`Load project from ${new Date(session.timestamp).toLocaleString()}`}
        >
            <img 
                src={session.thumbnail} 
                alt={`Project from ${new Date(session.timestamp).toLocaleString()}`}
                className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <button
                onClick={handleDelete}
                className="absolute top-1 right-1 p-1.5 rounded-full bg-white/70 text-black backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-black"
                aria-label="Delete project"
            >
                <TrashIcon />
            </button>
        </div>
    );
};
