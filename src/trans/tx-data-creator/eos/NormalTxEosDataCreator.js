'use strict'
let     TxDataCreator = require('../common/TxDataCreator');
let     ccUtil        = require('../../../api/ccUtil');
let     utils         = require('../../../util/util');

let logger = utils.getLogger('NormalTxEosDataCreator.js');

/**
 * @class
 * @augments  TxDataCreator
 */
class NormalTxEosDataCreator extends TxDataCreator{
  /**
   * @constructor
   * @param {Object} input  - {@link CrossChain#input input} of final users.(gas, gasPrice, value and so on)
   * @param {Object} config - {@link CrossChain#config config} of cross chain used.
   */
  constructor(input,config) {
    super(input,config);
  }

  /**
   * @override
   * @returns {Promise<{code: boolean, result: null}>}
   */
  async createCommonData(){
    logger.debug("Entering NormalTxEosDataCreator::createCommonData");
    this.retResult.code      = true;
    let  commonData     = {};
    commonData.from     = this.input.from;
    if(this.input.chainType === 'WAN'){
      commonData.to       = this.config.buddySCAddr;
    }else{
      commonData.to       = this.input.to;
    }
    commonData.value    = parseFloat(this.input.amount).toFixed(4) + ' EOS';
    // commonData.gasPrice = ccUtil.getGWeiToWei(this.input.gasPrice);
    // commonData.gasLimit = Number(this.input.gasLimit);
    // commonData.gas      = Number(this.input.gasLimit);
    commonData.nonce    = 0; // need todo
    this.retResult.result    = commonData;
    try{
      this.retResult.code    = true;

      // if(this.input.hasOwnProperty('testOrNot')){
      //   commonData.nonce  = ccUtil.getNonceTest();
      // }else{
      //   commonData.nonce  = await ccUtil.getNonceByLocal(commonData.from,this.input.chainType);
      //   logger.info("NormalTxEosDataCreator::createCommonData getNonceByLocal,%s",commonData.nonce);
      // }
      // logger.debug("nonce:is ",commonData.nonce);
      logger.debug(commonData);
      // if(this.input.chainType === 'WAN'){
      //   commonData.Txtype = '0x01';
      // }
      this.retResult.result  = commonData;
    }catch(error){
      logger.error("error:",error);
      this.retResult.code      = false;
      this.retResult.result    = error;
    }
    return Promise.resolve(this.retResult);
  }

  /**
   * @override
   * @returns {{code: boolean, result: null}|transUtil.this.retResult|{code, result}}
   */
  async createContractData(){
    let actions;
    try{
      logger.debug("Entering NormalTxEosDataCreator::createContractData");
      // input action can be newaccount/buyrambytes/sellram/delegatebw/undelegatebw
      if (this.input.action && this.input.action === 'newaccount') {
        actions = [{
          account: 'eosio',
          name: this.input.action,
          authorization: [{
            actor: this.input.from,
            permission: 'active',
          }],
          data: {
            creator: this.input.from,
            name: this.input.accountName,
            owner: this.input.ownerPublicKey,
            active: this.input.activePublicKey
          }
        },
        {
          account: 'eosio',
          name: 'buyrambytes',
          authorization: [{
            actor: this.input.from,
            permission: 'active',
          }],
          data: {
            payer: this.input.from,
            receiver: this.input.accountName,
            bytes: parseInt(this.input.ramBytes, 10) * 1024
          }
        },{
          account: 'eosio',
          name: 'delegatebw',
          authorization: [{
            actor: this.input.from,
            permission: 'active',
          }],
          data: {
            from: this.input.from,
            receiver: this.input.accountName,
            stake_net_quantity: parseFloat(this.input.netAmount).toFixed(4) + ' EOS',
            stake_cpu_quantity: parseFloat(this.input.cpuAmount).toFixed(4) + ' EOS',
            transfer: 0
          }
        }];
      } else if (this.input.action && this.input.action === 'buyrambytes') {
        actions = [{
          account: 'eosio',
          name: this.input.action,
          authorization: [{
            actor: this.input.from,
            permission: 'active',
          }],
          data: {
            payer: this.input.from,
            receiver: this.input.to,
            bytes: parseInt(this.input.ramBytes, 10) * 1024
          }
        }];
      } else if (this.input.action && this.input.action === 'sellram') {
        actions = [{
          account: 'eosio',
          name: this.input.action,
          authorization: [{
            actor: this.input.from,
            permission: 'active',
          }],
          data: {
            account: this.input.from,
            bytes: parseInt(this.input.ramBytes, 10) * 1024
          }
        }];
      } else if (this.input.action && this.input.action === 'delegatebw') {
        actions = [{
          account: 'eosio',
          name: this.input.action,
          authorization: [{
            actor: this.input.from,
            permission: 'active',
          }],
          data: {
            from: this.input.from,
            receiver: this.input.to,
            stake_net_quantity: parseFloat(this.input.netAmount).toFixed(4) + ' EOS',
            stake_cpu_quantity: parseFloat(this.input.cpuAmount).toFixed(4) + ' EOS',
            transfer: 0
          }
        }];
      } else if (this.input.action && this.input.action === 'undelegatebw') {
        actions = [{
          account: 'eosio',
          name: this.input.action,
          authorization: [{
            actor: this.input.from,
            permission: 'active',
          }],
          data: {
            from: this.input.from,
            receiver: this.input.to,
            unstake_net_quantity: parseFloat(this.input.netAmount).toFixed(4) + ' EOS',
            unstake_cpu_quantity: parseFloat(this.input.cpuAmount).toFixed(4) + ' EOS',
            transfer: 0
          }
        }];
      } else {
        actions = [{
          account: 'eosio.token',
          name: 'transfer',
          authorization: [{
            actor: this.input.from,
            permission: 'active',
          }],
          data: {
            from: this.input.from,
            to: this.input.to,
            quantity: parseFloat(this.input.amount).toFixed(4) + ' EOS',
            memo: '',
          }
        }];
      }

      let packedTx = await ccUtil.packTransaction(this.input.chainType, actions);
      this.retResult.result    = packedTx;
      this.retResult.code      = true;

    }catch(error){
      logger.error("NormalTxEosDataCreator::createContractData: error: ",error);
      this.retResult.result      = error;
      this.retResult.code        = false;
    }
    return this.retResult;
  }
}

module.exports = NormalTxEosDataCreator;
