'use strict'
let     errorHandle   = require('../../transUtil').errorHandle;
let     retResult     = require('../../transUtil').retResult;
let     TxDataCreator = require('../common/TxDataCreator');

class RefundTxE20DataCreator extends TxDataCreator{
  constructor(input,config) {
    super(input,config);
  }
  createCommonData(){
    retResult.code      = true;
    return retResult;
  }
  createContractData(){
    retResult.code      = true;
    return retResult;
  }
}

module.exports = RefundTxE20DataCreator;