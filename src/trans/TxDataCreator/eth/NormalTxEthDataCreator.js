'use strict'
let errorHandle = require('../../transUtil').errorHandle;
let retResult = require('../../transUtil').retResult;
let TxDataCreator = require('../common/TxDataCreator');
let ccUtil = require('../../../api/ccUtil');
/**
 * @class
 * @augments  TxDataCreator
 */
class NormalTxEthDataCreator extends TxDataCreator {
  /**
   * @constructor
   * @param {Object} input  - {@link CrossChain#input input}
   * @param {Object} config - {@link CrossChain#config config}
   */
  constructor(input, config) {
    super(input, config);
  }

  /**
   * @override
   * @returns {Promise<{code: boolean, result: null}>}
   */
  async createCommonData(){
    global.logger.debug("Entering NormalTxETHDataCreator::createCommonData");
    retResult.code      = true;
    let  commonData     = {};
    commonData.from     = this.input.from;
    commonData.to       = this.input.to;
    commonData.value    = ccUtil.tokenToWeiHex(this.input.amount,this.config.tokenDecimals);
    commonData.gasPrice = ccUtil.getGWeiToWei(this.input.gasPrice);
    commonData.gasLimit = Number(this.input.gasLimit);
    commonData.gas      = Number(this.input.gasLimit);
    commonData.nonce    = null; // need todo
    retResult.result    = commonData;
    try{
      retResult.code    = true;

      if(this.input.hasOwnProperty('testOrNot')){
        commonData.nonce  = ccUtil.getNonceTest();
      }else{
        commonData.nonce  = await ccUtil.getNonce(commonData.from,this.input.chainType);
      }
      global.logger.debug("nonce:is ",commonData.nonce);
      global.logger.debug(commonData);
      if(this.input.chainType === 'WAN'){
        commonData.Txtype = '0x01';
      }
      retResult.result  = commonData;
    }catch(error){
      global.logger.error("error:",error);
      retResult.code      = false;
      retResult.result    = error;
    }
    return Promise.resolve(retResult);
  }

  /**
   * @override
   * @returns {{code: boolean, result: null}|transUtil.retResult|{code, result}}
   */
  createContractData(){
    try{
      global.logger.debug("Entering NormalTxETHDataCreator::createContractData");
      let data = '0x0';
      retResult.result    = data;
      retResult.code      = true;

    }catch(error){
      global.logger.error("NormalTxETHDataCreator::createContractData: error: ",error);
      retResult.result      = error;
      retResult.code        = false;
    }
    return retResult;
  }
}
module.exports = NormalTxEthDataCreator;