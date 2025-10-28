import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SettingsSliceState = {
    full_screen_mode: boolean;
    audio_muted: boolean;
    visual_impaired_mode: boolean;
    music_muted: boolean;
    font_size: 'small' | 'medium' | 'large';
    theme_mode: 'Цветовая схема №1' | 'Цветовая схема №2' | 'Цветовая схема №3' | 'Цветовая схема №4' | 'Цветовая схема №5';
    visual_impaired_panel_open: boolean;
    isEndSurvey: boolean;
    // Whether the post-game reflection survey has already been shown once
    postGameReflectionDone: boolean;
}

const initialState: SettingsSliceState = {
    full_screen_mode: false,
    audio_muted: true,
    visual_impaired_mode: false,
    music_muted: false,
    font_size: 'small',
    theme_mode: 'Цветовая схема №1',
    visual_impaired_panel_open: false,
    isEndSurvey: false,
    postGameReflectionDone: false,
};

const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        toggleFullScreenMode: (state) => {
            state.full_screen_mode = !state.full_screen_mode;
        },
        toggleAudioMuted: (state) => {
            state.audio_muted = !state.audio_muted;
        },
        toggleMusicMuted: (state) => {
            state.music_muted = !state.music_muted;
        },
        toggleVisualImpairedMode: (state) => {
            state.visual_impaired_mode = !state.visual_impaired_mode;
        },
         toggleVisualImpairedPanel: (state) => {
            state.visual_impaired_panel_open = !state.visual_impaired_panel_open;
        },
        
        closeVisualImpairedPanel: (state) => {
            state.visual_impaired_panel_open = false;
        },
        openVisualImpairedPanel: (state) => {
            state.visual_impaired_panel_open = true;
        },
        setFullScreenMode: (state, action: PayloadAction<boolean>) => {
            state.full_screen_mode = action.payload;
        },
        setAudioMuted: (state, action: PayloadAction<boolean>) => {
            state.audio_muted = action.payload;
        },
        setVisualImpairedMode: (state, action: PayloadAction<boolean>) => {
            state.visual_impaired_mode = action.payload;
        },
        setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
            state.font_size = action.payload;
        },
        setThemeMode: (state, action: PayloadAction<'Цветовая схема №1' | 'Цветовая схема №2' | 'Цветовая схема №3' | 'Цветовая схема №4' | 'Цветовая схема №5'>) => {
            state.theme_mode = action.payload;
        },
        setSurvey: (state) => {
            state.isEndSurvey = true
        },
        setPostGameReflectionDone: (state, action: PayloadAction<boolean>) => {
            state.postGameReflectionDone = action.payload;
        },
        resetSettings: () => initialState
    }
});

export const {
    toggleFullScreenMode,
    toggleAudioMuted,
    toggleMusicMuted,
    toggleVisualImpairedMode,
    closeVisualImpairedPanel,
    openVisualImpairedPanel,
    setFullScreenMode,
    setAudioMuted,
    setVisualImpairedMode,
    setFontSize,
    setThemeMode,
    setSurvey,
    setPostGameReflectionDone,
    resetSettings
} = settingsSlice.actions;

export const settingsReducer = settingsSlice.reducer;