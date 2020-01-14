const tool = require('../utils/tool');
const scTool = require('../utils/scTool');
const contractAddress = require('../contractAddress');

async function buildRegisterToken(walletId, path) {
  let contract, txData, i, serialized, output = [];

  try {
    let tokenPath = tool.getInputPath('token');
    let tokenArray = require(tokenPath); 

    let sender = await scTool.path2Address(walletId, path);
    let nonce = tool.getNonce(sender);

    let tmProxyAddress = contractAddress.getAddress('TokenManagerProxy');
    contract = await scTool.getDeployedContract('TokenManagerDelegate', tmProxyAddress);
    
    for (i = 0; i < tokenArray.length; i++) {
      let t = tokenArray[i];
      let withdrawDelayTime = t.withdrawDelayHours * 3600;
      txData = await contract.methods.addToken(t.tokenOrigAccount, t.token2WanRatio, scTool.wan2win(t.minDeposit), withdrawDelayTime,
                                        tool.str2hex(t.name), tool.str2hex(t.symbol), t.decimals)
                                    .encodeABI();
      serialized = await scTool.serializeTx(txData, nonce++, tmProxyAddress, '0', walletId, path);
      output.push({symbol: t.symbol, data: serialized});
    }

    let filePath = tool.getOutputPath('registerToken');
    tool.write2file(filePath, JSON.stringify(output));
    tool.logger.info("tx is serialized to %s", filePath);

    // update nonce
    tool.updateNonce(sender, nonce);

    return true;
  } catch (e) {
    tool.logger.error("buildRegisterToken failed: %O", e);
    return false;
  }
}

module.exports = buildRegisterToken;