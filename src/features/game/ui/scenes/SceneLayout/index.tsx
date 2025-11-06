import { FC, useEffect, useState } from 'react'
import styles from './sceneLayout.module.scss'
import { ControlButton } from '../../../../../ui/components/buttons/ControlButton'
import { arrowRightIcon } from '../../../../../ui/icons'
import { GameSceneCard } from '../GameSceneCard'
import { Scene } from '../../../../../types/entities'
import { ChoiceScene } from '../ChoiceScene'
import { addToVisitedScenes, finishGame, setAchievementData, setCurrentSceneAnimated, setCurrentSceneById, setIsOpenAchievement } from '../../../slices/game-info/gameInfoSlice'
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks'
import { GameMatchesScene } from '../GameMatchesScene'
import { useAudio } from '../../../../audio/AudioProvider'
import { CONFIG } from '../../../../../config'
import achievementAudioFile from '../../../../../assets/audio/Achievement.mp3';

type SceneLayoutProps = {
    scene: Scene
}

export const SceneLayout: FC<SceneLayoutProps> = ({ scene }) => {
    const dispatch = useAppDispatch();
    const { audio_muted } = useAppSelector(state => state.settings)
    const { current_scene_animated } = useAppSelector(state => state.game)
    const { play, pause, loadTrack, onAudioEnd, setVolume } = useAudio()

    const achievementAudioId = 'Achievement';

    const [currentVoiceId, setCurrentVoiceId] = useState<string | null>(null)
    const [currentDialogIndex, setCurrentDialogIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)

    const currentSceneIsDialog = scene.type == "dialogue"
    const dialogues = scene.payload.dialogues || []

    // Воспроизведение звука ачивки при показе карточки достижения (один диалог)
    // useEffect(() => {
    //     if (
    //         currentSceneIsDialog &&
    //         dialogues.length === 1 &&
    //         scene.payload.achievement &&
    //         !isPlaying
    //     ) {
    //         loadTrack(achievementAudioId, achievementAudioFile);
    //         if (!audio_muted) {
    //             play(achievementAudioId);
    //         } else {
    //             pause(achievementAudioId);
    //         }
    //     }
    //     return () => {
    //         pause(achievementAudioId);
    //     };
    // }, [currentSceneIsDialog, dialogues.length, scene.payload.achievement, isPlaying, audio_muted]);

    const playNextDialogAudio = () => {
        setIsPlaying(false)
        if (currentDialogIndex < dialogues.length - 1) {
            setCurrentDialogIndex(prev => prev + 1);
        } 
        else {
            if (scene.payload.achievement && dialogues.length === 1) {
                loadTrack(achievementAudioId, achievementAudioFile);
                if (!audio_muted) {
                    play(achievementAudioId);
                } 
                else {
                    pause(achievementAudioId);
                }
            }
        }
    }

    const handleNextScene = () => {
        // Если есть активное аудио - останавливаем
        dispatch(addToVisitedScenes(scene.id))

        if (currentVoiceId) {
            pause(currentVoiceId)
        }

        if (currentSceneIsDialog && (dialogues.length > 1) && scene.payload.achievement) {
            // Воспроизведение звука ачивки
            if (achievementAudioFile) {
                loadTrack(achievementAudioId, achievementAudioFile);
                if (!audio_muted) {
                    play(achievementAudioId);
                } else {
                    pause(achievementAudioId);
                }
            }
            dispatch(setAchievementData(scene.payload.achievement))
            dispatch(setIsOpenAchievement(true))
            return
        }

        if (scene.payload.next_scene_id == null) {
            dispatch(finishGame())
            return
        }

        setCurrentDialogIndex(0)
        dispatch(setCurrentSceneById(scene.payload.next_scene_id!))
    }

    const renderScene = () => {
        if (currentSceneIsDialog && dialogues.length) {
            if (dialogues.length > 1) {
                return (
                    <>
                        {dialogues.slice(0, currentDialogIndex + 1).map((dialog, index) => (
                            <GameSceneCard
                                key={`${scene.id}_${index}`}
                                scene_id={scene.id}
                                dialog={dialog}
                                delayShow={index === currentDialogIndex ? 0.5 : CONFIG.SCENE_DIALOG_CHANGE_DELAY / 1000}
                            />
                        ))}
                    </>
                )
            }
            if (dialogues.length == 1) {
                return (
                    <>
                        <GameSceneCard
                            scene_id={scene.id}
                            dialog={dialogues[0]}
                        />
                        {!isPlaying && (
                            <GameSceneCard
                                scene_id={scene.id}
                                achievement={scene.payload.achievement}
                                delayShow={CONFIG.SCENE_DIALOG_CHANGE_DELAY / 5000}
                            />
                        )}
                    </>
                )
            }
        }
        if (scene.type == "choice" && dialogues.length) {
            return <>
                <GameSceneCard
                    scene_id={scene.id}
                    dialog={dialogues[0]}
                    delayShow={0.5}
                />
                <ChoiceScene {...scene} />
            </>
        }
        if (scene.type == "match") {
            return <GameMatchesScene scene_id={scene.id} payload={scene.payload} />
        }
    }

    // Загрузка аудио при изменении сцены
    useEffect(() => {
        setTimeout(() => {
            dispatch(setCurrentSceneAnimated(true))
        }, CONFIG.SCENE_DIALOG_CHANGE_DELAY)

        setCurrentDialogIndex(0)
        setCurrentVoiceId(null)
        setIsPlaying(false)

        // Загружаем все аудио для диалогов
        if (dialogues.length) {
            dialogues.forEach((dialog, index) => {
                if (dialog.voice) {
                    const audioId = `${scene.id}_${index}`
                    loadTrack(audioId, dialog.voice)
                }
            })
        }

        return () => {
            // Останавливаем все аудио при размонтировании
            dialogues.forEach((_, index) => {
                const audioId = `${scene.id}_${index}`
                pause(audioId)
            })
        }
    }, [scene.id])

    // Воспроизведение текущего диалога
    useEffect(() => {
        if (!dialogues.length || !dialogues.some(item => item.voice !== "")) return

        const dialog = dialogues[currentDialogIndex]

        if (!dialog) {
            return
        }

        const audioId = `${scene.id}_${currentDialogIndex}`
        const firstDialogNoVoice = !dialog?.voice && !currentDialogIndex
        const secondDialogHasVoice = dialogues[1]?.voice

        if (firstDialogNoVoice && secondDialogHasVoice) {

            new Promise(() => {
                setTimeout(playNextDialogAudio, CONFIG.SCENE_DIALOG_CHANGE_DELAY)
            })
            return;
        }

        if (dialog?.voice) {
            setCurrentVoiceId(audioId)
            setVolume(audioId, audio_muted ? 0 : 0.5)

            const cleanup = onAudioEnd(audioId, playNextDialogAudio)
            setIsPlaying(true)

            setTimeout(() => {
                play(audioId)
            }, !currentDialogIndex ? 500 : (!dialogues[0]?.voice ? CONFIG.SCENE_DIALOG_CHANGE_DELAY : 0))

            return cleanup
        }

    }, [currentDialogIndex, scene.id])

    return (
        <div className={styles.sceneLayout}>
            {renderScene()}
            {
                currentSceneIsDialog &&
                <aside className={styles.sceneControls}>
                    <ControlButton
                        classNames={{ button: styles.nextSceneButton }}
                            disabled={!CONFIG.USE_DEBUG && (!current_scene_animated || isPlaying || (!currentDialogIndex && dialogues.length > 1 && Boolean(dialogues[1].voice)))}
                        onClick={handleNextScene}>
                        Далее
                        <img src={arrowRightIcon} height={18} width={18} alt="" />
                    </ControlButton>
                </aside>
            }
        </div>
    )
}