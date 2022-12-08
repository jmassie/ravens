// In the production server, we use 'real' axios.
import axios from 'axios';

// Import the micro-app.
import application from './application';

// Start the micro-app and log any errors.
application({
  pathPrefix: '/ravens',
  axios,
  apiEndpoint: process.env.SFO_API_URL ?? 'http://localhost:3020/ravens-api/v1',
  hostPrefix: process.env.SFOR_HOST_PREFIX ?? 'http://localhost:3020',
}).catch((error) => {
  console.log(error);
  throw error;
});
