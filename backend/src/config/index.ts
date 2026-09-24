import { Injectable } from '../common';

@Injectable()
export class ConfigService {
  readonly port: number = parseInt(process.env.PORT || '4000', 10);
  readonly nodeEnv: string = process.env.NODE_ENV || 'development';
  readonly databaseUrl: string = process.env.DATABASE_URL || '';
  readonly redisUrl: string = process.env.REDIS_URL || 'redis://localhost:6379';
  readonly jwtSecret: string = process.env.JWT_SECRET || '';
  readonly chatbotApiUrl: string = process.env.CHATBOT_API_URL || 'http://127.0.0.1:5000/api';

  get(key: string, defaultValue: string = ''): string {
    return process.env[key] || defaultValue;
  }
}
