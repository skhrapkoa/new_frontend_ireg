// Импорты PropTypes, React и зависимостей
import PropTypes from 'prop-types';
import React from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// Сторонние библиотеки
import * as Yup from 'yup';
import { Formik } from 'formik';
import { preload } from 'swr';

// Импорты из проекта
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

import useAuth from 'hooks/useAuth';

import { fetcher } from 'utils/axios';

// Иконки
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

// ============================|| JWT - Вход ||============================ //

export default function AuthLogin({ isDemo = false }) {
  const [checked, setChecked] = React.useState(false); // Состояние для чекбокса

  const { login } = useAuth(); // Хук для авторизации

  const [showPassword, setShowPassword] = React.useState(false); // Состояние для отображения пароля
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword); // Переключение видимости пароля
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault(); // Предотвращение стандартного поведения
  };

  const [searchParams] = useSearchParams();
  const auth = searchParams.get('auth'); // Получение параметра auth из URL

  return (
    <>
      <Formik
        initialValues={{
          email: '', // Стартовые значения
          password: '',
          submit: null,
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Должен быть действительный email').max(255).required('Email обязателен'),
          password: Yup.string()
            .required('Пароль обязателен')
            .test('no-leading-trailing-whitespace', 'Пароль не может начинаться или заканчиваться пробелами', (value) => value === value.trim())
            .max(20, 'Пароль должен быть короче 20 символов'),
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            const trimmedEmail = values.email.trim(); // Убираем пробелы из email
            await login(trimmedEmail, values.password); // Вход в систему
            setStatus({ success: true });
            setSubmitting(false);
            preload('api/menu/dashboard', fetcher); // Предзагрузка данных меню
          } catch (err) {
            console.error(err); // Логируем ошибку
            setStatus({ success: false });
            setErrors({ submit: err.message }); // Устанавливаем ошибку
            setSubmitting(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Поле для ввода email */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-login">Адрес электронной почты</InputLabel>
                  <OutlinedInput
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Введите адрес электронной почты"
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error id="standard-weight-helper-text-email-login">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>

              {/* Поле для ввода пароля */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="password-login">Пароль</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="-password-login"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="показать/скрыть пароль"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="Введите пароль"
                  />
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText error id="standard-weight-helper-text-password-login">
                    {errors.password}
                  </FormHelperText>
                )}
              </Grid>

              {/* Чекбокс и ссылка "Забыли пароль?" */}
              <Grid item xs={12} sx={{ mt: -1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(event) => setChecked(event.target.checked)}
                        name="checked"
                        color="primary"
                        size="small"
                      />
                    }
                    label={<Typography variant="h6">Оставаться в системе</Typography>}
                  />
                  <Link
                    variant="h6"
                    component={RouterLink}
                    to={isDemo ? '/auth/forgot-password' : auth ? `/${auth}/forgot-password?auth=jwt` : '/forgot-password'}
                    color="text.primary"
                  >
                    Забыли пароль?
                  </Link>
                </Stack>
              </Grid>

              {/* Ошибка отправки */}
              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}

              {/* Кнопка входа */}
              <Grid item xs={12}>
                <AnimateButton>
                  <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                    Войти
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}

// Описание свойств компонента
AuthLogin.propTypes = { isDemo: PropTypes.bool };
