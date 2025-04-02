import axios from 'axios';

/**
 * axios setup
 */
const axiosServices = axios.create({ baseURL: 'http://127.0.0.1:8000' });

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.request.use(
  async (config) => {
    // Add authorization header
    const accessToken = localStorage.getItem('serviceToken');
    if (accessToken) {
      config.headers['Authorization'] = `JWT ${accessToken}`;
    }

    // Get project_id from localStorage if available
    try {
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const projectId = userData.project_id;
        
        // Check if URL contains '/project/' and inject project_id
        if (projectId && config.url && config.url.includes('/project/')) {
          // Replace generic project path with project-specific path
          config.url = config.url.replace('/project/', `/project/${projectId}/`);
        }
      }
    } catch (error) {
      console.error('Error processing project ID for request:', error);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// interceptor for response
axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && !window.location.href.includes('/login')) {
      sessionStorage.setItem('returnUrl', window.location.pathname);
      window.location.replace('/login');
    }
    return Promise.reject((error.response && error.response.data) || 'Wrong Services');
  }
);

export default axiosServices;

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.get(url, { ...config });

  return res.data;
};

export const fetcherPost = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.post(url, { ...config });

  return res.data;
};
