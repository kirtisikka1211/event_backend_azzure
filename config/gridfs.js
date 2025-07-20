import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb+srv://kirtisikka972:38PU53Qqn1KGqvZC@cluster0.0kmpmma.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Use the existing mongoose connection
const conn = mongoose.connection;

let gfs;
conn.once('open', () => {
  gfs = new GridFSBucket(conn.db, {
    bucketName: 'uploads',
  });
});

// Multer storage engine for GridFS
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return {
      bucketName: 'uploads', // collection name in MongoDB
      filename: `${Date.now()}-${file.originalname}`,
    };
  },
});

const upload = multer({ storage });

// Helper to upload a file buffer to GridFS
export async function uploadBufferToGridFS(file) {
  return new Promise((resolve, reject) => {
    if (!gfs) return reject(new Error('GridFS not initialized'));
    const writeStream = gfs.openUploadStream(file.name, {
      contentType: file.mimetype,
    });
    writeStream.end(file.data);
    writeStream.on('finish', (uploadedFile) => {
      resolve(uploadedFile._id.toString());
    });
    writeStream.on('error', reject);
  });
}

export { gfs, upload }; 