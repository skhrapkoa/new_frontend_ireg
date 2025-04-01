import PropTypes from 'prop-types';
// material-ui
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CardMedia from '@mui/material/CardMedia';

// project-import
import { DropzopType } from 'config';

// assets
import UploadCover from 'assets/images/upload/upload.svg';
import CameraOutlined from '@ant-design/icons/CameraOutlined';

// ==============================|| UPLOAD - PLACEHOLDER ||============================== //

export default function PlaceholderContent({ type }) {
  return (
    <>
      {type !== DropzopType.STANDARD && (
        <Stack
          spacing={2}
          alignItems="center"
          justifyContent="center"
          direction={{ xs: 'column', md: 'row' }}
          sx={{ width: 1, textAlign: { xs: 'center', md: 'left' } }}
        >
          <CardMedia component="img" image={UploadCover} sx={{ width: 150 }} />
          <Stack sx={{ p: 3 }} spacing={1}>
          <Typography variant="h5">Перетащите файл или выберите из проводника</Typography>


            <Typography color="secondary">
            Перетащите файл сюда или нажмите&nbsp;
              <Typography component="span" color="primary" sx={{ textDecoration: 'underline' }}>
              выбрать
              </Typography>
              &nbsp;чтобы найти на вашем компьютере
            </Typography>
          </Stack>
        </Stack>
      )}
      {type === DropzopType.STANDARD && (
        <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
                    <CloudUploadOutlined style={{ fontSize: '64px', color: '#3f51b5' }} />
          <Typography variant="body1" color="primary" sx={{ mt: 1 }}>
            Нажмите для загрузки файла
          </Typography>
        </Stack>
      )}
    </>
  );
}

PlaceholderContent.propTypes = { type: PropTypes.any };
