const { randomUUID } = require('crypto');
function uuidHelper() {
  return randomUUID();
}

module.exports = uuidHelper;
