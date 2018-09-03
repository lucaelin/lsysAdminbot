module.exports.loadAll = function loadAll(...args) {
  let includes = [
    './Del.js',
    './Mute.js',
    './Kick.js',
    './AI.js',
    './Update.js',
  ];
  return includes.map((path)=>{
    let Plugin = require(path); // eslint-disable-line global-require
    return new Plugin(...args);
  });
};
