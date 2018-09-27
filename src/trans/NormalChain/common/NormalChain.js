'use strict'
let     Transaction     = require('../../Transaction/common/Transaction');
let     DataSign        = require('../../DataSign/common/DataSign');
let     TxDataCreator   = require('../../TxDataCreator/common/TxDataCreator');
let     errorHandle     = require('../../transUtil').errorHandle;
let     retResult       = require('../../transUtil').retResult;
let     ccUtil          = require('../../../api/ccUtil');
let     sdkConfig       = require('../../../conf/config');


class NormalChain {
  constructor(input,config) {
    global.logger.debug("=========this.input====================");
    global.logger.debug(input);
    this.input          = input;
    this.config         = config;

    this.trans          = null;
    this.dataSign       = null;
    this.txDataCreator  = null;
    this.chainType      = null;
  }
  // used for revoke and redeem, to check whether the status and time is ok or not.
  checkPreCondition(){
    retResult.code = true;
    return retResult;
  }
  createTrans(){
    retResult.code    = true;
    retResult.result  = new Transaction(this.input,this.config);
    return retResult;
  }
  createDataCreator(){
    retResult.code    = true;
    retResult.result  = new TxDataCreator(this.input,this.config);
    return retResult;
  }
  createDataSign(){
    retResult.code    = true;
    retResult.result  = new DataSign(this.input,this.config);
    return retResult;
  }
  sendTrans(data){
    let chainType = this.input.chainType;
    global.logger.debug("sendTrans chainType is :",chainType);
    return ccUtil.sendTrans(data,chainType);
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

  preSendTrans(signedData){
    retResult.code = true;
    return retResult;
  }
  postSendTrans(resultSendTrans){
    retResult.code = true;
    return retResult;
  }
  async run(){
    let ret;
    let signedData = null;
    try{
      global.logger.debug("Entering NormalChain::run");

      // step0  : check pre condition
      ret = this.checkPreCondition();
      if(ret.code !== true){
        global.logger.debug("result from checkPreCondition is :",ret.result);
        return ret;
      }

      ret = this.createTrans();
      if(ret.code !== true){
        return ret;
      }else{
        this.trans = ret.result;
      }

      ret = this.createDataCreator();
      if(ret.code !== true){
        return ret;
      }else{
        this.txDataCreator = ret.result;
      }

      ret = this.createDataSign();
      if(ret.code !== true){
        return ret;
      }else{
        this.dataSign = ret.result;
      }

      // step1  : build common data of transaction
      let commonData = null;
      ret = await this.txDataCreator.createCommonData();
      if(ret.code !== true){
        return ret;
      }else{
        commonData = ret.result;
        global.logger.debug("NormalChain::run commontdata is:");
        global.logger.debug(commonData);
        this.trans.setCommonData(commonData);
      }
      // step3  : get singedData
      // global.logger.debug("NormalChain::run before sign trans is:");
      // global.logger.debug(this.trans);
      ret = this.dataSign.sign(this.trans);
      global.logger.debug("NormalChain::run end sign, signed data is:");
      global.logger.debug(ret.result);
      if(ret.code !== true){
        return ret;
      }else{
        signedData = ret.result;
      }

      //step4.0 : insert in DB for resending.
      global.logger.debug("before preSendTrans:");
      ret = this.preSendTrans(signedData);
      if(ret.code !== true){
        return ret;
      }
      global.logger.debug("after preSendTrans:");

    }catch(error){
      // global.logger.debug("error:",error);
      ret.code = false;
      ret.result = error;
      global.logger.debug("NormalChain run error:",error);
      return ret;
    }
    // step4  : send transaction to API server or web3;
    let resultSendTrans;
    let sendSuccess = false;
    for(let i = 0 ; i< sdkConfig.tryTimes;i++){
      try{
        resultSendTrans = await this.sendTrans(signedData);
        sendSuccess     = true;
        ret.result      = resultSendTrans;
        break;
      }catch(error){
        global.logger.debug("NormalChain::run sendTrans error:");
        global.logger.debug("retry time:",i);
        global.logger.debug(error);
        ret.result  = error;
      }
    }
    if(sendSuccess !== true){
      ret.code    = false;
      return ret;
    }
    try{
      global.logger.debug("result of sendTrans:", resultSendTrans);
      global.logger.debug("before postSendTrans");
      this.postSendTrans(resultSendTrans);
      global.logger.debug("after postSendTrans");
      // global.logger.debug("resultSendTrans :",resultSendTrans);
      ret.code    = true;
      ret.result  = resultSendTrans;
      // step5  : update transaction status in the database
    }catch(error){
      ret.code    = false;
      ret.result  = error;
    }
    return ret;
  }
}

module.exports = NormalChain;
