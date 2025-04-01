import { useState, useEffect } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import Slide from '@mui/material/Slide';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import EmptyUserCard from 'components/cards/skeleton/EmptyUserCard';
import { DebouncedInput } from 'components/third-party/react-table';
import CustomerCard from 'sections/apps/customer/CustomerCard';
import CustomerModal from 'sections/apps/customer/CustomerModal';

import usePagination from 'hooks/usePagination';
import { useGetCustomer } from 'api/customer';

// assets
import PlusOutlined from '@ant-design/icons/PlusOutlined';

// ==============================|| CUSTOMER - CARD ||============================== //

const allColumns = [
  { id: 1, header: 'Default' },
  { id: 2, header: 'Customer Name' },
  { id: 3, header: 'Email' },
  { id: 4, header: 'Contact' },
  { id: 5, header: 'Age' },
  { id: 6, header: 'Country' },
  { id: 7, header: 'Status' }
];

export default function CustomerCardPage() {
  const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const { documents: lists } = useGetCustomer();
  const [sortBy, setSortBy] = useState('Default');
  const [globalFilter, setGlobalFilter] = useState('');
  const [userCard, setUserCard] = useState([]);
  const [page, setPage] = useState(1);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [customerModal, setCustomerModal] = useState(false);

  const handleChange = (event) => {
    setSortBy(event.target.value);
  };

  useEffect(() => {
    setCustomerLoading(true); // Устанавливаем загрузку в true перед запросом данных
    const timer = setTimeout(() => {
      if (lists) {
        setUserCard(lists);
      } else {
        setUserCard([]);
      }
      setCustomerLoading(false); // Сбрасываем загрузку после получения данных
    }, 500); // Добавляем небольшую задержку для плавного отображения загрузки

    return () => clearTimeout(timer); // Очистка таймера при размонтировании
  }, [globalFilter, lists, sortBy]);

  const PER_PAGE = 6;

  const count = Math.ceil(userCard.length / PER_PAGE);
  const _DATA = usePagination(userCard, PER_PAGE);

  const handleChangePage = (e, p) => {
    setPage(p);
    _DATA.jump(p);
  };

  return (
    <>
      {/* Показ загрузки */}
      {customerLoading ? (
        <EmptyUserCard title="Loading..." />
      ) : (
        <>
          {/* Отображаем элементы управления только если есть документы */}
          {userCard.length > 0 && (
            <Box sx={{ position: 'relative', marginBottom: 3 }}>
              <Stack direction="row" alignItems="center">
                <Stack
                  direction={matchDownSM ? 'column' : 'row'}
                  sx={{ width: '100%' }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <DebouncedInput
                    value={globalFilter ?? ''}
                    onFilterChange={(value) => setGlobalFilter(String(value))}
                    placeholder={`Search ${userCard.length} records...`}
                  />
                  <Stack direction={matchDownSM ? 'column' : 'row'} alignItems="center" spacing={1}>
                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                      <Select
                        value={sortBy}
                        onChange={handleChange}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                        renderValue={(selected) => {
                          if (!selected) {
                            return <Typography variant="subtitle1">Sort By</Typography>;
                          }
                          return <Typography variant="subtitle2">Sort by ({sortBy})</Typography>;
                        }}
                      >
                        {allColumns.map((column) => (
                          <MenuItem key={column.id} value={column.header}>
                            {column.header}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setCustomerModal(true)}>
                       Регистрация объекта
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </Box>
          )}

          {/* Основной контент */}
          <Grid container spacing={3}>
            {userCard.length > 0 ? (
              _DATA.currentData().map((user, index) => (
                <Slide key={index} direction="up" in={true} timeout={50}>
                  <Grid item xs={12} sm={6} lg={4}>
                    <CustomerCard document={user} />
                  </Grid>
                </Slide>
              ))
            ) : (
              <Grid
                item
                xs={12}
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                sx={{ py: 6 }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Список документов пуст
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Начните с добавления первого документа.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PlusOutlined />}
                  onClick={() => setCustomerModal(true)}
                  sx={{ mt: 2 }}
                >
                  Добавить документ
                </Button>
              </Grid>
            )}
          </Grid>

          {/* Пагинация - только если есть документы */}
          {userCard.length > 0 && (
            <Stack spacing={2} sx={{ p: 2.5 }} alignItems="flex-end">
              <Pagination
                sx={{ '& .MuiPaginationItem-root': { my: 0.5 } }}
                count={count}
                size="medium"
                page={page}
                showFirstButton
                showLastButton
                variant="combined"
                color="primary"
                onChange={handleChangePage}
              />
            </Stack>
          )}
        </>
      )}

      <CustomerModal open={customerModal} modalToggler={setCustomerModal} />
    </>
  );
}
