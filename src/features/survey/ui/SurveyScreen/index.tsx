import { useEffect, useState } from 'react'
import { useAudio } from '../../../audio/AudioProvider'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { Answer } from '../../../../types/entities'
import { Button } from '../../../../ui/components/buttons/Button'
import { WhiteContainer } from '../../../../ui/components/containers/WhiteContainer'
import { logoIcon, smileIcon, worriedfaceIcon } from '../../../../ui/icons'
import { answerTheQuestion, sendSurvey, resetSendingSurveyStatus, resetSurvey, setSurveyPassed } from '../../slices/surveySlice'
import { setPostGameReflectionDone } from '../../../settings/slices/settingsSlice'
import { getAnsweredProgress } from '../../utils/helpers/getAnsweredProgress'
import styles from './surveyScreen.module.scss'
import end from '../../../../../public/survey/end.mp3'
import bad_end from '../../../../../public/survey/bad_end.mp3'
import { motion } from "motion/react"
import { useNavigate } from 'react-router'
import { ROUTER } from '../../../../router/consts'
import { getGameInfoById } from '../../../game/slices/game-info/gameInfoSlice'
import { CONFIG } from '../../../../config'

// Sectioning now driven by group_id matching passed game's game_group_id

export const SurveyScreen = () => {
    // Hooks and state
    const dispatch = useAppDispatch();
    const isEndSurvey = useAppSelector(state => state.settings.isEndSurvey);
    const navigate = useNavigate();
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const { loadTrack, play, pause } = useAudio();
    const audio_muted = useAppSelector(state => state.settings.audio_muted);
    const {
        answers_data,
        survey_passed,
        title,
        questions,
        current_question_id,
        suggested_game,
        id,
        sending_statuses,
        lie_detected
    } = useAppSelector(state => state.survey);
    const user_id = useAppSelector(state => state.user.data.uuid);

    // Section/game logic
    const passedGameId = useAppSelector(state => state.game.passed_game.id);
    let filteredQuestions = questions.items;
    let isSectionMode = false;
    let sectionQuestions: typeof questions.items = [];
    const [sectionIndex, setSectionIndex] = useState(0);

    const passedGameGroupId = useAppSelector(state => state.game.passed_game.game_group_id);
    const postGameReflectionDone = useAppSelector(state => state.settings.postGameReflectionDone);
    if (passedGameId && passedGameGroupId && !postGameReflectionDone) {
        sectionQuestions = questions.items.filter(q => q.group_id === passedGameGroupId);
        if (sectionQuestions && sectionQuestions.length > 0) {
            filteredQuestions = sectionQuestions;
            isSectionMode = true;
        }
    }

    // Индекс текущего вопроса
    let currentIndex = 0;
    let currentQuestion = filteredQuestions[0];
    if (isSectionMode) {
        currentIndex = sectionIndex;
        currentQuestion = filteredQuestions[sectionIndex];
    } else {
        currentIndex = filteredQuestions.findIndex(q => q.id === current_question_id);
        if (currentIndex === -1) currentIndex = 0;
        currentQuestion = filteredQuestions[currentIndex];
    }

    // Effects
    useEffect(() => {
        dispatch(resetSurvey());
    }, [dispatch]);

    useEffect(() => {
        if (survey_passed) return;
        if (!currentQuestion || !currentQuestion.voice) return;
        const audioId = `q_${currentQuestion.id}`;
        loadTrack(audioId, currentQuestion.voice);
        if (!audio_muted) {
            play(audioId);
        } else {
            pause(audioId);
        }
        return () => {
            pause(audioId);
        }
    }, [currentQuestion?.voice, audio_muted, currentQuestion?.id]);
    const getLastSectionScore = () => {
        const lastIds = questions.items.filter(q => q.group_id === 6).map(q => q.id);
        return answers_data.filter(a => lastIds.includes(a.question_id) && a.answer_option_id % 2 === 1).length;
    };

    const isBadResult = survey_passed && getLastSectionScore() >= 3;
    useEffect(() => {
        const endAudioId = 'survey_end';
        if (survey_passed && isBadResult) {
            loadTrack(endAudioId, bad_end);
            if (!audio_muted) {
                play(endAudioId);
            }
            else {
                pause(endAudioId);
            }
        }
        if (survey_passed && !isBadResult) {
            loadTrack(endAudioId, end);
            if (!audio_muted) {
                play(endAudioId);
            } else {
                pause(endAudioId);
            }
        } else {
            pause(endAudioId);
        }
        return () => {
            pause(endAudioId);
        }
    }, [survey_passed, audio_muted]);
    useEffect(() => {
        setButtonsDisabled(true);
        const timer = setTimeout(() => {
            setButtonsDisabled(false);
        }, CONFIG.USE_DEBUG ? 100 : 5000);
        return () => {
            clearTimeout(timer);
        }
    }, [current_question_id]);

    useEffect(() => {
        if (sending_statuses.success) {
            // If backend detected lie/invalid answers, restart survey
            if (lie_detected) {
                dispatch(resetSurvey());
                return;
            }
            // If this was a section submission (post-game), mark reflection done
            // so it won't be shown again, and go to the final congratulation screen.
            if (isSectionMode) {
                // Mark post-game reflection done globally
                dispatch(setPostGameReflectionDone(true));
                navigate(ROUTER.PATHS.GAME_PASSED);
                return;
            }

            if (isEndSurvey) {
                navigate(ROUTER.PATHS.GAME_PASSED);
            } else {
                navigate(ROUTER.PATHS.GAME_INFO);
                dispatch(getGameInfoById({ id: suggested_game, include_details: true }));
            }
        }
    }, [sending_statuses.success, isEndSurvey, navigate, dispatch, suggested_game, isSectionMode]);

    useEffect(() => {
        return () => {
            dispatch(resetSendingSurveyStatus());
        };
    }, [dispatch]);

    // Section scoring logic


    const isLastQuestionInSection = isSectionMode && sectionIndex === filteredQuestions.length - 1;
    const onAnswer = (answer: Answer) => {
        setButtonsDisabled(true);
        if (isSectionMode) {
            // Локально сохраняем ответы для секции
            dispatch(answerTheQuestion({ ...answer, id: answer.id }));
            if (isLastQuestionInSection) {
                dispatch(setSurveyPassed(true));
            } else {
                setTimeout(() => {
                    setSectionIndex(idx => idx + 1);
                }, 100);
            }
            return;
        }
        // Глобальный режим
        dispatch(answerTheQuestion(answer));
    };

    const onSubmit = () => {
        // Проверка на плохой результат теперь обрабатывается в UI,
        // поэтому кнопка отправки не будет показана, если результат плохой.
        const payload: any = {
            survey_id: id,
            user_id: user_id,
            answers: answers_data,
            is_reflection: isSectionMode
        };
        dispatch(sendSurvey(payload));
    };

    // <<< НАЧАЛО ИЗМЕНЕНИЙ ИЗ ВТОРОГО ФАЙЛА >>>
    const handleResetSurvey = () => {
        dispatch(resetSurvey());
    };

    // <<< КОНЕЦ ИЗМЕНЕНИЙ ИЗ ВТОРОГО ФАЙЛА >>>

    return (
        <WhiteContainer className={styles.section}>
            <header className={styles.header}>
                <h1 className={`${styles.title}`}>{title}</h1>
                <img src={logoIcon} height={20} width={63} alt="Логотип" />
            </header>
            <div className={styles.survey}>
                {survey_passed ? (
                    // <<< НАЧАЛО ИЗМЕНЕНИЙ ИЗ ВТОРОГО ФАЙЛА >>>
                    isBadResult ? (
                        <div className={styles.surveyPassed}>
                            <motion.img
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                height={160} width={160} src={worriedfaceIcon} alt="" />

                            <h2 className={styles.surveyTitle}>Ты был недостаточно искренен </h2>
                            <span className={styles.suggestion}><br /> Пройди пожалуйста опрос ещё раз</span>
                            <div className={styles.buttons}>
                                <Button onClick={handleResetSurvey} classNames={{ button: `${styles.surveyButton}` }} >
                                    Пройти ещё раз
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.surveyPassed}>
                            <motion.img
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                height={160} width={160} src={smileIcon} alt="" />
                            <h2 className={styles.surveyTitle}>Спасибо тебе <br /> за пройденный опрос!</h2>
                            <div className={styles.buttons}>
                                <Button isLoading={sending_statuses.loading} onClick={onSubmit} classNames={{ button: `${styles.surveyButton}` }} >
                                    Отправить ответы
                                </Button>
                            </div>
                        </div>
                    )
                    // <<< КОНЕЦ ИЗМЕНЕНИЙ ИЗ ВТОРОГО ФАЙЛА >>>
                ) : (
                    <>
                        <header className={styles.surveyHeader}>
                            <h2 className={styles.surveyTitle}>
                                <div className={styles.surveyTitleInner}>
                                    <span className={styles.surveyQuestionLabel}>Вопрос</span>&nbsp;
                                    <span className={styles.surveyQuestionCount}>{isSectionMode ? sectionIndex + 1 : currentIndex + 1}/{filteredQuestions.length}</span>
                                </div>
                            </h2>
                            <div className={`surveyProgressWrapper ${styles.progressBar}`}>
                                <div
                                    style={{ width: `${(isSectionMode ? (sectionIndex + 1) : getAnsweredProgress(survey_passed, answers_data, filteredQuestions.length)) / filteredQuestions.length * 100}%` }}
                                    className={`surveyProgress ${styles.line}`} />
                            </div>
                        </header>
                        <div className={styles.surveyDescription}>
                            <motion.p
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                key={currentQuestion?.id}>
                                {currentQuestion?.text}
                            </motion.p>
                        </div>
                        <div className={styles.surveyControls}>
                            <span className={styles.suggestion}>Выберите вариант ответа</span>
                            <div className={styles.buttons}>
                                <Button
                                    disabled={buttonsDisabled}
                                    onClick={() => onAnswer(currentQuestion?.options[1] as Answer)}
                                    classNames={{ button: `${styles.buttonNo} ${styles.surveyButton} ${buttonsDisabled ? '' : styles.buttonNoActive}` }}>
                                    {currentQuestion?.options[1]?.text || "Кнопка"}
                                </Button>
                                <Button
                                    disabled={buttonsDisabled}
                                    onClick={() => onAnswer(currentQuestion?.options[0] as Answer)}
                                    classNames={{ button: `${styles.surveyButton}` }}>
                                    {currentQuestion?.options[0]?.text}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </WhiteContainer>
    );
}