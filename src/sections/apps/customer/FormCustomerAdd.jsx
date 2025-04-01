import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';

// third-party
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project imports
import AlertCustomerDelete from './AlertCustomerDelete';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { ThemeMode, Gender } from 'config';
import { openSnackbar } from 'api/snackbar';
import { insertCustomer, updateCustomer } from 'api/customer';
import { getImageUrl, ImagePath } from 'utils/getImageUrl';

// assets
import CameraOutlined from '@ant-design/icons/CameraOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import DeleteFilled from '@ant-design/icons/DeleteFilled';
import UploadMultiFile from 'components/third-party/dropzone/MultiFile';

const skills = [
  'Adobe XD',
  'After Effect',
  'Angular',
  'Animation',
  'ASP.Net',
  'Bootstrap',
  'C#',
  'CC',
  'Corel Draw',
  'CSS',
  'DIV',
  'Dreamweaver',
  'Figma',
  'Graphics',
  'HTML',
  'Illustrator',
  'J2Ee',
  'Java',
  'Javascript',
  'JQuery',
  'Logo Design',
  'Material UI',
  'Motion',
  'MVC',
  'MySQL',
  'NodeJS',
  'npm',
  'Photoshop',
  'PHP',
  'React',
  'Redux',
  'Reduxjs & tooltit',
  'SASS',
  'SCSS',
  'SQL Server',
  'SVG',
  'UI/UX',
  'User Interface Designing',
  'Wordpress'
];

// Добавляем константу с типами документов после определения переменной skills
const DocumentTypes = {
  production: 'Произведение',
  music_production: 'Музыкальное произведение',
  prototype: 'Прототип (чертеж)',
  logo: 'Логотип',
  literary_production: 'Литературное произведение',
  educational_material: 'Учебный материал',
  photography: 'Фотография',
  video: 'Видео',
  screenplay: 'Сценарий',
  computer_program: 'Программа ЭВМ',
  character: 'Персонаж',
  recipe: 'Рецептура',
  design_image: 'Изображение (Дизайн)',
  patent_material: 'Материал патентной заявки',
  technology: 'Технология (Методика)',
  database: 'База данных',
  knowhow: 'Ноу-хау (коммерческая тайна)',
  sound_recording: 'Фонограмма',
  scientific_production: 'Произведение науки',
  scientific_educational_production: 'Научно-методическое произведение',
  customer_database: 'База данных клиентов',
  project_documentation: 'Проектная документация',
};

// constant
const getInitialValues = (customer) => {
  const newCustomer = {
    type: '',
    category: '',
    authors: [],
    owners: [],
    firstName: '',
    lastName: '',
    name: '',
    email: '',
    age: 18,
    avatar: 1,
    gender: Gender.FEMALE,
    role: '',
    fatherName: '',
    orders: 0,
    progress: 50,
    status: 2,
    orderStatus: '',
    contact: '',
    country: '',
    location: '',
    about: '',
    skills: [],
    time: ['just now'],
    date: ''
  };

  if (customer) {
    return _.merge({}, newCustomer, customer);
  }

  return newCustomer;
};

const allStatus = [
  { value: 3, label: 'Rejected' },
  { value: 1, label: 'Verified' },
  { value: 2, label: 'Pending' }
];


const formatFileSize = (size) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

// ==============================|| CUSTOMER ADD / EDIT - FORM ||============================== //

