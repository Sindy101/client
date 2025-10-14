import { useEffect, useRef } from 'react'
import { AppRouter } from './router'
import { useAppDispatch, useAppSelector } from './store/hooks';
import { CONFIG } from './config';
import Popup from './ui/components/service/Popup';
import { openPopup } from './features/settings/slices/popupSlice';
import { setThemeMode, setFontSize } from './features/settings/slices/settingsSlice';
import { VisuallyImpairedControl } from './ui/components/service/VisuallyImpairedControl';
import { HearingImpairedControl } from './ui/components/service/HearingImpairedControl';
import { ExitButton } from './ui/components/service/ExitButton';

function App() {
  const dispatch = useAppDispatch()

  const { full_screen_mode, visual_impaired_mode, font_size, theme_mode } = useAppSelector(state => state.settings)

  const documentElement = useRef(document.documentElement)
  const { register } = useAppSelector(state => state.user)


  useEffect(() => {
    if (register.success) {
      dispatch(openPopup({ text: "Вы успешно авторизовались" }))
    }
  }, [register.success])

  useEffect(() => {
    if (documentElement.current) {
      if (!full_screen_mode) {
        document.exitFullscreen()
        return
      }
      documentElement.current?.requestFullscreen()
    }
  }, [full_screen_mode])

  // useEffect(() => {
  //   if (documentElement.current) {
  //     if (!visual_impaired_mode) {
  //       documentElement.current.style.setProperty('--fz-scale', `${1}`)
  //       return
  //     }
  //     documentElement.current.style.setProperty('--fz-scale', `${CONFIG.VISUAL_IMPAIRED_VALUE}`)
  //   }
  // }, [visual_impaired_mode])

  useEffect(() => {
    if (documentElement.current) {
      let scale = 1;
      if (font_size === 'small') scale = 1;
      if (font_size === 'medium') scale = 1.25;
      if (font_size === 'large') scale = 1.5;
      documentElement.current.style.setProperty('--fz-scale', `${scale}`);
    }
  }, [font_size]);

  useEffect(() => {
    if (!documentElement.current) return;
    documentElement.current.classList.remove(
      'theme-1', 'theme-2', 'theme-3', 'theme-4', 'theme-5'
    );
    switch (theme_mode) {
      case 'Цветовая схема №1':
        documentElement.current.classList.add('theme-1');
        break;
      case 'Цветовая схема №2':
        documentElement.current.classList.add('theme-2');
        break;
      case 'Цветовая схема №3':
        documentElement.current.classList.add('theme-3');
        break;
      case 'Цветовая схема №4':
        documentElement.current.classList.add('theme-4');
        break;
      case 'Цветовая схема №5':
        documentElement.current.classList.add('theme-5');
        break;
      default:
        documentElement.current.classList.add('theme-1');
    }
  }, [theme_mode]);

  useEffect(() => {
    if (!visual_impaired_mode) {
      if (theme_mode !== 'Цветовая схема №1') {
        dispatch(setThemeMode('Цветовая схема №1'));
      }
      if (font_size !== 'small') {
        dispatch(setFontSize('small'));
      }
    }
  }, [visual_impaired_mode, theme_mode, font_size, dispatch]);


  return (
    <main>
      <Popup />
      <ExitButton />
      <VisuallyImpairedControl />
      <HearingImpairedControl />
      <AppRouter />
    </main>
  )
}

export default App
