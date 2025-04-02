import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
// material-ui
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import CloseCircleOutlined from '@ant-design/icons/CloseCircleOutlined';

// third-party
import { useDropzone } from 'react-dropzone';

// project import
import AnimatedLinearWithLabel from 'components/@extended/progress/AnimatedLinearWithLabel';
import RejectionFiles from './RejectionFiles';
import PlaceholderContent from './PlaceholderContent';
import FilesPreview from './FilesPreview';

const DropzoneWrapper = styled('div')(({ theme }) => ({
  outline: 'none',
  padding: theme.spacing(5, 1),
  borderRadius: theme.shape.borderRadius,
  background: theme.palette.background.paper,
  border: `1px dashed ${theme.palette.secondary.main}`,
  '&:hover': { opacity: 0.72, cursor: 'pointer' }
}));

// Сообщение об успешной загрузке
const SuccessMessage = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.success.lighter,
  color: theme.palette.success.dark,
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1)
}));

// Сообщение об ошибке загрузки
const ErrorMessage = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.error.lighter,
  color: theme.palette.error.dark,
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1)
}));

export default function MultiFileUpload({
  error,
  files,
  setFieldValue,
  sx,
  onGetAction,
  onUploading,
  onCreated,
  onSuccess,
  onChange
}) {
  const [progress, setProgress] = useState(0); // Состояние для прогресса загрузки
  const [isUploading, setIsUploading] = useState(false); // Флаг загрузки
  const [showProgressBar, setShowProgressBar] = useState(false); // Флаг отображения прогресс-бара
  const [uploadSuccess, setUploadSuccess] = useState(false); // Флаг успешной загрузки (для уведомления)
  const [uploadError, setUploadError] = useState(false); // Флаг ошибки загрузки
  const [errorMessage, setErrorMessage] = useState(''); // Сообщение об ошибке
  const [fileUploaded, setFileUploaded] = useState(false); // Флаг успешной загрузки (постоянный)
  const [confirmOpen, setConfirmOpen] = useState(false); // Состояние для модального окна подтверждения удаления
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false); // Состояние для модального окна подтверждения отмены загрузки
  const lastProgressRef = useRef(0); // Для сохранения последнего значения прогресса
  const xhrRef = useRef(null); // Ссылка на XMLHttpRequest для возможности отмены
  const messageTimerRef = useRef(null); // Для таймера скрытия сообщения

  // Скрытие сообщений об успехе или ошибке через 3 секунды
  useEffect(() => {
    if (uploadSuccess || uploadError) {
      // Очищаем предыдущий таймер, если он был
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
      
      // Устанавливаем новый таймер для автоматического скрытия
      messageTimerRef.current = setTimeout(() => {
        setUploadSuccess(false);
        setUploadError(false);
        setErrorMessage('');
        messageTimerRef.current = null;
      }, 3000);
    }
    
    // Очищаем таймер при размонтировании компонента
    return () => {
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
    };
  }, [uploadSuccess, uploadError]);

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple: false, // Одиночная загрузка
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        // Сбрасываем состояния при выборе нового файла
        setUploadSuccess(false);
        setUploadError(false);
        setShowProgressBar(false);
        setProgress(0);
        setFileUploaded(false); // Сбрасываем флаг успешной загрузки
        
        setFieldValue('files', [file]); // Устанавливаем файл
        onChange?.([file]); // Обновляем состояние родителя
      }
    }
  });

  // Проверка доступности сервера перед загрузкой
  const checkServerAvailability = async () => {
    try {
      // Получаем из localStorage объект пользователя
      const userDataString = localStorage.getItem('userData');
      if (!userDataString) {
        throw new Error('Необходима авторизация. Пожалуйста, войдите в систему.');
      }
      
      // Проверяем наличие токена - это минимальная проверка перед загрузкой
      const accessToken = localStorage.getItem('serviceToken');
      if (!accessToken) {
        throw new Error('Необходима авторизация. Пожалуйста, войдите в систему.');
      }
      
      return true;
    } catch (error) {
      console.error('Server availability check failed:', error);
      return false;
    }
  };

  const uploadFile = async () => {
    if (!files || files.length === 0) {
      console.error('No file to upload');
      return;
    }

    // Сбрасываем предыдущие состояния
    setUploadSuccess(false);
    setUploadError(false);
    setErrorMessage('');

    // Проверяем доступность сервера перед началом загрузки
    const isServerAvailable = await checkServerAvailability();
    if (!isServerAvailable) {
      setUploadError(true);
      setErrorMessage('Сервер недоступен. Проверьте подключение или войдите в систему повторно.');
      return;
    }

    const file = files[0];
    onUploading?.(); // Начало загрузки
    setIsUploading(true); // Устанавливаем флаг загрузки
    setProgress(0); // Сбрасываем прогресс
    lastProgressRef.current = 0; // Сбрасываем последний прогресс
    setShowProgressBar(true); // Показываем прогресс-бар

    try {
      const data = await onGetAction(file); // Получаем presigned URL
      onCreated?.(String(data.id), String(data.price)); // Передаем ID и цену

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr; // Сохраняем ссылку для возможности отмены

      xhr.open('PUT', data.url, true);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');

      // Обработчик прогресса с защитой от "скачков" назад
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          
          // Предотвращаем обновление, если новое значение меньше предыдущего,
          // или возрастание слишком быстрое (более чем на 5% за один раз)
          if (percentComplete >= lastProgressRef.current && 
              (percentComplete - lastProgressRef.current <= 5 || percentComplete >= 100)) {
            lastProgressRef.current = percentComplete;
            setProgress(percentComplete);
          }
        }
      };

      // Обработчик завершения загрузки
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          lastProgressRef.current = 100;
          setProgress(100); // Устанавливаем 100% после завершения
          
          // Показываем сообщение об успехе через 500ms
          setTimeout(() => {
            setShowProgressBar(false);
            setUploadSuccess(true); // Показать сообщение об успехе 
            setFileUploaded(true); // Установить флаг успешной загрузки навсегда
            onSuccess?.(); // Успешная загрузка
            console.log('File uploaded successfully');
          }, 500);
        } else {
          console.error('Failed to upload file');
          // Устанавливаем ошибку
          setUploadError(true);
          setErrorMessage(getErrorMessage(xhr.status));
          handleUploadError(xhr.status, 'Failed to upload file');
        }
        setIsUploading(false);
        xhrRef.current = null; // Очищаем ссылку
      };

      xhr.onerror = () => {
        console.error('Error during file upload');
        // Устанавливаем ошибку
        setUploadError(true);
        setErrorMessage('Произошла ошибка при загрузке файла.');
        handleUploadError(xhr.status, 'Error during file upload');
        setIsUploading(false);
        xhrRef.current = null; // Очищаем ссылку
      };

      xhr.send(file); // Загружаем файл
    } catch (error) {
      console.error('Error uploading file:', error);
      // Используем новую функцию обработки ошибок инициализации
      handleInitError(error);
    }
  };

  // Отмена текущей загрузки
  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort(); // Прерываем загрузку
      xhrRef.current = null;
      setIsUploading(false);
      setShowProgressBar(false);
      setProgress(0);
      setUploadError(true);
      setErrorMessage('Загрузка была отменена.');
    }
  };

  // Функция для получения понятного сообщения об ошибке на основе HTTP-статуса
  const getErrorMessage = (status) => {
    switch (status) {
      case 400: return 'Ошибка в запросе. Неверные данные.';
      case 401: return 'Необходима авторизация. Пожалуйста, войдите в систему.';
      case 403: return 'Доступ запрещён. У вас нет прав для выполнения этой операции.';
      case 404: return 'Ресурс не найден. Файл не может быть загружен.';
      case 413: return 'Файл слишком большой для загрузки.';
      case 500: return 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.';
      case 502: return 'Сервер временно недоступен. Пожалуйста, попробуйте позже.';
      case 503: return 'Сервис недоступен. Пожалуйста, попробуйте позже.';
      case 504: return 'Превышено время ожидания ответа от сервера. Пожалуйста, попробуйте позже.';
      default: return `Ошибка загрузки (${status}). Пожалуйста, попробуйте снова.`;
    }
  };

  // Функция обработки ошибок загрузки с плавным скрытием прогресс-бара
  const handleUploadError = (status, message) => {
    // Если прогресс-бар показан, плавно скрываем его
    if (showProgressBar) {
      // Показываем ошибку в прогресс-баре с задержкой
      setTimeout(() => {
        setShowProgressBar(false);
      }, 300);
    }
    
    // Если ошибка 401 - перенаправляем на страницу логина
    if (status === 401) {
      redirectToLogin();
    }
  };

  // Обработка ошибок при инициализации загрузки
  const handleInitError = (error) => {
    setIsUploading(false);
    setUploadError(true);
    
    // Определяем тип ошибки и устанавливаем соответствующее сообщение
    if (error.status) {
      setErrorMessage(getErrorMessage(error.status));
    } else if (error.message) {
      setErrorMessage(error.message.includes('Authentication token') ? 
        'Ошибка авторизации. Пожалуйста, войдите в систему повторно.' : 
        'Не удалось начать загрузку файла.');
    } else {
      setErrorMessage('Не удалось начать загрузку файла.');
    }
    
    // Если прогресс-бар показан, плавно скрываем его
    if (showProgressBar) {
      setTimeout(() => {
        setShowProgressBar(false);
      }, 300);
    }
    
    // Если ошибка связана с авторизацией - перенаправляем на логин
    if (error.message && error.message.includes('Authentication token')) {
      redirectToLogin();
    }
  };

  // Функция перенаправления на страницу логина
  const redirectToLogin = () => {
    // Сохраняем текущий URL для возврата после авторизации
    sessionStorage.setItem('returnUrl', window.location.pathname);
    // Перенаправляем на страницу логина
    window.location.pathname = '/login';
  };

  // Обработчик запроса на удаление - показывает диалог подтверждения
  const handleRemoveRequest = () => {
    setConfirmOpen(true);
  };

  // Подтверждение удаления
  const confirmRemove = () => {
    setConfirmOpen(false);
    onRemove();
  };

  // Отмена удаления
  const cancelRemove = () => {
    setConfirmOpen(false);
  };

  // Обработчик запроса на отмену загрузки - показывает диалог подтверждения
  const handleCancelRequest = () => {
    setCancelConfirmOpen(true);
  };

  // Подтверждение отмены загрузки
  const confirmCancel = () => {
    setCancelConfirmOpen(false);
    cancelUpload(); // Вызываем функцию отмены загрузки
  };

  // Отмена отмены загрузки (продолжить загрузку)
  const cancelCancelRequest = () => {
    setCancelConfirmOpen(false);
  };

  const onRemove = () => {
    setFieldValue('files', null); // Удаляем файл
    onChange?.([]); // Обновляем состояние родителя
    setProgress(0); // Сбрасываем прогресс
    lastProgressRef.current = 0; // Сбрасываем последний прогресс
    setShowProgressBar(false); // Скрываем прогресс-бар
    setUploadSuccess(false); // Сбрасываем флаг успеха
    setUploadError(false); // Сбрасываем флаг ошибки
    setFileUploaded(false); // Сбрасываем флаг успешной загрузки
    
    // Отменяем текущую загрузку, если она идет
    if (isUploading && xhrRef.current) {
      cancelUpload();
    }
  };

  return (
    <>
      <Box
        sx={{
          width: '100%',
          ...sx
        }}
      >
        {!files || files.length === 0 ? (
          <Stack alignItems="center">
            <DropzoneWrapper
              {...getRootProps()}
              sx={{
                ...(isDragActive && { opacity: 0.72 }),
                ...((isDragReject || error) && {
                  color: 'error.main',
                  borderColor: 'error.light',
                  bgcolor: 'error.lighter'
                })
              }}
            >
              <input {...getInputProps()} />
              <PlaceholderContent />
            </DropzoneWrapper>
          </Stack>
        ) : (
          <FilesPreview files={files} onRemove={handleRemoveRequest} hideRemoveButton={isUploading} />
        )}

        {fileRejections.length > 0 && <RejectionFiles fileRejections={fileRejections} />}
      </Box>

      {/* Диалог подтверждения удаления файла */}
      <Dialog
        open={confirmOpen}
        onClose={cancelRemove}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Вы уверены, что хотите удалить этот объект?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelRemove} color="primary">
            Нет
          </Button>
          <Button onClick={confirmRemove} color="error" autoFocus>
            Да
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения отмены загрузки */}
      <Dialog
        open={cancelConfirmOpen}
        onClose={cancelCancelRequest}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">
          Подтверждение отмены загрузки
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Вы действительно хотите отменить загрузку объекта?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelCancelRequest} color="primary">
            Нет
          </Button>
          <Button onClick={confirmCancel} color="error" autoFocus>
            Да
          </Button>
        </DialogActions>
      </Dialog>

      {files && files.length > 0 && (
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
            {/* Показываем кнопку "Удалить" только если файл не загружен успешно */}
            {!fileUploaded && (
              <Button 
                color="error" 
                size="small" 
                onClick={isUploading ? handleCancelRequest : handleRemoveRequest} 
                disabled={isUploading && !xhrRef.current}
                variant="outlined"
                startIcon={isUploading ? <CloseCircleOutlined /> : null}
                sx={{
                  '&:hover': {
                    bgcolor: 'error.lighter',
                    color: 'error.dark'
                  },
                  transition: 'all 0.2s',
                  minWidth: '130px'
                }}
              >
                {isUploading ? 'Отменить' : 'Удалить'}
              </Button>
            )}
            {/* Показываем кнопку "Загрузить файл" только если файл не загружен успешно */}
            {!fileUploaded && (
              <Button 
                size="small" 
                variant="contained" 
                onClick={uploadFile} 
                disabled={isUploading}
                color="primary"
                sx={{ 
                  minWidth: '130px',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.2)'
                  },
                  transition: 'all 0.2s' 
                }}
              >
                {isUploading ? 'Загрузка...' : 'Загрузить файл'}
              </Button>
            )}
          </Stack>

          {/* Показываем прогресс-бар только если нет ошибок */}
          {showProgressBar && (
            <Box>
              <AnimatedLinearWithLabel variant="determinate" value={progress} error={uploadError} />
            </Box>
          )}
          
          {/* Показываем сообщение об успехе только если нет ошибок */}
          {uploadSuccess && !uploadError && (
            <SuccessMessage>
              <CheckCircleOutlined style={{ marginRight: 8 }} />
              <Typography variant="subtitle2">Файл успешно загружен</Typography>
            </SuccessMessage>
          )}
          
          {/* Показываем сообщение об ошибке */}
          {uploadError && (
            <ErrorMessage>
              <CloseCircleOutlined style={{ marginRight: 8 }} />
              <Typography variant="subtitle2">{errorMessage}</Typography>
            </ErrorMessage>
          )}
        </Stack>
      )}
    </>
  );
}