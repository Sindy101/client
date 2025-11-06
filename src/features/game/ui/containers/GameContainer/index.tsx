import { useAppSelector, useAppDispatch } from '../../../../../store/hooks'
import { ConditionalContainer } from '../../../../../ui/components/containers/ConditionalContainer'
import { GameLayout } from '../../GameLayout'
import { Navigate } from 'react-router'
import { ROUTER } from '../../../../../router/consts'
import { AudioProvider } from '../../../../audio/AudioProvider'
import { LoaderWidget } from '../../../../../ui/components/service/LoaderWidget'
import { openPopup } from '../../../../../features/settings/slices/popupSlice'
import { setPostGameReflectionDone } from '../../../../../features/settings/slices/settingsSlice'

export const GameContainer = () => {
    const { survey_passed } = useAppSelector(state => state.survey)
    const { passed_game, data, game_is_in_progress } = useAppSelector(state => state.game)
    const { postGameReflectionDone } = useAppSelector(state => state.settings)

    const isPassedGame = passed_game.id !== 0
    const gameIsLoaded = data.id !== 0
    const dispatch = useAppDispatch()

    const handleNoGameAccess = () => {
        if (!survey_passed) {
            return <Navigate to={ROUTER.PATHS.HOME} />
        }

        if (isPassedGame) {
            if (!postGameReflectionDone) {
                dispatch(openPopup({ text: "Вы успешно прошли игру!" }))
                return <Navigate to={ROUTER.PATHS.END_SURVEY} />
            } 
            else {
                return <Navigate to={ROUTER.PATHS.GAME_PASSED} />
            }
        }

        if (!gameIsLoaded) {
            return (
                <LoaderWidget
                    widthLoader={50}
                    heightLoader={50}
                    text={"Загружаем игровые детали..."}
                />
            )
        }

        return null
    }

    return (
        <ConditionalContainer
            condition={!isPassedGame && gameIsLoaded && survey_passed && game_is_in_progress}
            trueElement={
                <AudioProvider>
                    <GameLayout />
                </AudioProvider>
            }
            falseElement={handleNoGameAccess()}
        />
    )
}