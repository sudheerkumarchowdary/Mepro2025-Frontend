// API Configuration
// Change this to 'local' to use localhost, or 'production' to use deployed server
const API_MODE = process.env.REACT_APP_API_MODE || 'production';

const API_BASE_URL = 
  API_MODE === 'local' 
    ? 'http://localhost:5000' 
    : 'https://meprobackend-efe3e2d4gucvcddy.eastus2-01.azurewebsites.net/';

export default API_BASE_URL;

