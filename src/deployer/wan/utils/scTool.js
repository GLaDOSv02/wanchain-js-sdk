const path = require('path');
const tool = require('./tool');
const solc = require('solc');
const linker = require('solc/linker')
const Web3 = require('web3');
const cfg = require('../config.json');
const source = require('../source');
const contractAddress = require('../contractAddress');
const wanUtil = require('wanchain-util');
const Tx = wanUtil.wanchainTx;
const ccUtil = require('../../../api/ccUtil');
const hdUtil = require('../../../api/hdUtil');

const web3 = new Web3();

function getImport(filePath) {
  let fileName = path.basename(filePath);
  let content = source[fileName];
  if (content) {
    return {contents: source[fileName]};
  } else {
    return {error: 'File not found'}
  }
}

function getLibAddress(libs, refs) {
  /* IMPORTANT !!!
     libs is contract name, refs contains relative path, and has max 36 chars
     make sure contract has short name and relative path
  */
  let result = {};
  if (libs && libs.length > 0) {
    for (var ref in refs) {
      libs.forEach(lib => {
        if (ref.indexOf(lib) >= 0) {
          result[ref] = contractAddress.getAddress(lib);
        }
      })      
    }
  }
  // console.log("getLibAddress: %O", result);
  return result;
}

const compileContract = (name) => {
  let input = {};
  let fileName = name + ".sol";
  let key = fileName + ":" + name;
  input[fileName] = source[fileName];
  let output = solc.compile({sources: input}, 1, getImport);
  return output.contracts[key];
}

const linkContract = (compiled, libs) => {
  let refs = linker.findLinkReferences(compiled.bytecode);
  // console.log("findLinkReferences: %O", refs);
  compiled.bytecode = linker.linkBytecode(compiled.bytecode, getLibAddress(libs, refs));
}

const getDeployContractTxData = async (compiled) => {
  let contract = new web3.eth.Contract(JSON.parse(compiled.interface), {data: '0x' + compiled.bytecode});
  return await contract.deploy().encodeABI();
}

const serializeTx = async (data, nonce, contractAddr, value, filePath, walletId, path) => {
  // console.log("txdata=" + data);
  if (0 != data.indexOf('0x')){
    data = '0x' + data;
  }

  value = web3.utils.toWei(value, 'ether');
  value = new web3.utils.BN(value);
  value = '0x' + value.toString(16);

  let sender = await path2Address(walletId, path);
  // console.log("serializeTx address: %O", sender);

  rawTx = {
      Txtype: 0x01, // wanchain only
      nonce: nonce,
      gasPrice: cfg.gasPrice,
      gasLimit: cfg.gasLimit,
      to: contractAddr,
      value: value,
      from: sender,
      data: data
  };
  // console.log("rawTx: %O", rawTx)
  let tx = new Tx(rawTx);
  let privateKey = new Buffer.from(hdUtil.exportPrivateKey(5, path, "Wanglu1"), 'hex');
  tx.sign(privateKey);
  let serialized = tx.serialize();
  // console.log("serialized tx: " + serialized.toString('hex'));
  if (filePath) {
    tool.write2file(filePath, serialized.toString('hex'));
    console.log("tx is serialized to %s", filePath);
    return true;
  } else {
    return serialized;
  }
}

const sendSerializedTx = async (tx) => {
  if (typeof(tx) == 'string') { // filePath
    tx = tool.readFromFile(tx);
  }
  let txData = '0x' + tx.toString('hex');
  let txHash = await ccUtil.sendTrans(txData, 'WAN');
  console.log("sendSerializedTx hash: %s", txHash)  
  return txHash;
}

const waitReceipt = async (txHash, isDeploySc, times = 0) => {
  if (times >= 200) {
    console.log("%s receipt timeout", txHash);
    return null;
  }
  try {
    let response = await ccUtil.getTxReceipt('WAN', txHash);
    // console.log("waitReceipt %s times %d response: %O", txHash, times, response);
    if (isDeploySc) {
      if (response.status == '0x1') {
        return response.contractAddress;
      } else {
        console.error("%s times %d receipt failed", txHash, times);
        return null;
      }
    } else {
      return (response.status == '0x1');
    }
  } catch(e) {
    // console.log("waitReceipt %s times %d none: %O", txHash, times, e);
    return await waitReceipt(txHash, isDeploySc, times + 1);
  }
}

const deployContract = async (name, compiled, walletId, path) => {
  let txData = await getDeployContractTxData(compiled);
  let sender = await path2Address(walletId, path);
  let nonce = await getNonce(sender);
  let serialized = await serializeTx(txData, nonce, '', '0', null, walletId, path);
  let txHash = await sendSerializedTx(serialized);
  let address = await waitReceipt(txHash, true);
  if (address) {
    console.log("deployed %s address: %s", name, address);
    return address;
  } else {
    console.log("deploy %s failed", name);
    return null;
  }
}

const getDeployedContract = async (name, address) => {
  let compiled = compileContract(name);
  return new web3.eth.Contract(JSON.parse(compiled.interface), address);
}

const path2Address = async (walletId, path) => {
  let chain = global.chainManager.getChain('WAN');
  let address = await chain.getAddress(walletId, path);
  return ccUtil.hexAdd0x(address.address);
}

const initNonce = async (walletId, path) => {
  let address = await path2Address(walletId, path);
  let nonce = await getNonce(address);
  tool.updateNonce(address, nonce);
  return nonce;
}

const getNonce = async (address) => {
  let nonce = await ccUtil.getNonce(ccUtil.hexAdd0x(address), 'WAN');
  return nonce;
}

const getTxLog = async (txHash, contract, eventName, eventIndex) => {
  let abi = contract._jsonInterface;
  let item, eventAbi = null;
  for (let i = 0; i < abi.length; i++) {
    item = abi[i];
    if ((item.type == 'event') && (item.name == eventName)) {
      eventAbi = item.inputs;
    }
  }
  if (eventAbi == null) {
    console.error("event %s not found", eventName);
    return null;
  }
  let receipt;
  if (cfg.mode == 'debug') {
    receipt = await web3.eth.getTransactionReceipt(txHash);
  } else {
    receipt = await ccUtil.getTxReceipt('WAN', txHash);
  } 
  let log = await web3.eth.abi.decodeLog(eventAbi, receipt.logs[eventIndex].data, receipt.logs[eventIndex].topics);
  return log;
}

const wan2win = (wan) => {
  return web3.utils.toWei(wan.toString(), 'ether');
}

module.exports = {
  compileContract,
  linkContract,
  getDeployContractTxData,
  serializeTx,
  sendSerializedTx,
  waitReceipt,
  deployContract,
  getDeployedContract,
  path2Address,
  initNonce,
  getNonce,
  getTxLog,
  wan2win
}