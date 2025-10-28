import { ResultAnswer, Survey } from "../entities"

// Получение опросников
export type GetSurveysReq = {
    skip?: number;
    limit?: number; 
};

export type GetSurveysRes = {
    surveys: Survey[];
};

// Отправка ответов на опросник
export type SendSurveyReq = {   
    survey_id: number
    user_id: string
    answers: ResultAnswer[]
    is_reflection?: boolean
}

export type SendSurveyRes = {
    suggested_game: number
    lie_detected?: boolean
}