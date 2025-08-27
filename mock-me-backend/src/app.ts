import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './shared/config/environment';
import { errorHandler, notFoundHandler } from './shared/middleware/error.middleware';
import { checkDatabaseHealth } from './shared/config/database';
import { userRouter } from './features/users/users.router';
import { authRouter } from './features/auth/auth.router';
import { interviewRouter } from './features/interview/interview.router';
import { voiceInterviewRouter } from './features/voiceInterview/voiceInterview.router';

// Create Express application
const app: Application = express();

// Security middleware
app.use(helmet({
  // Allow embedding cross-origin resources like audio files
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // Disable COEP to avoid blocking cross-origin media without CORP/CORS
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: env.NODE_ENV === 'development' 
    ? ['http://localhost:3000', 'http://localhost:3001'] 
    : process.env.FRONTEND_URL?.split(',') || [],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', (req: Request, res: Response, next) => {
  // Add proper headers for audio files
  if (req.path.endsWith('.mp3') || req.path.endsWith('.wav')) {
    res.setHeader('Content-Type', req.path.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache');
    // Explicitly allow cross-origin embedding for media assets
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
  next();
}, express.static('./uploads'));

// Request logging (simple console log for now)
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  const dbHealthy = await checkDatabaseHealth();
  
  res.status(dbHealthy ? 200 : 503).json({
    success: true,
    data: {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      database: dbHealthy ? 'connected' : 'disconnected'
    }
  });
});

// API routes base
app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Mock-Me API v1.0.0',
    data: {
      version: '1.0.0',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
  });
});


app.use('/api/v1/users', userRouter); 
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/interview', interviewRouter)
app.use('/api/v1/voice-interview', voiceInterviewRouter);

// Handle 404 routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;