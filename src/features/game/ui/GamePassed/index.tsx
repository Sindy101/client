// no default React import required
import { useAudio } from '../../../audio/AudioProvider';
import { WhiteContainer } from '../../../../ui/components/containers/WhiteContainer';
import styles from './gamePassed.module.scss';
import game_end from '../../../../assets/audio/game_end.mp3'
import { logoIcon, successIcon } from '../../../../ui/icons';
import { Button } from '../../../../ui/components/buttons/Button';
import { useAppSelector } from '../../../../store/hooks';
import { addToStorage } from '../../../../utils/localStorageExplorer';
import { storeToken } from '../../../user/utils/storeToken';
import { initialUserState } from '../../../user/slices/userState';
import { useNavigate } from 'react-router'
import { useEffect } from 'react'
import { api } from '../../../../api/instance';

export const GamePassed = () => {
    const { loadTrack, play, pause } = useAudio();
    const audio_muted = useAppSelector(state => state.settings.audio_muted);
    const {
        title,
        cover_image
    } = useAppSelector(state => state.game.passed_game)
    // Получаем имя и фамилию пользователя
    const first_name = useAppSelector(state => state.user.data.first_name);
    const last_name = useAppSelector(state => state.user.data.last_name);
    const navigate = useNavigate();

    // Функция для скачивания сертификата
    const loadSertificate = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        try {
            const response = await api.post(
                'certificate/pdf',
                {
                    last_name,
                    first_name,
                    game_name: title
                },
                { responseType: 'blob' }
            );
            const url = window.URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'certificate.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Не удалось скачать сертификат');
        }
    }

    useEffect(() => {
        //alert(id)
    }, [])

    useEffect(() => {
        const audioId = 'game_end';
        loadTrack(audioId, game_end);
        if (!audio_muted) {
            play(audioId);
        } else {
            pause(audioId);
        }
        return () => {
            pause(audioId);
        }
    }, [audio_muted]);

    const handleLogout = () => {
        addToStorage('user_data', initialUserState.data);
        storeToken('');
        window.location.reload();
    };

    const HandleSelectGames = () => {
        navigate("/game/selection");
    };

    return (
        <WhiteContainer className={styles.section}>
            <div className={styles.gameInfo}>
                <header className={styles.gameInfoHeader}>
                    <div className={styles.gameInfoPassed}>
                        <img src={successIcon} height={80} width={80} alt="" />
                        <h2 className='gameInfoPassed'>Успешно пройдено! <br /> Поздравляем!</h2>
                    </div>
                    <b className={styles.gameInfoTitle}>{title}</b>
                </header>
                <div className={styles.gameInfoDescription}>
                    <p>Поздравляем, ты успешно прошел игру “{title}”. Теперь ты можешь скачать сертификат ниже, сыграть в другую игру или выйти из сессии.</p>
                </div>
                <div className={styles.gameInfoBottom}>
                    <a onClick={loadSertificate} href='#' className={styles.gameInfoSertificate}>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.14258 12.8857V9.11427C3.14258 5.55853 3.14258 3.78067 4.16538 2.67603C5.18818 1.57141 6.83435 1.57141 10.1267 1.57141H11.8727C15.1651 1.57141 16.8113 1.57141 17.834 2.67603C18.4043 3.2919 18.6566 4.11702 18.7683 5.34284M18.8569 9.11427V12.8857C18.8569 16.4414 18.8569 18.2193 17.834 19.3239C16.8113 20.4286 15.1651 20.4286 11.8727 20.4286H10.1267C6.83435 20.4286 5.18818 20.4286 4.16538 19.3239C3.59514 18.708 3.34282 17.8829 3.23118 16.6571" stroke="#003087" strokeWidth={2} strokeLinecap="round" />
                            <path d="M7.33398 12.8334H11.9173" stroke="#003087" strokeWidth={2} strokeLinecap="round" />
                            <path d="M7.33398 9.16663H8.25065M14.6673 9.16663H11.0007" stroke="#003087" strokeWidth={2} strokeLinecap="round" />
                        </svg>
                        <span style={{ color: 'var(--c-dark-alt)' }}>
                            Скачать сертификат
                        </span>
                    </a>
                    <div className={styles.gameInfoButtons}>
                        <Button onClick={HandleSelectGames}>Другие игры</Button>
                        <button className={styles.logoutButton} onClick={handleLogout} >Выйти из аккаунта</button>
                    </div>
                </div>
            </div>
            <div style={{ backgroundImage: `url(${cover_image})` }} className={styles.gameCoverBlock}>
                <div
                    // style={{ backgroundColor: `url(${})` }}
                    className={styles.gameCoverBlockLogo}>
                    <img src={logoIcon} width={67} height={21} alt="" />
                </div>
            </div>
        </WhiteContainer>
    )
}
