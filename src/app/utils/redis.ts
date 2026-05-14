import { createClient } from 'redis';
import config from '../config';

const redisClient = createClient({
  password: config.redis.password,
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('✅ Redis connected successfully');
  }
};

export const RedisHelper = {
  client: redisClient,
  connectRedis,
};
