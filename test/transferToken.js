'use strict';

const { assert } = require('chai');
const WalletCore = require('../src/core/walletCore');
const {config, SLEEPTIME} = require('./support/config');
const { transferTokenInput } = require('./support/input');
const { checkHash, sleepAndUpdateReceipt, normalTokenBalance, ccUtil } = require('./support/utils');

describe('Transfer Token On ETH From A to B', () => {
    let walletCore, srcChain, ret, receipt, calBalances;
    let beforeFromETHBalance, beforeFromTokenBalance, beforeToTokenBalance;
    let afterFromETHBalance, afterFromTokenBalance, afterToTokenBalance;

    before(async () => {
        walletCore = new WalletCore(config);
        await walletCore.init();
        srcChain = global.crossInvoker.getSrcChainNameByContractAddr(transferTokenInput.tokenAddr, 'ETH')
    });
    it('Address Balance is not 0', async () => {
        try {
            [beforeFromETHBalance, beforeFromTokenBalance, beforeToTokenBalance] = await Promise.all([
                ccUtil.getEthBalance(transferTokenInput.from),
                ccUtil.getMultiTokenBalanceByTokenScAddr([transferTokenInput.from], srcChain[0], srcChain[1].tokenType),
                ccUtil.getMultiTokenBalanceByTokenScAddr([transferTokenInput.to], srcChain[0], srcChain[1].tokenType),
            ]);
            [beforeFromTokenBalance, beforeToTokenBalance] = [beforeFromTokenBalance[transferTokenInput.from], beforeToTokenBalance[transferTokenInput.to]];
        } catch(e) {
            console.log(`Get Account Balance Error: ${e}`);
        }
        assert.notStrictEqual(beforeFromETHBalance, '0');
        assert.notStrictEqual(beforeFromTokenBalance, '0');
    })
    it('Send Transfer Transaction', async () => {
        ret = await global.crossInvoker.invokeNormalTrans(srcChain, transferTokenInput);
        console.log('ret:', ret);
        assert.strictEqual(checkHash(ret.result), true, ret.result);
        while (!receipt) {
            receipt = await sleepAndUpdateReceipt(SLEEPTIME, ['ETH', ret.result])
        }
        assert.strictEqual(receipt.status, '0x1');
    })
    it('Check Balance After Sending Transaction', async () => {
        calBalances = normalTokenBalance([beforeFromETHBalance, beforeFromTokenBalance, beforeToTokenBalance], receipt, transferTokenInput);
        try {
            [afterFromETHBalance, afterFromTokenBalance, afterToTokenBalance] = await Promise.all([
                ccUtil.getEthBalance(transferTokenInput.from),
                ccUtil.getMultiTokenBalanceByTokenScAddr([transferTokenInput.from], srcChain[0], srcChain[1].tokenType),
                ccUtil.getMultiTokenBalanceByTokenScAddr([transferTokenInput.to], srcChain[0], srcChain[1].tokenType),
            ]);
        } catch(e) {
            console.log(`Get After TX Account Balance Error: ${e}`);
        }
        assert.strictEqual(afterFromETHBalance.toString(), calBalances[0]);
        assert.strictEqual(afterFromTokenBalance[transferTokenInput.from].toString(), calBalances[1]);
        assert.strictEqual(afterToTokenBalance[transferTokenInput.to].toString(), calBalances[2]);
    })

});