const fs = require('fs');

//hander img upload
const path = require('path')
const multer = require('multer')

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        let directory = req.query.directory;
        cb(null, `public/${directory}/`);
    },
    filename: function(req, file, cb) {
        let ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
})

var upload = multer ({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 2
    }
})

//remove img form folder
async function removeImage(url, res) {
    const filePath = path.join(__dirname, `../../${url}`); // Adjust path as needed
    console.log(filePath);
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
            return res.status(500).json({ message: 'Failed to delete file' });
        }
    });
}

module.exports = {
    upload,
    removeImage
}