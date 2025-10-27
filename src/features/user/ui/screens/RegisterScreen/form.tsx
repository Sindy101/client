import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import styles from './registerScreen.module.scss'
import { Button } from '../../../../../ui/components/buttons/Button'
import { FieldsGroup } from '../../../../../ui/components/forms/FieldsGroup'
import { InputField } from '../../../../../ui/components/forms/InputField'
import { SelectField } from '../../../../../ui/components/forms/SelectField'
import { getSchools, resetSchoolPagination } from '../../../../schools/slices/schoolsSlice'
import { GetSchoolsReq } from '../../../../../types/api/schools.api.types'
import { tickIcon } from '../../../../../ui/icons'
import { getSelectOptions } from '../../../../../utils/getSelectOptions'
import { STATIC_DATA } from '../../../config'
import { UserRegisterReq } from '../../../../../types/api/user.api.types'
import { useFormik } from 'formik'
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks'
import { getCities, resetPagination } from '../../../../cities/slices/citiesSlice'
import { generateKey } from '../../../utils/generateKey'
import { userRegister } from '../../../slices/userSlice'

type UserRegisterForm = Omit<UserRegisterReq, "password">;
type UserRegisterFormKeys = keyof UserRegisterForm;
// type UserRegisterFormSelects = keyof Pick<UserRegisterForm, "age" | "city_id" | "school_id" | "gender">;
type UserRegisterFormSelects = "age" | "city_id" | "gender" | "school";

