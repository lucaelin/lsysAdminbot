module.exports.loadAll = function loadAll(...args) {
  let includes = [
    './Del.js',
    './Mute.js',
    './Kick.js',
  ];
  return includes.map((path)=>{
    let Plugin = require(path);
    return new Plugin(...args);
  });
};
