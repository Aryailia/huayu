const FileSystem = require('fs');

const toExport = {
  settingsInterface: function (pathToFile) {
    const prototype = Object.create(null);
    prototype.save = function () {
      return prototype;
    };

    return prototype;
  }
};

module.exports = toExport;
