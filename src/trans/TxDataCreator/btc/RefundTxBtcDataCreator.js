'use strict'
let     errorHandle   = require('../../transUtil').errorHandle;
let     retResult     = require('../../transUtil').retResult;
let     TxDataCreator = require('../common/TxDataCreator');

class RefundTxBtcDataCreator extends TxDataCreator{
  constructor(input,config) {
    super(input,config);
  }
  createCommonData(){
    console.log("Entering RefundTxBtcDataCreator::createCommonData");
    retResult.code      = true;
    return retResult;
  }
  createContractData(){
    console.log("Entering RefundTxBtcDataCreator::createContractData");
    retResult.code      = true;
    return retResult;
  }
}

module.exports = RefundTxBtcDataCreator;