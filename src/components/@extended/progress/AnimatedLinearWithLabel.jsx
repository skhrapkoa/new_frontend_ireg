import PropTypes from 'prop-types';
import { keyframes } from '@emotion/react';
import { useState, useEffect } from 'react';

// material-ui
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

// Анимация пульсации для индикатора
const pulseAnimation = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
`;

// Анимация движущегося градиента
const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Анимация "бегущей полосы" для состояния загрузки
const indeterminateAnimation = keyframes`
  0% {
    transform: translateX(-100%) scaleX(0.4);
  }
  50% {
    transform: translateX(0%) scaleX(0.4);
  }
  100% {
    transform: translateX(100%) scaleX(0.4);
  }
`;

// Стилизованный компонент для индетерминированной загрузки (0%)
const IndeterminateProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 5,
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
  '.MuiLinearProgress-bar': {
    borderRadius: 5,
    backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    backgroundSize: '200% 200%',
    animation: `${pulseAnimation} 1.5s ease-in-out infinite, ${gradientAnimation} 2s linear infinite`
  }
}));

// Стилизованный компонент LinearProgress
const StyledLinearProgress = styled(LinearProgress)(({ theme, value }) => ({
  height: 8,
  borderRadius: 5,
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: 5,
    backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    backgroundSize: '200% 200%',
    animation: `${pulseAnimation} 2s ease-in-out infinite, ${gradientAnimation} 3s linear infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `linear-gradient(90deg, transparent, ${theme.palette.background.paper}20, transparent)`,
    animation: value === 100 ? 'none' : `${indeterminateAnimation} 1.8s infinite ease-in-out`,
    borderRadius: 5,
    pointerEvents: 'none',
  }
}));

// ==============================|| ANIMATED PROGRESS - LINEAR WITH LABEL ||============================== //

export default function AnimatedLinearWithLabel({ value, ...others }) {
  const [isStarting, setIsStarting] = useState(value === 0);

  // Если значение прогресса изменилось с 0 на что-то еще,
  // переключаемся с индетерминированного на детерминированный режим
  useEffect(() => {
    if (value > 0 && isStarting) {
      setIsStarting(false);
    }
  }, [value, isStarting]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1, position: 'relative' }}>
        {isStarting ? (
          // Индетерминированная загрузка для 0%
          <IndeterminateProgress variant="indeterminate" {...others} />
        ) : (
          // Обычный прогресс-бар для значений > 0%
          <StyledLinearProgress variant="determinate" value={value} {...others} />
        )}
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            animation: `${pulseAnimation} 2s ease-in-out infinite`,
            fontWeight: 500
          }}
        >
          {isStarting ? 'Подготовка...' : `${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

AnimatedLinearWithLabel.propTypes = {
  value: PropTypes.number.isRequired
}; 