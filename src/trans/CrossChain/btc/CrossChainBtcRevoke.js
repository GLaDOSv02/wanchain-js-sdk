'use strict'
let     BtcTransaction           = require('../../Transaction/btc/BtcTransaction');
let     BtcDataSign             = require('../../DataSign/btc/BtcDataSign');
let     RevokeTxBtcDataCreator  = require('../../TxDataCreator/btc/RevokeTxBtcDataCreator');
let     CrossChain              = require('../common/CrossChain');
let     errorHandle             = require('../../transUtil').errorHandle;
let     retResult               = require('../../transUtil').retResult;
class CrossChainBtcRevoke extends CrossChain{
  constructor(input,config) {
    super(input,config);
  }
  createTrans(){
    retResult.code = true;
    retResult.result = new BtcTransaction(this.input,this.config);
    return retResult;
  }
  createDataCreator(){
    console.log("Entering CrossChainBtcRevoke::createDataCreator");
    retResult.code = true;
    retResult.result = new RevokeTxBtcDataCreator(this.input,this.config);
    return retResult;
  }
  createDataSign(){
    console.log("Entering CrossChainBtcRevoke::createDataSign");
    retResult.code = true;
    retResult.result = new BtcDataSign(this.input,this.config);
    return retResult;
  }

  postSendTrans(){
    console.log("Entering CrossChainBtcRevoke::postSendTrans");
    retResult.code = true;
    return retResult;
  }
}

module.exports = CrossChainBtcRevoke;
