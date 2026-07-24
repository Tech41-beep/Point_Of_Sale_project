const multer= require('multer');
const path = require('path');
const fs = require('fs');

const diskStorage= multer.diskStorage({
    destination: (req, file, cb) => {
        const folderPath= path.join(__dirname, '../upload');
    
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, {recursive: true});
            cb(null, folderPath);
        }
    },
    filename: (req, file, cb) => {
       const extName= path.extname(file.originalname);
       const filename= `${Date.now()}${extName}`;
       cb(null, filename);
    }
});

const fileFilter= (req, file, cb) => {
    const allowedTypes= ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }else{
        cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));   
    }
};
const upload= multer({storage: diskStorage, fileFilter: fileFilter,
    limits:{
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

module.exports= upload;