import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { PatternFormat } from 'react-number-format';
import { PDFDownloadLink } from '@react-pdf/renderer';

// project import
import CustomerModal from './CustomerModal';
import CustomerPreview from './CustomerPreview';
import AlertCustomerDelete from './AlertCustomerDelete';
import ListSmallCard from './exportpdf/ListSmallCard';
import { getImageUrl, ImagePath } from 'utils/getImageUrl';

import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';

// assets
import EnvironmentOutlined from '@ant-design/icons/EnvironmentOutlined';
import LinkOutlined from '@ant-design/icons/LinkOutlined';
import MailOutlined from '@ant-design/icons/MailOutlined';
import MoreOutlined from '@ant-design/icons/MoreOutlined';
import PhoneOutlined from '@ant-design/icons/PhoneOutlined';
import { FileIcon, defaultStyles } from 'react-file-icon';



// ==============================|| CUSTOMER - CARD ||============================== //

export default function CustomerCard({ document }) {
  console.log('CustomerCard 1111')
  console.log(document)
  const [open, setOpen] = useState(false);
  const [customerModal, setCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [openAlert, setOpenAlert] = useState(false);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    handleMenuClose();
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const editCustomer = () => {
    setSelectedCustomer(document);
    setCustomerModal(true);
  };

  const getFileExtension = (fileName) => {
  if (!fileName) return ''; // Возвращаем пустую строку, если fileName отсутствует
  return fileName.split('.').pop(); // Получение расширения файла
};


  return (
    <>
      <MainCard sx={{ height: 1, '& .MuiCardContent-root': { height: 1, display: 'flex', flexDirection: 'column' } }}>
        <Grid id="print" container spacing={2.25}>
          <Grid item xs={12}>
            <List sx={{ width: 1, p: 0 }}>
              <ListItem
                disablePadding
                secondaryAction={
                  <IconButton edge="end" aria-label="comments" color="secondary" onClick={handleMenuClick}>
                    <MoreOutlined style={{ fontSize: '1.15rem' }} />
                  </IconButton>
                }
              >
 <ListItemAvatar>
<div style={{ width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
<FileIcon
  extension={getFileExtension(document?.name)}
  {...defaultStyles[getFileExtension(document?.name)]}
/>
</div>

                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="subtitle1">{document.name}</Typography>}
secondary={
    <Chip
      label={document.is_signed ? "Защищен" : "На рассмотрении"}
      color={document.is_signed ? "success" : "info"}
      size="small"
      variant="light"
    />
  }
                />
              </ListItem>
            </List>
            <Menu
              id="fade-menu"
              MenuListProps={{
                'aria-labelledby': 'fade-button'
              }}
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              TransitionComponent={Fade}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
            >
              <MenuItem sx={{ a: { textDecoration: 'none', color: 'inherit' } }}>
                <PDFDownloadLink document={<ListSmallCard document={document} />} fileName={`Customer-${document.name}.pdf`}>
                  Export PDF
                </PDFDownloadLink>
              </MenuItem>
              <MenuItem onClick={editCustomer}>Edit</MenuItem>
              <MenuItem onClick={handleAlertClose}>Delete</MenuItem>
            </Menu>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Typography>Hello, {document.about}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <List sx={{ p: 0, overflow: 'hidden', '& .MuiListItem-root': { px: 0, py: 0.5 } }}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <MailOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary={document.email}
                      primaryTypographyProps={{ color: 'secondary', width: 'auto', sx: { overflow: 'hidden', textOverflow: 'ellipsis' } }}
                    />
                  </ListItem>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <PhoneOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography color="secondary">
                          <PatternFormat displayType="text" format="+1 (###) ###-####" mask="_" defaultValue={document.contact} />
                        </Typography>
                      }
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={6}>
                <List sx={{ p: 0, overflow: 'hidden', '& .MuiListItem-root': { px: 0, py: 0.5 } }}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <EnvironmentOutlined />
                    </ListItemIcon>
                    <ListItemText primary={<Typography color="secondary">{document.country}</Typography>} />
                  </ListItem>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <LinkOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Link href="https://google.com" target="_blank" sx={{ textTransform: 'lowercase' }}>
                          https://{document.firstName}.en
                        </Link>
                      }
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Box>
              {/*<Box*/}
              {/*  sx={{*/}
              {/*    display: 'flex',*/}
              {/*    flexWrap: 'wrap',*/}
              {/*    listStyle: 'none',*/}
              {/*    p: 0.5,*/}
              {/*    m: 0*/}
              {/*  }}*/}
              {/*  component="ul"*/}
              {/*>*/}
              {/*  {customer.skills.map((skill, index) => (*/}
              {/*    <ListItem disablePadding key={index} sx={{ width: 'auto', pr: 0.75, pb: 0.75 }}>*/}
              {/*      <Chip color="secondary" variant="outlined" size="small" label={skill} />*/}
              {/*    </ListItem>*/}
              {/*  ))}*/}
              {/*</Box>*/}
            </Box>
          </Grid>
        </Grid>
        <Stack
          direction="row"
          className="hideforPDf"
          alignItems="center"
          spacing={1}
          justifyContent="space-between"
          sx={{ mt: 'auto', mb: 0, pt: 2.25 }}
        >
          <Typography variant="caption" color="secondary">
            Updated in {document.time}
          </Typography>
          <Button variant="outlined" size="small" onClick={handleClickOpen}>
            Preview
          </Button>
        </Stack>
      </MainCard>

      <CustomerPreview document={document} open={open} onClose={handleClose} editCustomer={editCustomer} />
      <AlertCustomerDelete id={document.id} title={document.name} open={openAlert} handleClose={handleAlertClose} />
      <CustomerModal open={customerModal} modalToggler={setCustomerModal} document={selectedCustomer} />
    </>
  );
}

CustomerCard.propTypes = { document: PropTypes.any };
