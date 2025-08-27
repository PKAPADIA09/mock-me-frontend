import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment configuration interface
interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  BCRYPT_ROUNDS: number;
  TTS_PROVIDER?: 'elevenlabs' | 'piper';
  PIPER_URL?: string;
  PIPER_MODE?: 'server' | 'binary';
  PIPER_BINARY_PATH?: string;
  PIPER_MODEL_PATH?: string;
}

// Validate and export environment variables
const getEnvironmentConfig = (): EnvironmentConfig => {
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
  
  // Check if required environment variables are present
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    TTS_PROVIDER: (process.env.TTS_PROVIDER as 'elevenlabs' | 'piper') || 'piper',
    PIPER_URL: process.env.PIPER_URL || 'http://localhost:59125',
    PIPER_MODE: (process.env.PIPER_MODE as 'server' | 'binary') || 'binary',
    PIPER_BINARY_PATH: process.env.PIPER_BINARY_PATH, // e.g., /usr/local/bin/piper or ./piper
    PIPER_MODEL_PATH: process.env.PIPER_MODEL_PATH,   // e.g., /path/to/en_US-amy-medium.onnx
  };
};

// Export the configuration
export const env = getEnvironmentConfig();

// Environment helpers
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';