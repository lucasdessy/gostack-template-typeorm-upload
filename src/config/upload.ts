import multer from 'multer';
import path from 'path';

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');

const uploadConfig = {
  directory: tmpFolder,
  storage: multer.diskStorage({
    destination: tmpFolder,
    filename: (_req, file, callback) => {
      return callback(null, file.originalname);
    },
  }),
};

export default uploadConfig;
