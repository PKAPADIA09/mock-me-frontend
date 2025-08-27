import app from './app';
import { env } from './shared/config/environment';
import { connectDatabase, disconnectDatabase } from './shared/config/database';

// Start server function
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Start the server
    const server = app.listen(env.PORT, () => {
      console.log('🚀 Mock-Me Backend Server Started');
      console.log(`📍 Environment: ${env.NODE_ENV}`);
      console.log(`🌐 Server running on port: ${env.PORT}`);
      console.log(`🔗 Health check: http://localhost:${env.PORT}/health`);
      console.log(`🔗 API Base: http://localhost:${env.PORT}/api/v1`);
      console.log('-----------------------------------');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('✅ HTTP server closed');
        
        // Disconnect from database
        await disconnectDatabase();
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();