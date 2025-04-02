import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'utils/axios';
import JWTContext from './JWTContext';

// Create context for project data
const ProjectContext = createContext({
  projectId: null,
  loading: true,
  error: null,
  getProjectUrl: () => {}
});

// Provider component
export const ProjectProvider = ({ children }) => {
  const [projectId, setProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn } = useContext(JWTContext);

  // Fetch project ID when user is logged in
  useEffect(() => {
    const fetchProjectId = async () => {
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get('/api/v1/users/me/');
        if (response.data && response.data.project_id) {
          setProjectId(response.data.project_id);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project ID:', err);
        setError('Failed to load project data');
        setLoading(false);
      }
    };

    fetchProjectId();
  }, [isLoggedIn]);

  // Helper function to generate project-specific URLs
  const getProjectUrl = (endpoint) => {
    if (!projectId) return endpoint;
    
    // Replace /project/ with /project/{projectId}/
    if (endpoint.includes('/project/')) {
      return endpoint.replace('/project/', `/project/${projectId}/`);
    }
    
    return endpoint;
  };

  return (
    <ProjectContext.Provider value={{ projectId, loading, error, getProjectUrl }}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext; 