const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');


const app = express();
const upload = multer({
    storage: multer.diskStorage({
        destination: 'routes/uploads/',
        filename: (req, file, cb) => {
            const extension = path.extname(file.originalname);
            const filename = decodeURIComponent(path.basename(file.originalname, extension));
            // Create a new Buffer object with the filename encoded as UTF-8
            const encodedFilename = Buffer.from(filename, 'binary').toString('utf-8');
            req.uploadedFileName = encodedFilename;
            cb(null, `${encodedFilename}${extension}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        const allowedFileTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        if (allowedFileTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    },
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB
    }
});

app.use(express.json());
app.use(cors());

app.post('/api/upload', upload.single('file'), (req, res) => {
    // Retrieve the saved filename and type
    const uploadedFileName = req.uploadedFileName;
    const fileExtension = path.extname(req.file.originalname).replace('.', '');

    // Send response
    res.json({
        fileName: uploadedFileName,
        fileType: fileExtension
    });
});

// Update file name route
app.put('/api/update/:filename', (req, res) => {
    let oldFileName = req.params.filename;
    const newFileName = req.body.newFileName;

    // Decode the old file name
    oldFileName = decodeURIComponent(oldFileName);

    // Check if the old file exists in the uploads directory
    const filePath = path.join(__dirname, 'routes/uploads', oldFileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    // Generate new file path
    const newFilePath = path.join(__dirname, 'routes/uploads', newFileName);

    // Rename the file
    fs.rename(filePath, newFilePath, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to update file name' });
        }

        // Send success response
        res.json({ message: 'File name updated successfully' });
    });
});

app.delete('/api/delete/:filename', (req, res) => {
    const fileName = req.params.filename;

    // Check if the file exists in the uploads directory
    const filePath = path.join(__dirname, 'routes/uploads', fileName);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    // Delete the file
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to delete file' });
        }

        // Send success response
        res.json({ message: 'File deleted successfully' });
    });
});

app.get('/api/download/:filename', (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, 'routes/uploads', fileName);
  
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
  
    const fileStats = fs.statSync(filePath);
    const fileSize = fileStats.size;
  
    const encodedFilename = encodeURIComponent(fileName); // Encode the file name for the header value
  
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', fileSize);
  
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err); // Log the error to the console for debugging
    if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).send('File size exceeds the allowed limit of 25MB');
    } else {
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
