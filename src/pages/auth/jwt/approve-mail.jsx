import { Link } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project import
import AnimateButton from 'components/@extended/AnimateButton';
import AuthWrapper from 'sections/auth/AuthWrapper';

import { useEffect, useState } from 'react';

// Страница отображается после успешной регистрации //

export default function ApproveMail() {
  const [email, setEmail] = useState('');
    useEffect(() => {
    const savedEmail = sessionStorage.getItem('approve_email');
    setEmail(savedEmail);
    // Очистить email из sessionStorage, если он больше не нужен
    sessionStorage.removeItem('approve_email');
  }, []);
  console.log(email)
  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Проверьте свою почту</Typography>
            <Typography color="secondary" sx={{ mb: 0.5, mt: 1.25 }}>
              Мы отправили письмо на почту <strong>{email}</strong>, в котором присутствует ссылка на активацию вашего аккаунта
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <AnimateButton>
            <Button
              component={Link}
              to="/login"
              disableElevation
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              color="primary"
            >
              Войти
            </Button>
          </AnimateButton>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
