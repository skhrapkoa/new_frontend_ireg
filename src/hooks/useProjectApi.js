import { useState, useEffect, useCallback } from 'react';
import useProject from './useProject';
import { projectFetch, getProjectUrl } from 'utils/project-api';
import axios from 'utils/axios';

/**
 * Hook for working with project-specific API endpoints
 * @returns {Object} Utility functions for working with project APIs
 */
const useProjectApi = () => {
  const { projectId, loading } = useProject();
  const [error, setError] = useState(null);

  /**
   * Get a URL with project ID included
   * @param {string} endpoint - API endpoint
   * @returns {string} - URL with project ID
   */
  const getUrl = useCallback((endpoint) => {
    return getProjectUrl(endpoint, projectId);
  }, [projectId]);

  /**
   * Fetch data using project-specific URL
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise} - Fetch response
   */
  const fetchData = useCallback(async (endpoint, options = {}) => {
    try {
      // Используем projectFetch, который автоматически добавляет токен и projectId
      const response = await projectFetch(endpoint, options, projectId);
      
      if (!response.ok) {
        // Создаем объект ошибки с доп. информацией
        const error = new Error(`API error: ${response.status}`);
        error.status = response.status;
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in fetchData:', error);
      setError(error.message);
      throw error;
    }
  }, [projectId]);

  /**
   * Get data using axios with project-specific URL
   * @param {string} endpoint - API endpoint
   * @param {Object} config - Axios config
   * @returns {Promise} - Axios response
   */
  const getData = useCallback(async (endpoint, config = {}) => {
    try {
      // axios will automatically add project ID via interceptor
      const response = await axios.get(endpoint, config);
      return response.data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  /**
   * Post data using axios with project-specific URL
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to post
   * @param {Object} config - Axios config
   * @returns {Promise} - Axios response
   */
  const postData = useCallback(async (endpoint, data, config = {}) => {
    try {
      // axios will automatically add project ID via interceptor
      const response = await axios.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  return {
    loading,
    error,
    projectId,
    getUrl,
    fetchData,
    getData,
    postData
  };
};

export default useProjectApi; 