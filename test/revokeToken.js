'use strict';

const { assert } = require('chai');
const WalletCore = require('../src/core/walletCore');
const { revokeState } = require('./support/stateDict');
const {config, SLEEPTIME} = require('./support/config');
const { e20OutboundInput, e20InboundInput } = require('./support/input');
const { checkHash, sleepAndUpdateStatus, revokeTokenBalance, sleepAndUpdateReceipt, ccUtil } = require('./support/utils');
const { canRevoke, getWanBalance, getEthBalance, getMultiTokenBalanceByTokenScAddr } = ccUtil;

describe('Revoke Token', () => {
    let walletCore, srcChain, dstChain, getOrigin, input, chainType;
    let beforeOrigin, beforeToken;
    let afterOrigin, afterToken;
    let ret, txHashList, revokeReceipt;
    let calBalances, revokeList = [];

    before(async function () {
        walletCore = new WalletCore(config);
        await walletCore.init();
        (global.wanDb.getCollection(walletCore.config.crossCollection)).forEach(val => {
            (canRevoke(val)).code && ['0x41623962c5d44565de623d53eb677e0f300467d2', '0x06daa9379cbe241a84a65b217a11b38fe3b4b063'].includes(val.storeman) && revokeList.push(val); 
        });
        console.log(revokeList.length);
        if(revokeList.length === 0) {
            this.skip();
        } else {
            txHashList = revokeList[0];
            const tmp = {
                x: txHashList.x,
                hashX: txHashList.hashX
            }
            if(txHashList.srcChainAddr === 'WAN') {
                srcChain = global.crossInvoker.getSrcChainNameByContractAddr('WAN', 'WAN');
                dstChain = global.crossInvoker.getSrcChainNameByContractAddr(txHashList.dstChainAddr, 'ETH');
                srcChain[2] = dstChain[1].buddy;
                getOrigin = getWanBalance;
                chainType = 'WAN';
                input = Object.assign(e20OutboundInput.revokeInput, tmp);
            } else {
                srcChain = global.crossInvoker.getSrcChainNameByContractAddr(txHashList.srcChainAddr, 'ETH');
                dstChain = global.crossInvoker.getSrcChainNameByContractAddr('WAN', 'WAN');
                srcChain[2] = srcChain[0];
                getOrigin = getEthBalance;
                chainType = 'ETH'
                input = Object.assign(e20InboundInput.revokeInput, tmp);
            }
        }
    });

    it('All Needed Balance Are Not 0', async () => {
        console.log(txHashList);
        console.log(srcChain);
        try {
            [beforeOrigin, beforeToken] = await Promise.all([
                getOrigin(txHashList.from),
                getMultiTokenBalanceByTokenScAddr([txHashList.from], srcChain[2], srcChain[1].tokenType)
            ]);
            beforeToken = beforeToken[txHashList.from];
        } catch(e) {
            console.log(`Get Account Balance Error: ${e}`);
        }
        assert.notStrictEqual(beforeOrigin, '0');
    });

    it('Send Approve&Lock Transactions', async () => {
        ret = await global.crossInvoker.invoke(srcChain, dstChain, 'REVOKE', input);
        assert.strictEqual(checkHash(ret.result), true, ret.result);
        console.log('ret:',ret);
        txHashList = global.wanDb.getItem(walletCore.config.crossCollection, {revokeTxHash: ret.result});
        while (!revokeReceipt) {
            revokeReceipt = await sleepAndUpdateReceipt(SLEEPTIME, [chainType, ret.result]);
        }
        assert.strictEqual(revokeReceipt.status, '0x1');
        while (revokeState.indexOf(txHashList.status) < revokeState.indexOf('Revoked')) {
            txHashList = await sleepAndUpdateStatus(SLEEPTIME, [walletCore.config.crossCollection, {revokeTxHash: ret.result}]);
        }
        assert.strictEqual(txHashList.status, 'Revoked');
    });

    it('The Balance After Sending Revoke Transaction', async () => {
        calBalances = revokeTokenBalance([beforeOrigin, beforeToken], revokeReceipt, input, chainType);
        try {
            [afterOrigin, afterToken] = await Promise.all([
                getOrigin(txHashList.from),
                getMultiTokenBalanceByTokenScAddr([txHashList.to], dstChain[0], dstChain[1].tokenType)
            ]);
        } catch(e) {
            console.log(`Get After LockTx Account Balance Error: ${e}`);
        }
        assert.strictEqual(afterOrigin.toString(), calBalances[0]);
        assert.strictEqual(afterToken[txHashList.to].toString(), calBalances[1]);
    })
})