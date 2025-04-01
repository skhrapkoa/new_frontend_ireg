import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import UploadAvatar from 'components/third-party/dropzone/Avatar';
import UploadSingleFile from 'components/third-party/dropzone/SingleFile';
import UploadMultiFile from 'components/third-party/dropzone/MultiFile';

// third-party
import { Formik } from 'formik';
import * as yup from 'yup';
import IconButton from 'components/@extended/IconButton';

// assets
import UnorderedListOutlined from '@ant-design/icons/UnorderedListOutlined';
import AppstoreOutlined from '@ant-design/icons/AppstoreOutlined';

// ==============================|| PLUGINS - DROPZONE ||============================== //

export default function DropzonePage() {
  const [list, setList] = useState(false);

  // Функция для получения presigned URL
  const getPresignedUrl = async (file) => {
    try {
      // Получаем токен из localStorage
      const accessToken = localStorage.getItem('serviceToken');
      
      if (!accessToken) {
        throw new Error('Authentication token not found. Please login again.');
      }
      
      const response = await fetch('http://127.0.0.1:8000/api/v1/project/documents/create_s3/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `JWT ${accessToken}`
        },
        body: JSON.stringify({ name_aws: file.name })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch presigned URL');
      }

      const data = await response.json();
      return { id: data.id, url: data.url, price: data.price };
    } catch (error) {
      console.error('Error getting presigned URL:', error);
      throw error;
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard
          title="Upload Multiple File"
          secondary={
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <IconButton color={list ? 'secondary' : 'primary'} size="small" onClick={() => setList(false)}>
                <UnorderedListOutlined style={{ fontSize: '1.15rem' }} />
              </IconButton>
              <IconButton color={list ? 'primary' : 'secondary'} size="small" onClick={() => setList(true)}>
                <AppstoreOutlined style={{ fontSize: '1.15rem' }} />
              </IconButton>
            </Stack>
          }
        >
          <Formik
            initialValues={{ files: null }}
            onSubmit={() => {
              // submit form
            }}
            validationSchema={yup.object().shape({
              files: yup.mixed().required('Avatar is a required.')
            })}
          >
            {({ values, handleSubmit, setFieldValue, touched, errors }) => (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Stack spacing={1.5} alignItems="center">
                      <UploadMultiFile
                        showList={list}
                        setFieldValue={setFieldValue}
                        files={values.files}
                        error={touched.files && !!errors.files}
                        onGetAction={getPresignedUrl} // Передаем функцию получения presigned URL
                        onUploading={() => console.log('Uploading started')}
                        onCreated={(id, price) => console.log(`File created: ID ${id}, price ${price}`)}
                        onSuccess={() => console.log('File uploaded successfully')}
                      />
                    </Stack>
                    {touched.files && errors.files && (
                      <FormHelperText error id="standard-weight-helper-text-password-login">
                        {errors.files}
                      </FormHelperText>
                    )}
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </MainCard>
      </Grid>
    </Grid>
  );
}
