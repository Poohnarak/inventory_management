const app = require('./app');
const config = require('./config/env');
const { systemPrisma, disconnectAll } = require('./config/db');

async function main() {
  try {
    await systemPrisma.$connect();
    console.log('System database connected successfully');

    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectAll();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectAll();
  process.exit(0);
});

main();
