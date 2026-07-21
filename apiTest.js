

import { check } from 'k6';
import http from 'k6/http';

export const options = {
  vus: 1000,
  duration: '1m',
};

export default function () {
  const res = http.get('http://nayeem-miah.vercel.app/');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'success is true': (r) => r.json().success === true,
    'message is correct': (r) =>
      r.json().message === 'Welcome to TalkNative API',
  });
}
