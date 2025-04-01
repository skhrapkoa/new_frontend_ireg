import React, { createContext, useEffect, useReducer } from 'react';

// third-party
import { Chance } from 'chance';
import { jwtDecode } from 'jwt-decode';

// reducer - state management
import { LOGIN, LOGOUT } from 'contexts/auth-reducer/actions';
import authReducer from 'contexts/auth-reducer/auth';

// project import
import Loader from 'components/Loader';
import axios from 'utils/axios';

const chance = new Chance();

// constant
const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

const verifyToken = (serviceToken) => {
  if (!serviceToken) {
    return false;
  }
  const decoded = jwtDecode(serviceToken);
  console.log(decoded)
  console.log("decoded")
  /**
   * Property 'exp' does not exist on type '<T = unknown>(token: string, options?: JwtDecodeOptions | undefined) => T'.
   */
  return decoded.exp > Date.now() / 1000;
};

const setSession = (serviceToken) => {
  console.log('serviceToken')
  console.log(serviceToken)
  if (serviceToken) {
    localStorage.setItem('serviceToken', serviceToken);
    axios.defaults.headers.common.Authorization = `JWT ${serviceToken}`;
  } else {
    localStorage.removeItem('serviceToken');
    delete axios.defaults.headers.common.Authorization;
  }
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext(null);

export const JWTProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    console.log('123')
    const init = async () => {
      try {
        const serviceToken = window.localStorage.getItem('serviceToken');
        if (serviceToken && verifyToken(serviceToken)) {
          setSession(serviceToken);
              // Шаг 2: Получение информации о пользователе
          const userResponse = await axios.get('/api/v1/users/me/');
          console.log(userResponse.data);

          const user = userResponse.data;

          //
          // const response = await axios.get('/api/v1/users/me/');
          // const { user } = response.data;
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user
            }
          });
        } else {
          dispatch({
            type: LOGOUT
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: LOGOUT
        });
      }
    };

    init();
  }, []);

const login = async (email, password) => {
  try {
    console.log('Login');
    // Шаг 1: Получение токена
    const response = await axios.post('/api/v1/auth/jwt/create/', { email, password });
    console.log(response.data);

    const { access: serviceToken } = response.data;

    // Установка токена в сессии (включает добавление токена в заголовки)
    setSession(serviceToken);

    // Шаг 2: Получение информации о пользователе
    const userResponse = await axios.get('/api/v1/users/me/');
    console.log(userResponse.data);

    const user = userResponse.data;

    // Обновление состояния
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    // Обработка ошибок
    dispatch({
      type: LOGIN_ERROR,
      payload: {
        isLoggedIn: false,
        error: error.message,
      },
    });
  }
};


  const register = async (email, password) => {
    // todo: this flow need to be recode as it not verified
    const response = await axios.post('api/v1/users/', {
      email,
      password
    });
    if (response.status === 201) {
        sessionStorage.setItem('send_code_verification_email', email);
        window.location.href = `/code-verification`;
    }

  };

  const logout = () => {
    setSession(null);
    dispatch({ type: LOGOUT });
  };

  const resetPassword = async (email) => {
    console.log('email - ', email);
  };

  const updateProfile = () => {};

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return <JWTContext.Provider value={{ ...state, login, logout, register, resetPassword, updateProfile }}>{children}</JWTContext.Provider>;
};

export default JWTContext;
