import { FC } from 'react';
import styles from './SelectionElement.module.scss';
import { Button } from '../../../../../ui/components/buttons/Button';
import { clockIcon } from '../../../../../ui/icons';
import { Game } from "../../../../../types/entities";
import { api } from '../../../../../api/instance';

type SelectionElementProps = {
    game: Game;
    onPlay?: () => void;
};

export const SelectionElement: FC<SelectionElementProps> = ({ game, onPlay }) => {

    // const loadCertificate = async (e: React.MouseEvent) => {
    //     e.preventDefault();
    //     try {
    //         const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    //         const { first_name, last_name } = userData;

    //         if (!first_name || !last_name) {
    //             alert('Не удалось определить пользователя');
    //             return;
    //         }

    //         const response = await api.post(
    //             'certificate/pdf',
    //             {
    //                 last_name,
    //                 first_name,
    //                 game_name: game.title
    //             },
    //             { responseType: 'blob' }
    //         );

    //         const url = window.URL.createObjectURL(response.data);
    //         const a = document.createElement('a');
    //         a.href = url;
    //         a.download = `certificate_${game.title}.pdf`;
    //         document.body.appendChild(a);
    //         a.click();
    //         a.remove();
    //         window.URL.revokeObjectURL(url);
    //     } catch (err) {
    //         console.error(err);
    //         alert('Не удалось скачать сертификат');
    //     }
    // };

    return (
        <div className={styles.card}>
            <div
                className={styles.cover}
                style={{ backgroundImage: `url(${game.cover_image})` }}
            />
            <div className={styles.info}>
                <h3 className={styles.title}>{game.title}</h3>
                <div className={styles.SelectionDuration}>
                    <img src={clockIcon} height={16} width={16} alt="" />
                    <span>Примерная длительность {game.duration} мин.</span>
                </div>
                <div className={styles.SelectionBottom}>
                    <Button onClick={onPlay}>Играть</Button>
                    {/* <a onClick={loadCertificate} href="#" className={styles.gameInfoSertificate}>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.14258 12.8857V9.11427C3.14258 5.55853 3.14258 3.78067 4.16538 2.67603C5.18818 1.57141 6.83435 1.57141 10.1267 1.57141H11.8727C15.1651 1.57141 16.8113 1.57141 17.834 2.67603C18.4043 3.2919 18.6566 4.11702 18.7683 5.34284M18.8569 9.11427V12.8857C18.8569 16.4414 18.8569 18.2193 17.834 19.3239C16.8113 20.4286 15.1651 20.4286 11.8727 20.4286H10.1267C6.83435 20.4286 5.18818 20.4286 4.16538 19.3239C3.59514 18.708 3.34282 17.8829 3.23118 16.6571" stroke="#003087" strokeWidth={2} strokeLinecap="round" />
                            <path d="M7.33398 12.8334H11.9173" stroke="#003087" strokeWidth={2} strokeLinecap="round" />
                            <path d="M7.33398 9.16663H8.25065M14.6673 9.16663H11.0007" stroke="#003087" strokeWidth={2} strokeLinecap="round" />
                        </svg>
                        <span style={{ color: 'var(--c-dark-alt)' }}>
                            Сертификат
                        </span>
                    </a> */}
                </div>
            </div>
        </div>
    );
};
