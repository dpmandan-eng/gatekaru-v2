// This file acts as the default entry point for cloud hosting platforms like Hostinger.
// It imports and runs the compiled production Express server from dist/server.cjs.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bundledServerPath = path.join(__dirname, 'dist', 'server.cjs');

if (fs.existsSync(bundledServerPath)) {
  console.log('Starting production server from dist/server.cjs...');
  import('./dist/server.cjs');
} else {
  console.error('===============================================================');
  console.error('ERROR: dist/server.cjs not found!');
  console.error('Please run "npm run build" first to compile the application.');
  console.error('This compiles both the React frontend and the Express backend.');
  console.error('===============================================================');
  process.exit(1);
}
