const fs = require('fs');
const p = require('path');
const sdkUtil = require('../../../util/util');

global.deployerContext = {};

const createFolder = (filePath) => { 
  var sep = p.sep
  var folders = p.dirname(filePath).split(sep);
  var tmp = '';
  while (folders.length) {
    tmp += folders.shift() + sep;
    if (!fs.existsSync(tmp)) {
      fs.mkdirSync(tmp);
    }
  }
}

const write2file = (filePath, content) => {
  createFolder(filePath);
  fs.writeFileSync(filePath, content, {flag: 'w', encoding: 'utf8', mode: '0666'})
}

const readFromFile = (filePath) => {
  return fs.readFileSync(filePath, 'utf8');
}

// called by wallet
const setFilePath = (type, path) => {
  if (type == 'token') { // offline
    global.deployerContext.token = path;
  } else if (type == 'smg') { // offline
    global.deployerContext.smg = path;
  } else if (type == 'contractAddress') { // online
    let dest = getOutputPath('contractAddress');
    if (p.normalize(path) != p.normalize(dest)) {
      fs.copyFileSync(path, dest); // save file to avoid duplicate set
    }
  } else if (type == 'deployContract') { // online
    global.deployerContext.deployContract = path;
  } else if (type == 'setDependency') { // online
    global.deployerContext.setDependency = path;
  } else if (type == 'registerToken') { // online
    global.deployerContext.registerToken = path;
  } else if (type == 'registerSmg') { // online
    global.deployerContext.registerSmg = path;
  } else {
    return null;
  }
}

// called by internal
const getInputPath = (type) => {
  if (type == 'token') { // offline
    return global.deployerContext.token;
  } else if (type == 'smg') { // offline
    return global.deployerContext.smg;
  } else if (type == 'deployContract') { // online
    return global.deployerContext.deployContract;
  } else if (type == 'setDependency') { // online
    return global.deployerContext.setDependency;
  } else if (type == 'registerToken') { // online
    return global.deployerContext.registerToken;
  } else if (type == 'registerSmg') { // online
    return global.deployerContext.registerSmg;
  } else {
    return null;
  }
}

// called by wallet or internal
const getOutputPath = (type) => {
  if (!global.deployerContext.dataDir) {
    global.deployerContext.dataDir = p.join(sdkUtil.getConfigSetting('path:datapath'), 'wanDeployer');
  }
  if (type == 'nonce') { // internal
    return p.join(global.deployerContext.dataDir, 'nonce.json');
  } else if (type == 'contractAddress') { // online, offline internal
    return p.join(global.deployerContext.dataDir, 'contractAddress.json');
  } else if (type == 'deployContract') { // offline
    return p.join(global.deployerContext.dataDir, 'txData/deployContract.dat');
  } else if (type == 'setDependency') { // offline
    return p.join(global.deployerContext.dataDir, 'txData/setDependency.dat');
  } else if (type == 'registerToken') { // offline
    return p.join(global.deployerContext.dataDir, 'txData/registerToken.dat');
  } else if (type == 'registerSmg') { // offline
    return p.join(global.deployerContext.dataDir, 'txData/registerSmg.dat');
  } else {
    return null;
  }
}

const str2hex = (str) => {
  let content = new Buffer.from(str).toString('hex');
  return '0x' + content;
}

const getNonce = (address) => {
  let nonce = JSON.parse(readFromFile(getOutputPath('nonce')));
  return nonce[address.toLowerCase()];
}

const updateNonce = (address, nonce) => {
  let n = {};
  try {
    n = JSON.parse(readFromFile(getOutputPath('nonce')));
  } catch {}
  n[address.toLowerCase()] = Number(nonce);
  write2file(getOutputPath('nonce'), JSON.stringify(n));
}

module.exports = {
  write2file,
  readFromFile,
  setFilePath,
  getInputPath,
  getOutputPath,
  str2hex,
  getNonce,
  updateNonce
}