export default function FormCustomerAdd({ customer, closeModal }) {
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(undefined);
  const [avatar, setAvatar] = useState(
    getImageUrl(`avatar-${customer && customer !== null && customer?.avatar ? customer.avatar : 1}.png`, ImagePath.USERS)
  );

  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
    }
  }, [selectedImage]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const CustomerSchema = Yup.object().shape({
    name: Yup.string().max(255).required('Название обязательно'),
    type: Yup.string().required('Тип обязательно указать'),
    category: Yup.string(),
    firstName: Yup.string().max(255).required('First Name is required'),
    lastName: Yup.string().max(255).required('Last Name is required'),
    email: Yup.string().max(255).required('Email is required').email('Must be a valid email'),
    status: Yup.string().required('Status is required'),
    location: Yup.string().max(500),
    about: Yup.string().max(500)
  });

  const [openAlert, setOpenAlert] = useState(false);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    closeModal();
  };

  const formik = useFormik({
    initialValues: getInitialValues(customer),
    validationSchema: CustomerSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newCustomer = values;
        newCustomer.name = newCustomer.firstName + ' ' + newCustomer.lastName;

        if (customer) {
          updateCustomer(newCustomer.id, newCustomer).then(() => {
            openSnackbar({
              open: true,
              message: 'Customer update successfully.',
              variant: 'alert',

              alert: {
                color: 'success'
              }
            });
            setSubmitting(false);
            closeModal();
          });
        } else {
          await insertCustomer(newCustomer).then(() => {
            openSnackbar({
              open: true,
              message: 'Customer added successfully.',
              variant: 'alert',

              alert: {
                color: 'success'
              }
            });
            setSubmitting(false);
            closeModal();
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;

  if (loading)
    return (
      <Box sx={{ p: 5 }}>
        <Stack direction="row" justifyContent="center">
          <CircularWithPath />
        </Stack>
      </Box>
    );

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
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle>{customer ? 'Редактирование объекта' : 'Регистрация объекта'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
<Grid container spacing={3}>
              <Grid item xs={12}>

                <UploadMultiFile
                  error={touched.files && !!errors.files}
                  files={formik.values.files}
                  setFieldValue={setFieldValue}
                  onGetAction={getPresignedUrl}
                  onUploading={() => console.log('Uploading started')}
                  onCreated={(id, price) => console.log(`File created: ID ${id}, price ${price}`)}
                  onSuccess={() => console.log('File uploaded successfully')}
                  onChange={(newFiles) => setFieldValue('files', newFiles)}
                />
                {(!formik.values.files || (Array.isArray(formik.values.files) && formik.values.files.length === 0)) && (
                  <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'text.secondary' }}>
                    Загрузите файлы содержащие объект. Это могут быть документы или изображения
                  </Typography>
                )}
              </Grid>


              <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="name">* Название</InputLabel>
                    <TextField
                      fullWidth
                      id="name"
                      placeholder="Введите название объекта"
                      {...getFieldProps('name')}
                      error={Boolean(touched.name && errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </Stack>
                </Grid>

                {/* Тип */}
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="type">Тип</InputLabel>
                    <FormControl fullWidth error={Boolean(touched.type && errors.type)}>
                      <Select
                        id="type"
                        displayEmpty
                        {...getFieldProps('type')}
                        onChange={(e) => setFieldValue('type', e.target.value)}
                        input={<OutlinedInput id="select-type" placeholder="Выберите тип" />}
                        renderValue={(selected) => {
                          if (!selected) {
                            return <Typography variant="subtitle1">Выберите тип</Typography>;
                          }
                          return <Typography variant="subtitle2">{DocumentTypes[selected]}</Typography>;
                        }}
                      >
                        <MenuItem disabled value="">
                          <Typography variant="subtitle1">Выберите тип</Typography>
                        </MenuItem>
                        {Object.entries(DocumentTypes).map(([key, value]) => (
                          <MenuItem key={key} value={key}>
                            <ListItemText primary={value} />
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.type && errors.type && (
                        <FormHelperText error id="type-error">
                          {errors.type}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Stack>
                </Grid>

                {/* Категория */}
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="category">Категория</InputLabel>
                    <FormControl fullWidth error={Boolean(touched.category && errors.category)}>
                      <Select
                        id="category"
                        displayEmpty
                        {...getFieldProps('category')}
                        onChange={(e) => setFieldValue('category', e.target.value)}
                        input={<OutlinedInput id="select-category" placeholder="Выберите категорию" />}
                        renderValue={(selected) => {
                          if (!selected) {
                            return <Typography variant="subtitle1">Выберите категорию</Typography>;
                          }
                          return <Typography variant="subtitle2">{DocumentTypes[selected]}</Typography>;
                        }}
                      >
                        <MenuItem disabled value="">
                          <Typography variant="subtitle1">Выберите категорию</Typography>
                        </MenuItem>
                        {Object.entries(DocumentTypes).map(([key, value]) => (
                          <MenuItem key={key} value={key}>
                            <ListItemText primary={value} />
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.category && errors.category && (
                        <FormHelperText error id="category-error">
                          {errors.category}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Stack>
                </Grid>

                {/* Авторы */}
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="authors">Укажите автора</InputLabel>
                    <Autocomplete
                      multiple
                      fullWidth
                      id="authors"
                      options={skills}
                      {...getFieldProps('authors')}
                      getOptionLabel={(label) => label}
                      onChange={(event, newValue) => {
                        setFieldValue('authors', newValue);
                      }}
                      renderInput={(params) => <TextField {...params} name="authors" placeholder="Выберите или добавьте авторов" />}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            variant="combined"
                            key={index}
                            label={option}
                            deleteIcon={<CloseOutlined style={{ fontSize: '0.75rem' }} />}
                            sx={{ color: 'text.primary' }}
                          />
                        ))
                      }
                    />
                    <Typography variant="caption" color="error">
                      Важно!
                    </Typography>
                  </Stack>
                </Grid>

                {/* Правообладатели */}
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="owners">Укажите правообладателя</InputLabel>
                    <Autocomplete
                      multiple
                      fullWidth
                      id="owners"
                      options={skills}
                      {...getFieldProps('owners')}
                      getOptionLabel={(label) => label}
                      onChange={(event, newValue) => {
                        setFieldValue('owners', newValue);
                      }}
                      renderInput={(params) => <TextField {...params} name="owners" placeholder="Выберите или добавьте правообладателей" />}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            variant="combined"
                            key={index}
                            label={option}
                            deleteIcon={<CloseOutlined style={{ fontSize: '0.75rem' }} />}
                            sx={{ color: 'text.primary' }}
                          />
                        ))
                      }
                    />
                    <Typography variant="caption" color="error">
                      Важно!
                    </Typography>
                  </Stack>
                </Grid>
              
                <Grid item xs={12} md={8}>
                  <Grid container spacing={3}>
                   
  

                    <Grid item xs={12}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle1">Make Contact Info Public</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Means that anyone viewing your profile will be able to see your contacts details
                          </Typography>
                        </Stack>
                        <FormControlLabel control={<Switch defaultChecked sx={{ mt: 0 }} />} label="" labelPlacement="start" />
                      </Stack>
                      <Divider sx={{ my: 2 }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle1">Available to hire</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Toggling this will let your teammates know that you are available for acquiring new projects
                          </Typography>
                        </Stack>
                        <FormControlLabel control={<Switch sx={{ mt: 0 }} />} label="" labelPlacement="start" />
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2.5 }}>
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                  {customer && (
                    <Tooltip title="Delete Customer" placement="top">
                      <IconButton onClick={() => setOpenAlert(true)} size="large" color="error">
                        <DeleteFilled />
                      </IconButton>
                    </Tooltip>
                  )}
                </Grid>
                <Grid item>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button color="error" onClick={closeModal}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                      {customer ? 'Edit' : 'Add'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </DialogActions>
          </Form>
        </LocalizationProvider>
      </FormikProvider>
      {customer && <AlertCustomerDelete id={customer.id} title={customer.name} open={openAlert} handleClose={handleAlertClose} />}
    </>
  );
}

FormCustomerAdd.propTypes = { customer: PropTypes.any, closeModal: PropTypes.func };
