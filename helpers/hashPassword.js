const bcrypt = require('bcrypt');
const saltRounds = require('config').saltRounds;

const generatePass = async (pass) => {
  const generateSalt = await bcrypt.genSalt(saltRounds);
  const generateHash = await bcrypt.hash(pass, generateSalt);

  return generateHash;
};

const comparePass = async (requestPass, dbPass) => {
  const match = await bcrypt.compare(requestPass, dbPass);
  return match;
};

module.exports = {
  generatePass,
  comparePass
}