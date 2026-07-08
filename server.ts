import dotenv from 'dotenv';
// Load environment variables immediately
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { connectDB } from './backend/config/db.ts';
import authRouter from './backend/routes/auth.ts';
import programsRouter from './backend/routes/programs.ts';
import applicationsRouter from './backend/routes/applications.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000; // MUST bind strictly to port 3000 for AI Studio containment proxy

  // Connect to MongoDB
  await connectDB();

  // Basic parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Route mountings
  app.use('/api/auth', authRouter);
  app.use('/api/programs', programsRouter);
  app.use('/api/applications', applicationsRouter);

  // Serve static assets or mount Vite middleware depending on node environment
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running server in DEVELOPMENT mode with Vite Middleware...');
    
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    app.use(vite.middlewares);
  } else {
    console.log('Running server in PRODUCTION mode...');
    const distPath = path.join(process.cwd(), 'dist');
    
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`University Admission Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Critical Server Boot Error:', err);
});
