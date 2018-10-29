'use strict'
let     Transaction                   = require('../../transaction/common/Transaction');
let     E20DataSign                   = require('../../data-sign/erc20/E20DataSign');
let     E20DataSignWan                = require('../../data-sign/wan/WanDataSign');
let     ApproveTxE20DataCreator       = require('../../tx-data-creator/erc20/ApproveTxE20DataCreator');
let     CrossChain                    = require('../common/CrossChain');
let     {retResult,errorHandle}       = require('../../transUtil');
let     ccUtil                        = require('../../../api/ccUtil');

/**
 * @class
 * @augments CrossChain
 */
class CrossChainE20Approve extends CrossChain{
  /**
   * @constructor
   * @param {Object} input  - {@link CrossChain#input input} of final users.(gas, gasPrice, value and so on)
   * @param {Object} config - {@link CrossChain#config config} of cross chain used.
   */
  constructor(input,config) {
    super(input,config);
    this.input.chainType = config.srcChainType;
    this.input.keystorePath = config.srcKeystorePath;
  }

  /**
   * @override
   */
  createDataCreator(){
    global.logger.debug("Entering CrossChainE20Approve::createDataCreator");
    retResult.code    = true;
    retResult.result  = new ApproveTxE20DataCreator(this.input,this.config);
    return retResult;
  }
  /**
   * @override
   */
  createDataSign(){
    global.logger.debug("Entering CrossChainE20Approve::createDataSign");
    retResult.code    = true;
    if(this.input.chainType === 'WAN'){
      retResult.result = new E20DataSignWan(this.input,this.config);
    }else{
      retResult.result = new E20DataSign(this.input,this.config);
    }
    return retResult;
  }
  /**
   * @override
   */
  preSendTrans(signedData){
    let record = {
      "hashX" 									:this.trans.commonData.hashX,
      "x" 											:this.trans.commonData.x,
      "from"  									:this.trans.commonData.from,
      "to"  										:this.input.to,
      "storeman" 								:this.input.storeman,
      "value"  									:this.trans.commonData.value,
      "contractValue" 					:ccUtil.tokenToWeiHex(this.input.amount,this.config.tokenDecimals),
      "lockedTime" 							:"",
      "buddyLockedTime" 				:"",
      "srcChainAddr" 						:this.config.srcSCAddrKey,
      "dstChainAddr" 						:this.config.dstSCAddrKey,
      "srcChainType" 						:this.config.srcChainType,
      "dstChainType" 						:this.config.dstChainType,
      "status"  								:"ApproveSending",
      "approveTxHash" 					:this.trans.commonData.hashX, // will update when sent successfully.
      "lockTxHash" 							:"",
      "redeemTxHash"  					:"",
      "revokeTxHash"  					:"",
      "buddyLockTxHash" 				:"",
      "tokenSymbol"            :this.config.tokenSymbol,
      "tokenStand"             :this.config.tokenStand,
      "htlcTimeOut"            :"", //unit: s
      "buddyLockedTimeOut"     :"",
    };
    global.logger.info("CrossChainE20Approve::preSendTrans");
    global.logger.info("collection is :",this.config.crossCollection);
    global.logger.info("record is :",ccUtil.hiddenProperties(record,['x']));
    global.wanDb.insertItem(this.config.crossCollection,record);
    retResult.code = true;
    return retResult;
  }
  /**
   * @override
   */
  postSendTrans(resultSendTrans){
    global.logger.debug("Entering CrossChainE20Approve::postSendTrans");
    let txHash = resultSendTrans;
    let hashX  = this.trans.commonData.hashX;
    let record = global.wanDb.getItem(this.config.crossCollection,{hashX:hashX});
    record.status = 'ApproveSent';
    record.approveTxHash = txHash;
    global.logger.info("CrossChainE20Approve::postSendTrans");
    global.logger.info("collection is :",this.config.crossCollection);
    global.logger.info("record is :",ccUtil.hiddenProperties(record,['x']));
    global.wanDb.updateItem(this.config.crossCollection,{hashX:record.hashX},record);
    retResult.code = true;
    return retResult;
  }
}
module.exports = CrossChainE20Approve;
