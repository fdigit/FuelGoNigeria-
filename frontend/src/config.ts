// Runtime API URL detection - automatically works with any Vercel deployment
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use the same origin as the current page
    // This works with: your-app.vercel.app, project-git-branch.vercel.app, custom domains
    return `${window.location.origin}/api`;
  }
  // In development, use localhost
  return 'http://localhost:5000/api';
};

export const API_URL = getApiUrl(); 