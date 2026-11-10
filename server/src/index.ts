import app from './app.js';
import { connectDb } from './db.js';
import { env } from './env.js';

async function main() {
  await connectDb();
  console.log('MongoDB connected');

  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
