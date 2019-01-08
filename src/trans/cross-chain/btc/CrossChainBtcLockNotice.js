'use strict'

let ccUtil                 = require('../../../api/ccUtil');
let Transaction            = require('../../transaction/common/Transaction');
let BtcDataSignWan         = require('../../data-sign/wan/WanDataSign');
let LockNoticeDataCreator  = require('../../tx-data-creator/btc/LockNoticeDataCreator');
let CrossChain             = require('../common/CrossChain');

class CrossChainBtcLockNotice extends CrossChain{
    /**
     * @param: {Object} - input
     *    {
     *        storeman         -- WAN address of storeman
     *        userH160         --
     *        hashX            --
     *        txHash           -- btc TX hash
     *        lockedTimestamp  -- 
     *
     *        from        --
     *        gasPrice    -- 
     *        gas         -- 
     *        password    -- WAN password
     *    }
     */
    constructor(input,config) {
        super(input,config);
        this.input.chainType = config.srcChainType;
        this.input.keystorePath = config.srcKeystorePath;
    }

    /**
     * Same with {@link CrossChain#checkPreCondition CrossChain#checkPreCondition}
     * @returns {{code: boolean, result: null}|transUtil.this.retResult|{code, result}}
     */
    checkPreCondition(){
        global.logger.debug("Entering CrossChainBtcLockNotice::checkPreCondition");
        // Asssume failed firstly
        this.retResult.code = false;
        if (!this.input.hasOwnProperty('from')){ 
            global.logger.error("Input missing attribute 'from'");
            return this.retResult;
        }
        if (!this.input.hasOwnProperty('storeman')){ 
            global.logger.error("Input missing attribute 'storeman'");
            return this.retResult;
        }
        if (!this.input.hasOwnProperty('userH160')){ 
            global.logger.error("Input missing attribute 'userH160'");
            return this.retResult;
        }
        if (!this.input.hasOwnProperty('gasPrice')){ 
            global.logger.error("Input missing attribute 'gasPrice'");
            return this.retResult;
        }
        if (!this.input.hasOwnProperty('gas')){ 
            global.logger.error("Input missing attribute 'gas'");
            return this.retResult;
        }
        if (!this.input.hasOwnProperty('hashX')){ 
            global.logger.error("Input missing attribute 'hashX'");
            return this.retResult;
        }
        if (!this.input.hasOwnProperty('txHash')){ 
            global.logger.error("Input missing attribute 'changeAddress'");
            return this.retResult;
        }
        if (!this.input.hasOwnProperty('lockedTimestamp')){ 
            global.logger.error("Input missing attribute 'feeRate'");
            return this.retResult;
        }
        // This is wan password!!!
        if (!this.input.hasOwnProperty('password')){ 
            global.logger.error("Input missing attribute 'password'");
            return this.retResult;
        }

        // No more need to check
        this.retResult.code = true;
        return this.retResult;
    }

    createTrans(){
        this.retResult.code = true;
        this.retResult.result = new Transaction(this.input, this.config);
        return this.retResult;
    }

    createDataCreator(){
        global.logger.debug("Entering CrossChainBtcLockNotice::createDataCreator");
        this.retResult.code = true;
        this.retResult.result = new LockNoticeDataCreator(this.input, this.config);
        return this.retResult;
    }

    createDataSign(){
        global.logger.debug("Entering CrossChainBtcLockNotice::createDataSign");
        this.retResult.code = true;
        this.retResult.result = new BtcDataSignWan(this.input, this.config);
        return this.retResult;
    }

    /**
     * @override
     * @returns {{code: boolean, result: null}|transUtil.this.retResult|{code, result}}
     */
    preSendTrans(signedData){
        // TODO: 
        global.logger.info("CrossChainBtcLockNotice::preSendTrans");
        global.logger.info("collection is :",this.config.crossCollection);
        //global.logger.info("record is :",ccUtil.hiddenProperties(record,['x']));
        //global.wanDb.insertItem(this.config.crossCollection,record);
        this.retResult.code = true;
        return this.retResult;
    }

    postSendTrans(resultSendTrans){
        global.logger.debug("Entering CrossChainBtcLockNotice::postSendTrans");
        global.logger.info("collection is :",this.config.crossCollection);
        let record = global.wanDb.getItem(this.config.crossCollection,{HashX: this.input.hashX});

        record.btcLockTxHash = this.input.txHash;
        record.crossAddress  = ccUtil.hexTrip0x(this.input.from);
        record.btcNoticeTxhash  = ccUtil.hexTrip0x(resultSendTrans);
        record.status        = "sentHashPending";

        global.logger.info("record is :",ccUtil.hiddenProperties(record,['x']));
        global.wanDb.updateItem(this.config.crossCollection,{HashX:record.HashX},record);
        this.retResult.code = true;
        return this.retResult;
    }
}
module.exports = CrossChainBtcLockNotice;
