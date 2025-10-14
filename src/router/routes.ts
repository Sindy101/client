import { RegisterScreen } from "../features/user/ui/screens/RegisterScreen";
import { ROUTER } from "./consts";
import { AppRoute, AppRouteType } from "./types";
import { GameContainer } from "../features/game/ui/containers/GameContainer";
import { GamePassedContainer } from "../features/game/ui/containers/GamePassedContainer";
import { GameInfoContainer } from "../features/game/ui/containers/GameInfoContainer";
import { SurveyContainer } from "../features/survey/containers/SurveyContainer";
import { EndSurveyContainer } from "../features/survey/containers/EndSurveyContainer";
import { GameAudioContainer } from "../features/game/ui/containers/GameAudioContainer";
import { GameSelectionScreen } from "../features/game/ui/GameSelection";

export const routes: Record<AppRouteType, AppRoute[]> = {
    AUTH: [
        {
            path: ROUTER.PATHS.HOME,
            Component: SurveyContainer,
        },
        {
            path: ROUTER.PATHS.GAME_INFO,
            Component: GameInfoContainer,
        },
        {
            path: ROUTER.PATHS.GAME_PROGRESS,
            Component: GameAudioContainer,
        },
        {
            path: ROUTER.PATHS.END_SURVEY,
            Component: EndSurveyContainer,
        },
        {
            path: ROUTER.PATHS.GAME_PASSED,
            Component: GamePassedContainer,
        },
        {
            path: ROUTER.PATHS.GAME_SELECTION,
            Component: GameSelectionScreen
        }

        // {
        //     path: ROUTER.PATHS.HOME,
        //     Component: SurveyContainer,
        // },

    ],
    NON_AUTH: [
        {
            path: ROUTER.PATHS.SIGNUP,
            Component: RegisterScreen
        }
    ],
    PUBLIC: []
}
