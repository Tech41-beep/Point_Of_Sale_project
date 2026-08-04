const multer= require('multer');
const path = require('path');
const fs = require('fs');

const diskStorage= multer.diskStorage({
    destination: (req, file, cb) => {
        const folderPath= path.join(__dirname, '../upload');
    
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, {recursive: true});
        }
        cb(null, folderPath);
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
const uploadFile= (req, res) => {
    try{
        upload.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }])(req, res, (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
            }
            const file = req.files?.file?.[0] || req.files?.image?.[0];
            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file provided. Use a multipart field named "file".',
                });
            }
            res.status(200).json({
                success: true,
                message: 'File uploaded successfully',
                filePath: file.path,
            });
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}
const removeFile = (req,res)=>{
    try{
        const { filePath } = req.body;
        if(!filePath){
            return res.status(400).json({
                success:false,
                message: 'File path is required',
            })
        }

            const imagePath= path.join(__dirname, '../upload', filePath);
            if(fs.existsSync(imagePath)){
                fs.unlinkSync(imagePath);
                res.status(200).json({
                    success: true,
                    message: 'File removes successfully',
                })
            }else{
                res.status(404).json({
                    success: false,
                    message: 'File not found',
                })
            }
                

    }catch(error){
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

module.exports= {
    uploadFile,
    removeFile
};
