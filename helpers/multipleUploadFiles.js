const config = require('config');
const multer = require('multer');
const path = require('path');
const common = require('./common');

const uploadFile = async (req, res, fields, filePath) => {
    try {
        imagesName = [];
        return new Promise(function (resolve, reject) {
            const storage = multer.diskStorage({
                destination: function (req, file, callback) {
                    callback(null, filePath);
                },
                filename: function (req, file, callback) {
                    callback(null, file.originalname + "-" + common.timestamp() + path.extname(file.originalname));
                }
            });
            const upload = multer({ storage: storage }).array(fields, 50);
            upload(req, res, function (err) {
                if (err) {
                    reject(err);
                }
                if (req.files == null) {
                    imagesName.push({ 'imageName': config.defaultImage })
                    resolve(imagesName);
                    return;
                }
                for (let i = 0; i < req.files.length; i++) {
                    imagesName.push({ 'imageName': req.files[i].path })
                }
                resolve(imagesName);
            });
        })
    } catch (e) {
        console.log(e);
    }
}



module.exports = {
    uploadFile
}