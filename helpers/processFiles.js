const path = require('path');
const fs = require('fs');

function readFile (filePath) {
  return fs.readFileSync(filePath);
}

function writeFile (filePath, fileContants) {
  var stream = fs.createWriteStream(filePath);
  stream.once('open', (fd) => {
    stream.write(fileContants);
    stream.end();
  });
}

function uploadImages (fileName, filePath, folderPath) {
  const rootPath = path.join(path.resolve(__dirname), '../');
  const fileContants = readFile(filePath);
  const newPath = `${rootPath}${folderPath}${fileName}`;
  writeFile (newPath, fileContants);
  return newPath;
}

function decodeBase64Image(dataString) {
  //let matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
  response = {};
  /* if (matches.length !== 3) {
    // return new Error('Invalid input string');
  }

  response.type = matches[1]; */
  response.data = new Buffer(dataString, 'base64');
  return response;
}

function uploadImage (fileName, file, folderPath) {
  const rootPath = path.join(path.resolve(__dirname), '../');
  const imageBuffer = decodeBase64Image(file);
  const newPath = `${rootPath}${folderPath}${fileName}`;
  writeDataStream(newPath, imageBuffer.data);
  return newPath;
}

function writeDataStream (path, buffer) {
  fs.writeFileSync(path, buffer);
}

module.exports = {
  readFile,
  writeFile,
  uploadImages,
  uploadImage,
  decodeBase64Image
}