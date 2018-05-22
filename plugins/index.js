module.exports.loadAll = function loadAll(...args) {
  let includes = [
    "./Del.js",
    "./Mute.js",
    "./Kick.js",
  ];
  return includes.map((path)=>{
    let plugin = require(path);
    return new plugin(...args);
  });
}