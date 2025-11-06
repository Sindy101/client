import styles from './SurveyInfoScreen.module.scss'
import instruction from '../../../../../public/survey/instruction.mp3'
import { useAudio } from '../../../audio/AudioProvider'
import { useState, useEffect } from 'react'
import { useAppSelector } from '../../../../store/hooks'
import { WhiteContainer } from '../../../../ui/components/containers/WhiteContainer'
import { Button } from '../../../../ui/components/buttons/Button'
import { clockIcon, logoIcon } from '../../../../ui/icons'
import { SurveyScreen } from '../../ui/SurveyScreen'
import { AudioProvider } from '../../../audio/AudioProvider'

export const SurveyInfoScreen = () => {
    const [showSurveyScreen, setShowSurveyScreen] = useState(false);
    const { loadTrack, play, pause } = useAudio();
    const audioId = 'instruction';
    const audio_muted = useAppSelector(state => state.settings.audio_muted);
    const surveyLoaded = useAppSelector(state => state.survey.questions.statuses.success);
    const isEndSurvey = useAppSelector(state => state.settings.isEndSurvey);

    useEffect(() => {
        if (isEndSurvey) {
            setShowSurveyScreen(true);
        }
    }, []);

    useEffect(() => {
        if (!showSurveyScreen) {
            loadTrack(audioId, instruction);
            if (!audio_muted) {
                play(audioId);
            } else {
                pause(audioId);
            }
        } else {
            pause(audioId);
        }
        return () => {
            pause(audioId);
        }
    }, [showSurveyScreen, audio_muted]);

    if (showSurveyScreen) {
        return (
            <AudioProvider>
                <SurveyScreen />
            </AudioProvider>
        );
    }

    return (
        <WhiteContainer className={styles.section}>
            <div className={styles.surveyInfo}>
                <header className={styles.surveyInfoHeader}>
                    <span className={styles.surveyInfoCaption}>Опрос</span>
                </header>
                <div className={styles.surveyInfoText}>
                    <h1 className={styles.surveyInfoTitle}>Инструкция</h1>
                    <div className={styles.surveyInfoDescription}>
                        <p>Я задам тебе вопросы. Отвечай «да» или «нет». Здесь нет правильных или неправильных ответов — важно только твоё мнение.</p>
                    </div>
                </div>
                <footer className={styles.surveyInfoFooter}>
                    <div className={styles.surveyInfoDuration}>
                        <img src={clockIcon} height={16} width={16} alt="" />
                        <span>Примерная длительность 5 мин.</span>
                    </div>
                    <div className={styles.surveyInfoBottom}>
                        <Button disabled={!surveyLoaded} onClick={() => setShowSurveyScreen(true)} classNames={{ button: styles.surveyInfoButton }}>Начать</Button>
                        <img src={logoIcon} height={26} width={80} alt="Логотип" />
                    </div>
                </footer>
            </div>
        </WhiteContainer>
    )
}
