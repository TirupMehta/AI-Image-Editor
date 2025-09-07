import React from 'react';
import { Session } from '../types';
import { GalleryItem } from './GalleryItem';

interface GalleryProps {
    sessions: Session[];
    onLoadSession: (session: Session) => void;
    onDeleteSession: (id: number) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ sessions, onLoadSession, onDeleteSession }) => {
    return (
        <div className="w-full max-w-4xl mt-16">
            <h3 className="text-xl font-medium text-center mb-6 tracking-wide">Recent Projects</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {sessions.map(session => (
                    <GalleryItem
                        key={session.id}
                        session={session}
                        onLoadSession={onLoadSession}
                        onDeleteSession={onDeleteSession}
                    />
                ))}
            </div>
        </div>
    );
};
