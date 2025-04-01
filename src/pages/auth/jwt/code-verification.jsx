// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthCodeVerification from 'sections/auth/jwt/AuthCodeVerification';
import {useEffect, useState} from "react";

// ================================|| JWT - CODE VERIFICATION ||================================ //

export default function CodeVerification() {

  const [email, setEmail] = useState('');
  useEffect(() => {
    const savedEmail = sessionStorage.getItem('send_code_verification_email');
    setEmail(savedEmail);
  }, []);
  console.log(email)

  return (
      <AuthWrapper>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack spacing={1}>
              <Typography variant="h3">Введите код подтверждения</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Typography>Мы отправили код на почту <strong>{email}</strong></Typography>
          </Grid>
          <Grid item xs={12}>
            <AuthCodeVerification/>
          </Grid>
        </Grid>
      </AuthWrapper>
  );

}