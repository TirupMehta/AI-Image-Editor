import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ImageUploader } from './components/ImageUploader';
import { EditControls } from './components/EditControls';
import { ResultDisplay } from './components/ResultDisplay';
import { ImageEditor } from './components/ImageEditor';
import { StylePresets } from './components/StylePresets';
import { Spinner } from './components/Spinner';
import { AppStatus, EditMode, Session } from './types';
import { toBase64 } from './utils/fileUtils';
import { editImage } from './services/geminiService';
import { createThumbnail, getAspectRatioDescription } from './utils/imageUtils';

const LOCAL_STORAGE_KEY = 'photoEditorSessions';
const MAX_SESSIONS = 10;
const DEFAULT_PROMPT = 'Make this photo look more professional and high-quality, with better lighting and sharpness.';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [isExtended, setIsExtended] = useState<boolean>(false);
  const [extendedAspectRatio, setExtendedAspectRatio] = useState<string | null>(null);
  const [gallery, setGallery] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);

  // Load gallery from local storage on initial render
  useEffect(() => {
    try {
      const savedSessionsString = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedSessionsString) {
        const savedSessions = JSON.parse(savedSessionsString);
        if (Array.isArray(savedSessions)) {
          setGallery(savedSessions);
        }
      }
    } catch (e) {
      console.error("Failed to load sessions from local storage", e);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const saveSession = useCallback(async () => {
    if (!originalImage || !userImage) return;

    const thumbnail = await createThumbnail(userImage);

    const newSession: Session = {
      id: sessionId || Date.now(),
      timestamp: Date.now(),
      userImage,
      originalImage,
      editedImage,
      prompt,
      status,
      thumbnail,
      isExtended,
    };

    setGallery(prevGallery => {
      const otherSessions = prevGallery.filter(s => s.id !== newSession.id);
      const updatedGallery = [newSession, ...otherSessions].slice(0, MAX_SESSIONS);
      
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedGallery));
      } catch (e) {
         console.warn('Could not save session: Local storage quota might be exceeded.');
      }
      
      return updatedGallery;
    });
    setSessionId(newSession.id);
  }, [sessionId, originalImage, userImage, editedImage, prompt, status, isExtended]);

  // Auto-save on significant changes
  useEffect(() => {
    if (status === AppStatus.IDLE || status === AppStatus.SUCCESS) {
      if (userImage && originalImage) {
        const timer = setTimeout(() => {
          saveSession();
        }, 1000); // Debounce saving
        return () => clearTimeout(timer);
      }
    }
  }, [userImage, originalImage, editedImage, prompt, status, saveSession]);

  const handleImageChange = useCallback(async (file: File | null) => {
    if (file) {
      try {
        const dataUrl = await toBase64(file) as string;
        setOriginalImage(dataUrl);
        setUserImage(dataUrl);
        setStatus(AppStatus.IDLE);
        setError(null);
        setEditedImage(null);
        setEditMode(null);
        setIsExtended(false);
        setExtendedAspectRatio(null);
        setSessionId(Date.now()); // Create a new session ID
      } catch (err) {
        setError('Could not process the selected file.');
        setStatus(AppStatus.ERROR);
      }
    }
  }, []);

  const handleEnhance = useCallback(async () => {
    if (!userImage) {
      setError('Please upload an image first.');
      setStatus(AppStatus.ERROR);
      return;
    }

    setStatus(AppStatus.PROCESSING);
    setError(null);

    try {
      const mimeTypeMatch = userImage.match(/data:(.*);base64,/);
      if (!mimeTypeMatch || !mimeTypeMatch[1]) {
        throw new Error("Invalid image data URL: could not determine MIME type.");
      }
      const mimeType = mimeTypeMatch[1];
      const base64Data = userImage.split(',')[1];
      
      let finalPrompt = prompt;
      if (isExtended) {
        let extendInstruction = `First, extend the background of the image in the center to fill the transparent areas seamlessly, matching the existing style.`;
        if (extendedAspectRatio) {
            extendInstruction += ` The final image should have a ${extendedAspectRatio} aspect ratio.`;
        }
        finalPrompt = `${extendInstruction} Then, apply this user request: "${prompt}"`;
      }

      const resultBase64 = await editImage(base64Data, mimeType, finalPrompt);
      
      setEditedImage(`data:${mimeType};base64,${resultBase64}`);
      setStatus(AppStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during image editing.');
      setStatus(AppStatus.ERROR);
    }
  }, [userImage, prompt, isExtended, extendedAspectRatio]);

  const handleReset = useCallback(() => {
    setStatus(AppStatus.IDLE);
    setOriginalImage(null);
    setUserImage(null);
    setEditedImage(null);
    setError(null);
    setPrompt(DEFAULT_PROMPT);
    setEditMode(null);
    setIsExtended(false);
    setExtendedAspectRatio(null);
    setSessionId(null);
  }, []);
  
  const loadSession = (sessionToLoad: Session) => {
    setSessionId(sessionToLoad.id);
    setOriginalImage(sessionToLoad.originalImage);
    setUserImage(sessionToLoad.userImage);
    setEditedImage(sessionToLoad.editedImage);
    setPrompt(sessionToLoad.prompt);
    setStatus(sessionToLoad.status);
    setIsExtended(sessionToLoad.isExtended);
    setEditMode(null);
    setError(null);
  };

  const deleteSession = (idToDelete: number) => {
    setGallery(prevGallery => {
      const updatedGallery = prevGallery.filter(s => s.id !== idToDelete);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedGallery));
      return updatedGallery;
    });
    // If deleting the current session, reset the view
    if (sessionId === idToDelete) {
      handleReset();
    }
  };

  const handleEditComplete = (dataUrl: string, details: { type: 'crop' | 'magic-expand', width?: number, height?: number }) => {
    setUserImage(dataUrl);
    setEditMode(null);
    
    if (details.type === 'magic-expand' && details.width && details.height) {
      setIsExtended(true);
      setExtendedAspectRatio(getAspectRatioDescription(details.width, details.height));
    } else if (details.type === 'crop') {
      // If we crop an extended image, it's no longer considered "extended" for the prompt
      setIsExtended(false); 
      setExtendedAspectRatio(null);
    }
  };

  const renderContent = () => {
    const isProcessing = status === AppStatus.PROCESSING;
    switch (status) {
      case AppStatus.PROCESSING:
        return (
          <div className="w-full max-w-lg text-center flex flex-col items-center justify-center h-[50vh]">
            <Spinner />
            <p className="mt-6 text-lg tracking-wide">Enhancing your image...</p>
            <p className="text-sm tracking-wide mt-2">This may take a moment.</p>
          </div>
        );
      case AppStatus.SUCCESS:
        return userImage && editedImage && (
          <ResultDisplay
            originalImage={userImage}
            editedImage={editedImage}
            onReset={handleReset}
          />
        );
      case AppStatus.ERROR:
        return (
          <div className="w-full text-center p-8 border border-black/20 rounded-lg">
            <h3 className="text-xl font-medium">An Error Occurred</h3>
            <p className="mt-2">{error}</p>
            <button
              onClick={handleReset}
              className="mt-6 px-6 py-2 border border-black text-black rounded-md transition-all duration-200 ease-out hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Try Again
            </button>
          </div>
        );
      case AppStatus.IDLE:
      default:
        if (!userImage || !originalImage) {
          return (
            <ImageUploader 
                onImageChange={handleImageChange}
                gallery={gallery}
                onLoadSession={loadSession}
                onDeleteSession={deleteSession}
            />
          );
        }
        return (
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center space-y-8">
            <ImageEditor 
              src={userImage}
              originalSrc={originalImage}
              editMode={editMode}
              onEditModeChange={setEditMode}
              onEditComplete={handleEditComplete}
              isExtended={isExtended}
            />
             {!editMode && (
                <StylePresets 
                    onSelectPreset={setPrompt}
                    activePrompt={prompt}
                />
            )}
            <EditControls
              prompt={prompt}
              onPromptChange={setPrompt}
              onEnhance={handleEnhance}
              disabled={isProcessing || !!editMode}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col items-center justify-between p-4 sm:p-8">
      <Header />
      <main className="flex-grow w-full flex flex-col items-center justify-center py-10 transition-all duration-300 ease-in-out">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;