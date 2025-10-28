import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    ReactNode,
} from 'react';
import { useAppSelector } from '../../../store/hooks';
import { CONFIG } from '../../../config'; // Убедитесь, что импорт работает

export type AudioInstance = {
    id: string;
    audio: HTMLAudioElement;
    isPlaying: boolean;
    volume: number;
    duration: number;
    ended: boolean;
    error: string | null;
};

// Тип контекста теперь снова простой, без параметра delay в play
type AudioContextType = {
    play: (id: string) => void;
    pause: (id: string) => void;
    setVolume: (id: string, volume: number) => void;
    loadTrack: (id: string, audioPath: string, loop?: boolean) => AudioInstance;
    getAudioState: (id: string) => {
        isPlaying: boolean;
        error: string | null;
        volume: number;
        currentTrack: string | null;
        duration: number,
    };
    getAllAudioInstances: () => Record<string, AudioInstance>;
    deleteInstances: () => void
    onAudioEnd: (id: string, callback: () => void) => void;
};

export const AudioContext = createContext<AudioContextType>({
    play: function (id: string): void {
        throw new Error('Function not implemented.');
    },
    pause: function (id: string): void {
        throw new Error('Function not implemented.');
    },
    setVolume: function (id: string, volume: number): void {
        throw new Error('Function not implemented.');
    },
    loadTrack: function (id: string, audioPath: string, loop?: boolean): AudioInstance {
        throw new Error('Function not implemented.');
    },
    getAudioState: function (id: string): {
        isPlaying: boolean;
        error: string | null;
        volume: number;
        currentTrack: string | null;
        duration: number,
    } {
        throw new Error('Function not implemented.');
    },
    getAllAudioInstances: function (): Record<string, AudioInstance> {
        throw new Error('Function not implemented.');
    },
    deleteInstances: function () {

    },
    onAudioEnd: function (id: string, callback: () => void) {

    }
});

type AudioProviderProps = {
    children: ReactNode;
    initialTracks?: Record<string, { path: string; volume?: number }>;
};

export const AudioProvider: React.FC<AudioProviderProps> = ({
    children,
    initialTracks = {},
}) => {
    const audioInstances = useRef<Record<string, AudioInstance>>({});
    const { audio_muted, music_muted } = useAppSelector(state => state.settings)

    const [_, forceUpdate] = useState({});

    const handleError = (id: string, error: Event) => {
        const target = error.target as HTMLAudioElement;
        audioInstances.current[id].error = `Audio error: ${target.error?.message || 'Unknown error'}`;
        audioInstances.current[id].isPlaying = false;
        forceUpdate({});
    };

    const loadTrack = (id: string, audioPath: string, loop?: boolean): AudioInstance => {
        if (audioInstances.current[id]) {
            audioInstances.current[id].audio.pause();
            audioInstances.current[id].audio.removeEventListener('error', (e) => handleError(id, e));
        }

        const audio = new Audio(audioPath);
        audio.loop = loop!

        const initialVolume = id === 'bg'
            ? (music_muted ? 0 : CONFIG.AUDIO_BACKGROUND_VOLUME)
            : (audio_muted ? 0 : CONFIG.AUDIO_DIALOG_VOLUME);

        audio.volume = audioInstances.current[id]?.volume || initialVolume;
        audio.addEventListener('error', (e) => handleError(id, e));

        const newAudioInstance = {
            id,
            audio,
            ended: audio.ended,
            duration: audio.duration,
            isPlaying: false,
            volume: audio.volume,
            error: null,
        }

        audioInstances.current = {
            ...audioInstances.current,
            [id]: newAudioInstance
        };

        forceUpdate({});
        return newAudioInstance
    };

    // --- ИЗМЕНЕНИЕ: Функция play теперь использует константу из CONFIG ---
    const play = (id: string) => {
        const instance = audioInstances.current[id];
        if (!instance) {
            console.error(`Audio instance with id ${id} not found`);
            return;
        }

        const playLogic = () => {
            instance.audio.play()
                .then(() => {
                    instance.isPlaying = true;
                    instance.error = null;
                    forceUpdate({});
                })
                .catch((err) => {
                    instance.error = `Playback failed: ${err instanceof Error ? err.message : String(err)}`;
                    instance.isPlaying = false;
                    forceUpdate({});
                });
        }

        // Применяем задержку только для диалогов, а не для фоновой музыки (id: 'bg')
        if (id !== 'bg' && CONFIG.SUBTITLES_AUDIO_DELAY > 0) {
            setTimeout(playLogic, CONFIG.SUBTITLES_AUDIO_DELAY);
        } else {
            playLogic(); // Воспроизводим сразу
        }
    };

    const pause = (id: string) => {
        const instance = audioInstances.current[id];
        if (instance) {
            instance.audio.pause();
            instance.isPlaying = false;
            instance.error = null;
            forceUpdate({});
        }
    };

    const deleteInstances = () => {
        Object.values(audioInstances.current).forEach((instance) => {
            instance.audio.pause();
            instance.audio.removeEventListener('error', (e) => handleError(instance.id, e));
        });
        audioInstances.current = {}
    }

    const setVolume = (id: string, newVolume: number) => {
        const instance = audioInstances.current[id];
        if (instance) {
            const clampedVolume = Math.max(0, Math.min(1, newVolume));
            instance.volume = clampedVolume;
            instance.audio.volume = clampedVolume;
            forceUpdate({});
        }
    };

    const onAudioEnd = (id: string, callback: () => void) => {
        const instance = audioInstances.current[id];
        if (instance) {
            instance.audio.addEventListener('ended', callback);
            return () => instance.audio.removeEventListener('ended', callback);
        }
    };


    const getAudioState = (id: string) => {
        const instance = audioInstances.current[id];
        if (!instance) {
            return {
                isPlaying: false,
                error: `Audio instance ${id} not found`,
                volume: CONFIG.AUDIO_DIALOG_VOLUME,
                ended: false,
                duration: 0,
                currentTrack: null,
            };
        }
        return {
            isPlaying: instance.isPlaying,
            error: instance.error,
            volume: instance.volume,
            currentTrack: instance.audio.src,
            duration: instance.duration,
            ended: instance.ended
        };
    };

    const getAllAudioInstances = () => {
        return { ...audioInstances.current };
    };

    useEffect(() => {
        if (audioInstances.current) {
            Object.entries(audioInstances.current).forEach(([id]) => {
                if (id !== "bg") {
                    setVolume(id, audio_muted ? 0 : CONFIG.AUDIO_DIALOG_VOLUME);
                }
            });
        }
    }, [audio_muted]);

    useEffect(() => {
        if (audioInstances.current['bg']) {
            const musicVolume = CONFIG.AUDIO_BACKGROUND_VOLUME || 0.3;
            setVolume('bg', music_muted ? 0 : musicVolume);
        }
    }, [music_muted]);

    useEffect(() => {
        Object.entries(initialTracks).forEach(([id, { path, volume }]) => {
            loadTrack(id, path);
            if (volume) setVolume(id, volume);
        });
        return deleteInstances
    }, []);

    return (
        <AudioContext.Provider
            value={{
                play,
                deleteInstances,
                pause,
                setVolume,
                loadTrack,
                getAudioState,
                onAudioEnd,
                getAllAudioInstances,
            }}
        >
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = (): AudioContextType => {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};