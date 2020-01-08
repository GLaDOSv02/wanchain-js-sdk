const tool = require('./utils/tool');

const loadAddress = () => {
  try {
    let datePath = tool.getOutputPath('contractAddress');
    let data = tool.readFromFile(datePath);
    return new Map(JSON.parse(data));
  } catch { // file not exist
    return new Map();
  }
}

const setAddress = (name, address) => {
  let addressMap = loadAddress();
  addressMap.set(name, address);
  let datePath = tool.getOutputPath('contractAddress');
  tool.write2file(datePath, JSON.stringify([...addressMap]));
}

const getAddress = (name) => {
  let addressMap = loadAddress();
  if (name) {
    let address = addressMap.get(name);
    if (address) {
      return address;
    } else {
      throw new Error("failed to get address of contract " + name);
    }
  } else {
    return addressMap;
  }
}

module.exports = {
  setAddress,
  getAddress
}