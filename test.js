/* eslint-disable no-undef */
/* eslint-disable no-console */
import http from 'k6/http';

export const options = {
  vus: 2000,
  duration: '30m',
};

export default function () {
  const res = http.get('https://nayeem-miah.vercel.app/');

  console.log('Status:', res.status);
}
