import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

export const taskStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/tasks';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});
