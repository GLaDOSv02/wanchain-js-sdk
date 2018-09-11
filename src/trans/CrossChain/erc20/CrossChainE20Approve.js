'use strict'
let     Transaction                   = require('../../Transaction/common/Transaction');
let     E20DataSign                   = require('../../DataSign/erc20/E20DataSign');
let     E20DataSignWan                = require('../../DataSign/wan/WanDataSign');
let     ApproveTxE20DataCreator       = require('../../TxDataCreator/erc20/ApproveTxE20DataCreator');
let     CrossChain                    = require('../common/CrossChain');
let     {retResult,errorHandle}       = require('../../transUtil');
let     ccUtil                        = require('../../../api/ccUtil');

class CrossChainE20Approve extends CrossChain{
  constructor(input,config) {
    super(input,config);
    this.input.chainType = config.srcChainType;
  }

  createDataCreator(){
    console.log("Entering CrossChainE20Approve::createDataCreator");
    retResult.code    = true;
    retResult.result  = new ApproveTxE20DataCreator(this.input,this.config);
    return retResult;
  }
  createDataSign(){
    console.log("Entering CrossChainE20Approve::createDataSign");
    retResult.code    = true;
    if(this.input.chainType === 'WAN'){
      retResult.result = new E20DataSignWan(this.input,this.config);
    }else{
      retResult.result = new E20DataSign(this.input,this.config);
    }
    return retResult;
  }
  preSendTrans(signedData){
    let record = {
      "hashX" 									:this.trans.commonData.hashX,
      "x" 											:this.trans.commonData.x,
      "from"  									:this.trans.commonData.from,
      "to"  										:this.input.to,
      "storeman" 								:this.input.storeman,
      "value"  									:this.trans.commonData.value,
      "contractValue" 					:ccUtil.getWei(this.input.amount),
      "lockedTime" 							:"",
      "buddyLockedTime" 				:"",
      "srcChainAddr" 						:this.config.srcSCAddr,
      "dstChainAddr" 						:this.config.dstSCAddr,
      "srcChainType" 						:this.config.srcChainType,
      "dstChainType" 						:this.config.dstChainType,
      "status"  								:"ApproveSending",
      "approveTxHash" 					:this.trans.commonData.hashX, // will update when sent successfully.
      "lockTxHash" 							:"",
      "refundTxHash"  					:"",
      "revokeTxHash"  					:"",
      "buddyLockTxHash" 				:"",
      "approveSendTryTimes" 		:0,
      "lockSendTryTimes" 				:0,
      "refundSendTryTimes" 			:0,
      "revokeSendTryTimes" 			:0,
      "signedDataLock" 					:"",
      "signedDataApprove" 			:signedData,
      "signedDataRefund" 				:"",
      "signedDataRevoke" 				:""
    };
    console.log("CrossChainE20Approve::preSendTrans");
    console.log("collection is :",this.config.crossCollection);
    console.log("record is :",record);
    global.wanDb.insertItem(this.config.crossCollection,record);
    retResult.code = true;
    return retResult;
  }
  postSendTrans(resultSendTrans){
    console.log("Entering CrossChainE20Approve::postSendTrans");
    let txHash = resultSendTrans;
    let hashX  = this.trans.commonData.hashX;
    let record = global.wanDb.getItem(this.config.crossCollection,{hashX:hashX});
    record.status = 'ApproveSent';
    record.approveTxHash = txHash;
    record.signedDataApprove = '';
    console.log("CrossChainE20Approve::postSendTrans");
    console.log("collection is :",this.config.crossCollection);
    console.log("record is :",record);
    global.wanDb.updateItem(this.config.crossCollection,{hashX:record.hashX},record);
    retResult.code = true;
    return retResult;
  }
}
module.exports = CrossChainE20Approve;
