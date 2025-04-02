import axios from './axios';

/**
 * Utility function to create project-specific API URLs
 * @param {string} endpoint - The API endpoint
 * @param {number|string|null} projectId - The project ID
 * @returns {string} - The project-specific URL
 */
export const getProjectUrl = (endpoint, projectId) => {
  if (!projectId) return endpoint;
  
  // Replace /project/ with /project/{projectId}/
  if (endpoint.includes('/project/')) {
    return endpoint.replace('/project/', `/project/${projectId}/`);
  }
  
  return endpoint;
};

/**
 * Get project data with automatic project ID inclusion
 * @param {string} endpoint - The API endpoint
 * @param {number|string|null} projectId - The project ID (optional, will use from context if available)
 * @param {Object} config - Axios request config
 * @returns {Promise} - The API response
 */
export const getProjectData = async (endpoint, projectId = null, config = {}) => {
  // The projectId parameter is optional and can be passed directly or fetched from localStorage
  if (!projectId) {
    // Try to get project_id from localStorage or sessionStorage if not provided
    try {
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        projectId = userData.project_id;
      }
    } catch (error) {
      console.error('Error retrieving project ID from storage:', error);
    }
  }

  const url = getProjectUrl(endpoint, projectId);
  return axios.get(url, config);
};

/**
 * Post data to project endpoint with automatic project ID inclusion
 * @param {string} endpoint - The API endpoint
 * @param {Object} data - The data to post
 * @param {number|string|null} projectId - The project ID (optional)
 * @param {Object} config - Axios request config
 * @returns {Promise} - The API response
 */
export const postProjectData = async (endpoint, data, projectId = null, config = {}) => {
  // The projectId parameter is optional and can be passed directly or fetched from localStorage
  if (!projectId) {
    // Try to get project_id from localStorage or sessionStorage if not provided
    try {
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        projectId = userData.project_id;
      }
    } catch (error) {
      console.error('Error retrieving project ID from storage:', error);
    }
  }

  const url = getProjectUrl(endpoint, projectId);
  return axios.post(url, data, config);
};

/**
 * Create a custom fetch function that includes the project ID in the URL
 * @param {string} endpoint - The API endpoint
 * @param {Object} options - Fetch options
 * @param {number|string|null} projectId - The project ID (optional)
 * @returns {Promise} - The fetch response
 */
export const projectFetch = async (endpoint, options = {}, projectId = null) => {
  // Базовый URL для API
  const BASE_URL = 'http://127.0.0.1:8000';
  
  // Получаем токен авторизации
  const accessToken = localStorage.getItem('serviceToken');
  
  // Настраиваем заголовки с авторизацией
  const headers = {
    ...options.headers || {},
  };
  
  // Добавляем токен авторизации, если он есть
  if (accessToken) {
    headers['Authorization'] = `JWT ${accessToken}`;
  }
  
  // Обновляем options с новыми заголовками
  const updatedOptions = {
    ...options,
    headers
  };
  
  // The projectId parameter is optional and can be passed directly or fetched from localStorage
  if (!projectId) {
    // Try to get project_id from localStorage or sessionStorage if not provided
    try {
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        projectId = userData.project_id;
      } else {
        // If no userData in localStorage, try to get it from the user object in localStorage
        const accessToken = localStorage.getItem('serviceToken');
        if (accessToken) {
          // Make a request to get the user data if we have a token
          try {
            const response = await fetch(`${BASE_URL}/api/v1/users/me/`, {
              headers: {
                'Authorization': `JWT ${accessToken}`
              }
            });
            if (response.ok) {
              const userData = await response.json();
              projectId = userData.project_id;
              
              // Save to localStorage for future use
              localStorage.setItem('userData', JSON.stringify(userData));
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error retrieving project ID from storage:', error);
    }
  }

  const url = getProjectUrl(endpoint, projectId);
  
  // Добавляем базовый URL, если endpoint не является абсолютным URL
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  
  // Используем обновленные опции с заголовками авторизации
  return fetch(fullUrl, updatedOptions);
};

export default {
  getProjectUrl,
  getProjectData,
  postProjectData,
  projectFetch
}; 