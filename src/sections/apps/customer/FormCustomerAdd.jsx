import PropTypes from 'prop-types';
import { useEffect, useState, useRef, useCallback, forwardRef } from 'react';

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
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';

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
import { projectFetch } from 'utils/project-api';
import useProjectApi from 'hooks/useProjectApi';

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
    files: [],
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
    date: '',
    dueDate: null
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
  const { fetchData } = useProjectApi();

  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(undefined);
  const [categories, setCategories] = useState([]); // Состояние для хранения категорий
  const [loadingCategories, setLoadingCategories] = useState(true); // Загрузка категорий
  const [categoryError, setCategoryError] = useState(false); // Ошибка загрузки категорий
  
  // Новые состояния для авторов и правообладателей
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersPage, setMembersPage] = useState(1);
  const [hasMoreMembers, setHasMoreMembers] = useState(true);
  const [membersSearch, setMembersSearch] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  const [avatar, setAvatar] = useState(
    getImageUrl(`avatar-${customer && customer !== null && customer?.avatar ? customer.avatar : 1}.png`, ImagePath.USERS)
  );

  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
    }
  }, [selectedImage]);

  // Загружаем категории с бэкенда
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setCategoryError(false);
      try {
        const result = await fetchData('/api/v1/categories_document/');
        if (Array.isArray(result)) {
          setCategories(result);
        }
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
        setCategoryError(true);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
    setLoading(false);
  }, [fetchData]);

  // Загружаем участников проекта
  const fetchMembers = useCallback(async (page = 1, searchParams = {}) => {
    try {
      setMembersLoading(true);
      
      // Формируем строку запроса с параметрами поиска
      let queryParams = [`page=${page}`];
      
      if (searchParams.last_name) {
        queryParams.push(`last_name=${encodeURIComponent(searchParams.last_name)}`);
      }
      
      if (searchParams.first_name) {
        queryParams.push(`first_name=${encodeURIComponent(searchParams.first_name)}`);
      }
      
      if (searchParams.middle_name) {
        queryParams.push(`middle_name=${encodeURIComponent(searchParams.middle_name)}`);
      }
      
      console.log(`Загружаем участников: страница ${page}, параметры:`, searchParams);
      
      const queryString = queryParams.join('&');
      const response = await fetchData(`/api/v1/project/members/?${queryString}`);
      
      if (response && response.results) {
        console.log(`Загружено ${response.results.length} участников. Есть следующая страница: ${!!response.next}`);
        if (page === 1) {
          setMembers(response.results);
        } else {
          setMembers((prev) => [...prev, ...response.results]);
        }
        setHasMoreMembers(!!response.next);
      } else {
        console.log('Нет результатов или некорректный ответ от API');
        setHasMoreMembers(false);
      }
    } catch (error) {
      console.error('Ошибка при загрузке участников:', error);
      setHasMoreMembers(false);
    } finally {
      setMembersLoading(false);
    }
  }, [fetchData]);

  // Загружаем участников при первой загрузке
  useEffect(() => {
    fetchMembers(1, {});
  }, [fetchMembers]);

  // Интеллектуальный анализ поискового запроса
  const parseSearchQuery = (query) => {
    // Очищаем строку от лишних пробелов и приводим к нижнему регистру
    const cleanQuery = query.trim();
    
    if (!cleanQuery) {
      return {}; // Пустой запрос
    }

    // Разделяем запрос на слова
    const words = cleanQuery.split(/\s+/);
    
    // Если одно слово - считаем его фамилией
    if (words.length === 1) {
      return { last_name: words[0] };
    }
    
    // Если два слова - считаем их фамилией и именем
    if (words.length === 2) {
      return {
        last_name: words[0],
        first_name: words[1]
      };
    }
    
    // Если три и более слова - используем первые три как фамилию, имя и отчество
    return {
      last_name: words[0],
      first_name: words[1],
      middle_name: words[2]
    };
  };

  // Обработчик изменения поискового запроса
  const handleMembersSearch = (search) => {
    setMembersSearch(search);
    
    // Отменяем предыдущий таймаут, если он был
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Создаем новый таймаут для задержки запроса
    const timeout = setTimeout(() => {
      setMembersPage(1);
      const searchParams = parseSearchQuery(search);
      fetchMembers(1, searchParams);
    }, 500); // Задержка 500мс
    
    setSearchTimeout(timeout);
  };

  // Функция для загрузки дополнительных участников при скролле
  const loadMoreMembers = () => {
    if (!membersLoading && hasMoreMembers) {
      const nextPage = membersPage + 1;
      setMembersPage(nextPage);
      const searchParams = parseSearchQuery(membersSearch);
      fetchMembers(nextPage, searchParams);
    }
  };

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
        // Логируем все значения для отладки
        console.log('Form submitted with values:', values);
        console.log('Category value:', values.category);
        
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
      // Get project-specific URL using the fetchData function
      const data = await fetchData('/api/v1/project/documents/create_s3/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name_aws: file.name })
      });
      
      if (!data || !data.url) {
        throw new Error('Получен некорректный ответ от сервера');
      }
      
      return { id: data.id, url: data.url, price: data.price };
    } catch (error) {
      console.error('Error getting presigned URL:', error);
      
      // Проверяем наличие ответа от сервера и HTTP-статуса
      if (error.status) {
        // Обрабатываем различные HTTP ошибки
        switch (error.status) {
          case 401:
            throw new Error('Необходима авторизация. Пожалуйста, войдите в систему.');
          case 403:
            throw new Error('У вас нет прав для загрузки файлов.');
          case 404:
            throw new Error('Сервис загрузки не найден. Обратитесь к администратору.');
          case 500:
            throw new Error('Внутренняя ошибка сервера. Повторите попытку позже.');
          default:
            throw new Error(`Ошибка сервера: ${error.status}`);
        }
      } else if (error.message && error.message.includes('Failed to fetch')) {
        // Проблемы с сетью
        throw new Error('Не удалось подключиться к серверу. Проверьте интернет-соединение.');
      }
      
      // Если дошли до сюда, значит другая ошибка
      throw error;
    }
  };

  // Новая функция для обработки изменения категории
  const handleCategoryChange = (event) => {
    console.log('Selected category:', event.target.value);
    setFieldValue('category', event.target.value);
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
                            return <Typography variant="body1">Выберите тип</Typography>;
                          }
                          return <Typography variant="body1">{DocumentTypes[selected]}</Typography>;
                        }}
                      >
                        <MenuItem disabled value="">
                          <Typography variant="body1">Выберите тип</Typography>
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

                {/* Категория - теперь загружается с бэкенда */}
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="category">Категория</InputLabel>
                    <FormControl fullWidth error={Boolean(touched.category && errors.category) || categoryError}>
                      <Select
                        id="category"
                        displayEmpty
                        {...getFieldProps('category')}
                        onChange={handleCategoryChange}
                        input={<OutlinedInput id="select-category" placeholder="Выберите категорию" />}
                        disabled={loadingCategories}
                        renderValue={(selected) => {
                          if (loadingCategories) return <Typography variant="body1">Загрузка категорий...</Typography>;
                          if (!selected) {
                            return <Typography variant="body1">Выберите категорию</Typography>;
                          }
                          // Ищем категорию в массиве категорий
                          const selectedId = String(selected);
                          const selectedCategory = categories.find(cat => String(cat.id) === selectedId);
                          return <Typography variant="body1">{selectedCategory?.name || ""}</Typography>;
                        }}
                      >
                        {loadingCategories && (
                          <MenuItem disabled>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1 }}>
                              <CircularWithPath size={16} />
                              <Typography variant="body1">Загрузка категорий...</Typography>
                            </Stack>
                          </MenuItem>
                        )}
                        
                        {categoryError && (
                          <MenuItem disabled>
                            <Typography color="error" variant="body1">Ошибка загрузки категорий</Typography>
                          </MenuItem>
                        )}
                        
                        {!loadingCategories && !categoryError && (
                          <MenuItem disabled value="">
                            <Typography variant="body1">Выберите категорию</Typography>
                          </MenuItem>
                        )}
                        
                        {!loadingCategories && !categoryError && categories.map((category) => (
                          <MenuItem key={category.id} value={category.id.toString()}>
                            <ListItemText primary={category.name} />
                          </MenuItem>
                        ))}
                      </Select>
                      {(touched.category && errors.category) && (
                        <FormHelperText error id="category-error">
                          {errors.category}
                        </FormHelperText>
                      )}
                      {categoryError && (
                        <FormHelperText error>
                          Не удалось загрузить категории. Пожалуйста, попробуйте позже.
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
                      options={members}
                      {...getFieldProps('authors')}
                      getOptionLabel={(option) => typeof option === 'string' ? option : option.get_fullname}
                      isOptionEqualToValue={(option, value) => 
                        option.id === value.id || option === value
                      }
                      onChange={(event, newValue) => {
                        setFieldValue('authors', newValue);
                      }}
                      onInputChange={(event, value) => {
                        if (event) {
                          handleMembersSearch(value);
                        }
                      }}
                      filterOptions={(options) => options}
                      loading={membersLoading}
                      ListboxProps={{
                        onScroll: (event) => {
                          const target = event.currentTarget;
                          if (
                            Math.abs(
                              target.scrollHeight - target.clientHeight - target.scrollTop
                            ) < 50 &&
                            hasMoreMembers &&
                            !membersLoading
                          ) {
                            console.log('Загружаем больше участников (авторы)...');
                            loadMoreMembers();
                          }
                        },
                        style: { maxHeight: '200px' },
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          name="authors" 
                          placeholder="Выберите или добавьте авторов" 
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {membersLoading ? <CircularWithPath size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            )
                          }}
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            variant="combined"
                            key={index}
                            label={typeof option === 'string' ? option : option.get_fullname}
                            deleteIcon={<CloseOutlined style={{ fontSize: '0.75rem' }} />}
                            sx={{ color: 'text.primary' }}
                          />
                        ))
                      }
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {option.get_fullname}
                        </li>
                      )}
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
                      options={members}
                      {...getFieldProps('owners')}
                      getOptionLabel={(option) => typeof option === 'string' ? option : option.get_fullname}
                      isOptionEqualToValue={(option, value) => 
                        option.id === value.id || option === value
                      }
                      onChange={(event, newValue) => {
                        setFieldValue('owners', newValue);
                      }}
                      onInputChange={(event, value) => {
                        if (event) {
                          handleMembersSearch(value);
                        }
                      }}
                      filterOptions={(options) => options}
                      loading={membersLoading}
                      ListboxProps={{
                        onScroll: (event) => {
                          const target = event.currentTarget;
                          if (
                            Math.abs(
                              target.scrollHeight - target.clientHeight - target.scrollTop
                            ) < 50 &&
                            hasMoreMembers &&
                            !membersLoading
                          ) {
                            console.log('Загружаем больше участников (правообладатели)...');
                            loadMoreMembers();
                          }
                        },
                        style: { maxHeight: '200px' },
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          name="owners" 
                          placeholder="Выберите или добавьте правообладателей" 
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {membersLoading ? <CircularWithPath size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            )
                          }}
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            variant="combined"
                            key={index}
                            label={typeof option === 'string' ? option : option.get_fullname}
                            deleteIcon={<CloseOutlined style={{ fontSize: '0.75rem' }} />}
                            sx={{ color: 'text.primary' }}
                          />
                        ))
                      }
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {option.get_fullname}
                        </li>
                      )}
                    />
                    <Typography variant="caption" color="error">
                      Важно!
                    </Typography>
                  </Stack>
                </Grid>
                
                {/* Срок окончания */}
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="dueDate">Дата создания</InputLabel>
                    <MobileDatePicker
                      value={formik.values.dueDate}
                      format="dd/MM/yyyy"
                      onChange={(date) => {
                        formik.setFieldValue('dueDate', date);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: Boolean(touched.dueDate && errors.dueDate),
                          helperText: touched.dueDate && errors.dueDate
                        }
                      }}
                    />
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
