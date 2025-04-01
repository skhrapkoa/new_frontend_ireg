import { Link, useSearchParams } from 'react-router-dom';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// Импорты из проекта
import useAuth from 'hooks/useAuth';
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/jwt/AuthLogin';

// ================================|| JWT - Вход ||================================ //

export default function Login() {
  const { isLoggedIn } = useAuth(); // Проверка, авторизован ли пользователь

  const [searchParams] = useSearchParams();
  const auth = searchParams.get('auth'); // Получение параметра auth из URL

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        {/* Заголовок и ссылка на регистрацию */}
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Вход</Typography>
            <Typography
              component={Link}
              to={isLoggedIn ? '/auth/register' : auth ? `/${auth}/register?auth=jwt` : '/register'}
              variant="body1"
              sx={{ textDecoration: 'none' }}
              color="primary"
            >
              Нет аккаунта?
            </Typography>
          </Stack>
        </Grid>

        {/* Форма входа */}
        <Grid item xs={12}>
          <AuthLogin isDemo={isLoggedIn} />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
