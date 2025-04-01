// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';
import OtpInput from 'react-otp-input';
import axios from 'utils/axios';

// project import
import AnimateButton from 'components/@extended/AnimateButton';
import React, { useEffect, useState } from 'react';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function AuthCodeVerification() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false); // For modal
  const [serverError, setServerError] = React.useState(''); // To display server error
    const [email, setEmail] = useState('');
  useEffect(() => {
    const savedEmail = sessionStorage.getItem('send_code_verification_email');
    setEmail(savedEmail);
  }, []);
  console.log(email)

  const handleClose = () => setOpen(false);

  return (
    <Formik
      initialValues={{ otp: '' }}
      validationSchema={Yup.object({
        otp: Yup.string().length(4, 'OTP must be exactly 4 digits').required('OTP is required')
      })}
      onSubmit={async (values, { resetForm }) => {
        try {
          const response = await axios.post(
              'api/v1/users/verification_registration_code/',
              { otp: values.otp, email: email }
          );

          if (response.status === 200) {
            // If OTP verification is successful
            setOpen(true); // Open success modal
            setTimeout(() => {
              handleClose();
              window.location.href = '/login'; // Redirect to login page
            }, 2000); // Wait 2 seconds before redirect
          }
        } catch (error) {
            console.log(error.detail)
          // Handle server errors
          const errorMessage = error.detail || 'Something went wrong. Please try again.';
          setServerError(errorMessage);
        } finally {
          resetForm();
        }
      }}
    >
      {({ errors, handleSubmit, touched, values, setFieldValue }) => (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box
                sx={{
                  '& input:focus-visible': {
                    outline: 'none !important',
                    borderColor: `${theme.palette.primary.main} !important`,
                    boxShadow: `${theme.customShadows.primary} !important`
                  }
                }}
              >
                <OtpInput
                  value={values.otp}
                  onChange={(otp) => setFieldValue('otp', otp)}
                  inputType="tel"
                  shouldAutoFocus
                  renderInput={(props) => <input {...props} />}
                  numInputs={4}
                  containerStyle={{ justifyContent: 'space-between', margin: -8 }}
                  inputStyle={{
                    width: '100%',
                    margin: '8px',
                    padding: '10px',
                    border: '1px solid',
                    outline: 'none',
                    borderRadius: 4,
                    borderColor: touched.otp && errors.otp ? theme.palette.error.main : theme.palette.divider
                  }}
                />
                {(touched.otp && errors.otp) || serverError ? (
                  <FormHelperText error id="standard-weight-helper-text-otp">
                    {errors.otp || serverError}
                  </FormHelperText>
                ) : null}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <AnimateButton>
                <Button disableElevation fullWidth size="large" type="submit" variant="contained">
                  Continue
                </Button>
              </AnimateButton>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                <Typography>Did not receive the email? Check your spam filter, or</Typography>
                <Typography
                  variant="body1"
                  sx={{ minWidth: 85, ml: 2, textDecoration: 'none', cursor: 'pointer' }}
                  color="primary"
                >
                  Resend code
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          {/* Success Modal */}
          <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
              <Typography variant="h6" component="h2">
                Success
              </Typography>
              <Typography sx={{ mt: 2 }}>
                OTP Verified Successfully! Redirecting to login page...
              </Typography>
            </Box>
          </Modal>
        </form>
      )}
    </Formik>
  );
}
