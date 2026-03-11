import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://dugout.cloud',
  withCredentials: true,
});
