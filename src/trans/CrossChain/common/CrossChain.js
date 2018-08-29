'use strict'
let     Transaction   = require('../Transaction/common/Transaction.js');
let     DataSign      = require('../DataSign/common/DataSign.js');
let     TxDataCreator = require('../TxDataCreator/common/TxDataCreator.js');
let     errorHandle   = require('../../transUtil.js').errorHandle;
let     retResult     = require('../../transUtil.js').retResult;
class CrossChain {
  constructor(input,config) {
    this.input          = input;
    this.config         = config;

    this.trans          = null;
    this.dataSign       = null;
    this.txDataCreator  = null;
  }

  createTrans(){
    retResult.code = true;
    retResult.result = new Transaction(this.input,this.config);
    return retResult;
  }
  createDataCreator(){
    retResult.code = true;
    retResult.result = new TxDataCreator(this.input,this.config);
    return retResult;
  }
  createDataSign(){
    retResult.code = true;
    retResult.result = new DataSign(this.input,this.config);
    return retResult;
  }
  sendTrans(data){
    retResult.code = true;
    return retResult;
  }
  setCommonData(commonData){
    this.trans.setCommonData(commonData);
    retResult.code = true;
    return retResult;
  }
  setContractData(contractData){
    this.trans.setContractData(contractData);
    retResult.code = true;
    return retResult;
  }
  postSendTrans(){
    retResult.code = true;
    return retResult;
  }
  run(){
    let ret = this.createTrans();
    if(ret.code !== true){
      errorHandle();
    }else{
      this.trans = ret.result;
    }

    ret = this.createDataCreator();
    if(ret.code !== true){
      errorHandle();
    }else{
      this.txDataCreator = ret.result;
    }

    ret = this.createDataSign();
    if(ret.code !== true){
      errorHandle();
    }else{
      this.dataSign = ret.result;
    }

    // step1  : build common data of transaction
    let commonData = null;
    ret = this.txDataCreator.createCommonData();
    if(ret.code !== true){
      errorHandle();
    }else{
      commonData = ret.result;
      this.trans.setCommonData(commonData);
    }

    // step2  : build contract data of transaction
    let contractData = null;
    ret = this.txDataCreator.createContractData();
    if(ret.code !== true){
      errorHandle();
    }else{
      contractData = ret.result;
      this.trans.setContractData(contractData);
    }

    // step3  : get singedData
    let signedData = null;
    ret = this.dataSign.sign(this.trans);
    if(ret.code !== true){
      errorHandle();
    }else{
      signedData = ret.result;
    }

    // step4  : send transaction to API server or web3;
    ret = this.sendTrans(signedData);
    if(ret.code !== true) {
      errorHandle();
    }

    // step5  : update transaction status in the database
    ret = this.postSendTrans();
    if(ret.code !== true) {
      errorHandle();
    }
  }
}
exports.CrossChain = CrossChain;
