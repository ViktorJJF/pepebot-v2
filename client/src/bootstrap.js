import axios from 'axios'

window.axios = axios;
window.axios.defaults.timeout = 10000;

// const app = axios.create({
//     credentials: true
// });

/* 
  The below is required if you want your API to return 
  server message errors. Otherwise, you'll just get 
  generic status errors.
  If you use the interceptor below, then make sure you 
  return an err message from your express route: 
  res.status(404).json({ err: "You are not authorized to do that." })
*/
// app.interceptors.response.use(
//     response => (response),
//     error => (Promise.reject(error.response.data.err))
// )

// export default app;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('auth_token');