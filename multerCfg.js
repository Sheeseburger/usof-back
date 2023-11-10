import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Set the destination directory for uploaded files
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        // Set the file name for the uploaded image
        const uniqueSuffix = Date.now();
        const fileExt = path.extname(file.originalname);
        const fileName = file.fieldname + '-' + uniqueSuffix + fileExt;

        cb(null, fileName);
    },
});

const upload = multer({ storage });

export default upload;
