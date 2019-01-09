'use strict'
let TxDataCreator = require('../common/TxDataCreator');
let ccUtil        = require('../../../api/ccUtil');

class RedeemTxBtcDataCreator extends TxDataCreator{
    /**
     * @param: {object}
     *     input: {
     *         x
     *         hashX
     *         gasPrice
     *         gas  
     *         password
     *     }
     */
    constructor(input,config) {
      super(input,config);
    }
    async createCommonData(){
        global.logger.debug("Entering RedeemTxBtcDataCreator::createCommonData");
        let input = this.input;
        let config = this.config;
        global.logger.debug("input:", input);

        if (input.x === undefined) {
            this.retResult.code = false;
            this.retResult.result = 'The x entered is invalid.';
        //} else if (input.hashX === undefined) {
        //    this.retResult.code = false;
        //    this.retResult.result = 'The hashX entered is invalid.';
        } else if (input.gasPrice === undefined) {
            this.retResult.code = false;
            this.retResult.result = 'The gasPrice entered is invalid.';
        } else if (input.gas === undefined) {
            this.retResult.code = false;
            this.retResult.result = 'The gas entered is invalid.';
        } else if (input.password === undefined) {
            this.retResult.code = false;
            this.retResult.result = 'The password entered is invalid.';
        } else {
            let key = ccUtil.hexTrip0x(this.input.x);
            let hashX = bitcoin.crypto.sha256(Buffer.from(key, 'hex')).toString('hex');
            let record = global.wanDb.getItem(this.config.crossCollection,{HashX:hashX});

            let commonData = {};
            commonData.Txtype = "0x01"; // WAN
            commonData.from  = '0x' + record.crossAddress;
            commonData.to    = config.dstSCAddr;
            commonData.value = 0;
            commonData.gasPrice = Number(input.gasPrice);//ccUtil.getGWeiToWei(input.gasPrice);
            commonData.gasLimit = Number(input.gas);
            commonData.gas = Number(input.gas);


            try {
                commonData.nonce = await ccUtil.getNonceByLocal(commonData.from, 'WAN'); // TODO:
                global.logger.info("RedeemTxEthDataCreator::createCommonData getNonceByLocal,%s",commonData.nonce);
                global.logger.debug("nonce is ", commonData.nonce);

                this.retResult.result = commonData;
                this.retResult.code   = true;
            } catch (error) {
                global.logger.error("error:", error);
                this.retResult.code = false;
                this.retResult.result = error;
            }

        }

        return this.retResult;
    }

    createContractData(){
        global.logger.debug("Entering RedeemTxBtcDataCreator::createContractData");
        let input = this.input;
        let config = this.config;
        try {
            let data = ccUtil.getDataByFuncInterface(
                config.dstAbi,  // ABI of wan
                config.dstSCAddr, // WAN HTLC SC addr
                config.redeemScFunc, // btc2wbtcRedeem
                input.x
            );
            this.retResult.code   = true;
            this.retResult.result = data;
        } catch(error) {
            this.retResult.code   = false;
            this.retResult.result = error;
        }
        return this.retResult;
    }
}

module.exports = RedeemTxBtcDataCreator;
