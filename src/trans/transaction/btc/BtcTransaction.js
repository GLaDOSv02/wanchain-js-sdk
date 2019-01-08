'use strict'
let     Transaction   = require('../common/Transaction');
class BtcTransaction extends Transaction {
  constructor(input,config) {
    super(input,config);
    this.commonData   = null;
    this.contractData = null;
    this.txb          = null;
    this.inputs       = null;
    this.keypair      = null;
  }
  setCommonData(commonData){
    global.logger.debug("Entering BtcTransaction::setCommonData");
    // To Do
    this.commonData = commonData;
    this.retResult.code = true;
    return this.retResult;
  }
  setContractData(contractData){
    global.logger.debug("Entering BtcTransaction::setContractData");
    // TODO: check if redeemLockTimeStamp is exist in every btc tx
    this.contractData = contractData;
    this.txb          = contractData.txb;
    this.inputs       = contractData.inputs;
    this.keypair      = contractData.keypair;

    if (contractData.hasOwnProperty('fee')) {
        this.commonData["fee"]= contractData.fee;
    }
    if (contractData.hasOwnProperty('from')) {
        this.commonData["from"] = contractData.from;
    }
    if (contractData.hasOwnProperty('to')) {
        this.commonData["to"] = contractData.to;
    }
    if (contractData.hasOwnProperty('redeemLockTimeStamp')) {
        this.commonData["redeemLockTimeStamp"] = 
	        contractData.redeemLockTimeStamp;
    }

    // If has 'signedTxRaw', then the tx already signed!!!
    if (contractData.hasOwnProperty('signedTxRaw')) {
        this.signedTxRaw = contractData.signedTxRaw;
    }

    this.retResult.code = true;
    return this.retResult;
  }
}

module.exports = BtcTransaction;
