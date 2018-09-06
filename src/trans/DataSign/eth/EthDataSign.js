'use strict'
let     retResult   = require('../../transUtil').retResult;
let     DataSign    = require('../common/DataSign');
let     ccUtil      = require('../../../api/ccUtil');


class EthDataSign extends DataSign {
  constructor(input, config) {
    super(input, config);
  }


  sign(tran) {
    console.log("Entering EthDataSign::sign");
    let privateKey = ccUtil.getPrivateKey('ETH',
      tran.commondData.from,
      this.input.password,
      this.config.ethKeyStorePath);
    let trans = tran.commondData;
    trans.data = tran.contractData;

    let rawTx = ccUtil.signEthByPrivateKey(trans, privateKey);

    retResult.code = true;
    retResult.result = rawTx;
    return retResult;
  }


}

module.exports = EthDataSign;