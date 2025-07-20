import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fileUpload from 'express-fileupload';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import registrationRoutes from './routes/registrations.js';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import authenticateToken from './middleware/auth.js';
import './config/supabase.js';
import { gfs } from './config/gridfs.js';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
// hi
// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path
const result = dotenv.config({ path: path.join(__dirname, '.env') });

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1); // Exit if we can't load environment variables
}

// Debug logging for environment variables
console.log('Environment variables check:');
console.log('Current EMAIL_USER:', process.env.EMAIL_USER);
console.log('Current EMAIL_APP_PASSWORD exists:', !!process.env.EMAIL_APP_PASSWORD);
console.log('.env file path:', path.join(__dirname, '.env'));

if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
  console.error('Required environment variables are missing!');
  process.exit(1); // Exit if required environment variables are missing
}

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  createParentPath: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', authenticateToken, eventRoutes);
app.use('/api/registrations', authenticateToken, registrationRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/public', publicRoutes);

// Serve files from GridFS by id
app.get('/api/files/:id', async (req, res) => {
  try {
    if (!gfs) {
      return res.status(500).json({ error: 'GridFS not initialized' });
    }
    const fileId = new ObjectId(req.params.id);
    const files = await gfs.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.set('Content-Type', files[0].contentType || 'application/octet-stream');
    gfs.openDownloadStream(fileId).pipe(res);
  } catch (err) {
    console.error('GridFS file fetch error:', err);
    res.status(500).json({ error: 'Error fetching file from GridFS' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