export const RegisterForm = () => {
    const dispatch = useAppDispatch()
    const { schools, cities, user } = useAppSelector(state => state)

    const [agreeCheckbox, setAgreeCheckbox] = useState(true);
    const [searchCitiesValue, setSearchCitiesValue] = useState("");
    const [searchSchoolsValue, setSearchSchoolsValue] = useState("");
    const defferedSearchCitiesValue = useDeferredValue(searchCitiesValue)
    const defferedSearchSchoolsValue = useDeferredValue(searchSchoolsValue)

    const formik = useFormik<UserRegisterForm>({
        initialValues: {
            first_name: '',
            last_name: '',
            middle_name: 'Отсутствует',
            school: '',
            // school_id: 0,
            age: 0,
            gender: 0,
            city_id: 0
        },
        onSubmit: values => {
            const data: UserRegisterReq = {
                ...values,
                middle_name: 'Отсутствует',
                password: generateKey(60)
            };
            console.log(data);
            dispatch(userRegister(data));
        },
    });

    const fetchCities = () => {
        let currentSkip = 0

        if (cities.pagination.part > 1) {
            currentSkip = (cities.pagination.part - 1) * cities.pagination.limit
        }

        dispatch(getCities({
            skip: currentSkip,
            limit: cities.pagination.limit,
            query: searchCitiesValue
        }))
    }

    const onCitySelect = (city: number, name: string) => {
        if (name !== searchCitiesValue) {
            setSearchCitiesValue(name)
        }
        registerFormSelect("city_id", city)
        // reset schools pagination and items so we reload schools for selected city
        dispatch(resetSchoolPagination())
    }

    const fetchSchools = () => {
        let currentSkip = 0

        //if (schools.pagination.part > 1) {
        //    currentSkip = (schools.pagination.part - 1) * schools.pagination.limit
        //}

        const req: GetSchoolsReq = {
            skip: currentSkip,
            limit: schools.pagination.limit,
            query: searchSchoolsValue,
            city_id: formik.values.city_id || undefined
        }

        dispatch(getSchools(req))
    }

    const onSchoolSelect = (_school: number, name: string) => {
        if (name !== searchSchoolsValue) {
            setSearchSchoolsValue(name)
        }
        // registerFormSelect("school_id", school)
        registerFormSelect("school", name)
    }
    const fieldsAreNotValid = useMemo(() => {
        return Object.keys(formik.values).some((key) => {
            const typedKey = key as UserRegisterFormKeys;
            return !formik.values[typedKey]
        })
    }, [formik.values])

    const registerFormSelect = (key: UserRegisterFormSelects, value: any) => {
        formik.setValues((values) => {
            return { ...values, [key]: value }
        })
    }

    useEffect(() => {
        dispatch(resetPagination())

        if (formik.values.city_id && !defferedSearchCitiesValue.length) {
            registerFormSelect("city_id", 0)
        }

        // Если поиск очищен, подгружаем города
        if (!defferedSearchCitiesValue.length) {
            fetchCities();
        }
    }, [defferedSearchCitiesValue])

    useEffect(() => {
        if (cities.pagination.part == 1) {
            fetchCities()
        }

    }, [cities.pagination.part])

    // useEffect(() => {
    //     dispatch(resetSchoolPagination())

    //     if (formik.values.school_id && !defferedSearchSchoolsValue.length) {
    //         registerFormSelect("school_id", 0)
    //     }
    // }, [defferedSearchSchoolsValue])

     useEffect(() => {
    dispatch(resetSchoolPagination())
    
    if (formik.values.school && !defferedSearchSchoolsValue.length) {
        registerFormSelect("school", "")
    }

    if (formik.values.city_id) {
        fetchSchools() 
    }
}, [defferedSearchSchoolsValue, formik.values.city_id])

    return (
        <form autoComplete={"off"} onSubmit={formik.handleSubmit} action="" className={styles.form}>
            <FieldsGroup
                classNames={{
                    body: styles.personFields
                }}
                legendChildren={<h2 className={styles.fieldsGroupTitle}>Личные данные</h2>}
            >
                <InputField<UserRegisterFormKeys>
                    placeholder={"Имя"}
                    name={"first_name"}
                    value={formik.values.first_name}
                    onChange={formik.handleChange}
                />
                <InputField<UserRegisterFormKeys>
                    placeholder={"Фамилия"}
                    name={"last_name"}
                    value={formik.values.last_name}
                    onChange={formik.handleChange}
                />
                <SelectField
                    className={styles.ageSelect}
                    readOnly
                    placeholder={"Выбери свой пол"}
                    htmlId={"register-gender-input"}
                    options={STATIC_DATA.GENDER_OPTIONS}
                    value={STATIC_DATA.GENDER_OPTIONS.find(item => item.value === formik.values.gender)?.label}
                    selectedValue={formik.values.gender}
                    onChange={(value) => registerFormSelect("gender", value)}
                />
                <SelectField
                    className={styles.ageSelect}
                    readOnly
                    placeholder={"Выбери свой возраст"}
                    htmlId={"register-age-input"}
                    options={STATIC_DATA.AGES_OPTIONS}
                    value={STATIC_DATA.AGES_OPTIONS.find(item => item.value === formik.values.age)?.label}
                    selectedValue={formik.values.age}
                    onChange={(value) => registerFormSelect("age", value)}
                />
            </FieldsGroup>
            <FieldsGroup
                classNames={{
                    body: styles.schoolFields
                }}
                legendChildren={
                    <h2 className={styles.fieldsGroupTitle}>Данные о школе</h2>
                }
            >
                <SelectField
                    className={styles.ageSelect}
                    placeholder={"Выбери свой город"}
                    htmlId={"register-city-input"}
                    options={getSelectOptions(cities.items, "id", "name")}
                    asyncOptions={{
                        is_loading: cities.statuses.loading,
                        is_pag_loading: cities.pagination.loading,
                        part: cities.pagination.part,
                        disableObserving: cities.pagination.is_out,
                        limit: cities.pagination.limit,
                        onLoad: fetchCities,
                    }}
                    onSearch={(e) => setSearchCitiesValue(e.target.value)}
                    value={searchCitiesValue}
                    selectedValue={formik.values.city_id}
                    onChange={(value, label) => onCitySelect(value, label)}
                />
                <SelectField
                    className={styles.ageSelect}
                    placeholder={"Выбери свою школу"}
                    htmlId={"register-school-input"}
                    options={getSelectOptions(schools.items, "id", "name")}
                    asyncOptions={{
                        is_loading: schools.statuses.loading,
                        is_pag_loading: schools.pagination.loading,
                        part: schools.pagination.part,
                        disableObserving: schools.pagination.is_out,
                        limit: schools.pagination.limit,
                        onLoad: fetchSchools,
                    }}
                    onSearch={(e) => setSearchSchoolsValue(e.target.value)}
                    value={searchSchoolsValue}
                    selectedValue={getSelectOptions(schools.items, "id", "name").find(opt => opt.label === formik.values.school)?.value || 0}
                    onChange={(value, label) => onSchoolSelect(value, label)}
                    disabled={!formik.values.city_id}
                />
            </FieldsGroup>
            <div className={styles.bottom}>
                <Button
                    isLoading={user.register.loading}
                    type={"submit"}
                    disabled={fieldsAreNotValid || !agreeCheckbox}>
                    Начать
                </Button>
                <div onClick={() => setAgreeCheckbox(prev => !prev)} tabIndex={1} className={styles.checkboxWrapper}>
                    <div className={styles.checkbox}>
                        {agreeCheckbox ? <img src={tickIcon} height={5} width={9} alt="" /> : null}
                    </div>
                    <span>Согласен на обработку данных</span>
                </div>
            </div>
        </form>
    )
}
