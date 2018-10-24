'use strict'
let ccUtil = require('../api/ccUtil');

let {
  CrossChainBtcLock,
  CrossChainBtcRedeem,
  CrossChainBtcRevoke,
  CrossChainEthLock,
  CrossChainEthRedeem,
  CrossChainEthRevoke,
  CrossChainE20Approve,
  CrossChainE20Lock,
  CrossChainE20Revoke,
  CrossChainE20Redeem
} = require('../trans/CrossChain');

let {
  NormalChainBtc,
  NormalChainE20,
  NormalChainEth
} = require('../trans/NormalChain');

/**
 * @class
 * @classdesc Class representing a class to handle cross chain.
 * SDK users can finish transfer coin or token from source chain to destination chain using this class.
 * SDK users only provide source chain info., destination chain info., action (approve,lock,redeem,revoke)
 * and the input(such as  gas, gas limit, from address, to address, amount...),SDK can draw all the configuration used
 * by system automatically
 */
class CrossInvoker {
  /**
   * @constructs
   * @param {Object} config   - The merged config from user's configuration and sdk configuration.Users' configuration
   * will override the configuration of SDK.
   *
   */
  constructor(config){
    /**
     * The merged config from user's configuration and sdk configuration.</br>
     * <pre>
     {
       port: 8545,
       useLocalNode: false,
       logPathPrex: '',
       databasePathPrex: '',
       loglevel: 'info',
       network: 'testnet',
       socketUrl: 'wss://apitest.wanchain.info',
       ethTokenAddressOnWan: '0x46397994a7e1e926ea0de95557a4806d38f10b0d',
       wanTokenAddress: 'WAN',
       ethTokenAddress: 'ETH',
       ethHtlcAddr: '0x358b18d9dfa4cce042f2926d014643d4b3742b31',
       wanHtlcAddr: '0xfbaffb655906424d501144eefe35e28753dea037',
       HtlcETHAbi:
       ethHtlcAddrE20: '0x4a8f5dd531e4cd1993b79b23dbda21faacb9c731',
       wanHtlcAddrE20: '0xfc0eba261b49763decb6c911146e3cf524fa7ebc',
       ethAbiE20:
       wanAbiE20:
       orgEthAbiE20:
       orgWanAbiE20:
       ethHtlcAddrBtc: '0xcdc96fea7e2a6ce584df5dc22d9211e53a5b18b2',
       wanHtlcAddrBtc: '0x5d1dd99ebaa6ee3289d9cd3369948e4ce96736c3',
       ethAbiBtc:
       wanAbiBtc:
       orgEthAbiBtc:
       orgWanAbiBtc:
       inStgLockEvent: 'ETH2WETHLock(address,address,bytes32,uint256)',
       outStgLockEvent: 'WETH2ETHLock(address,address,bytes32,uint256)',
       inStgLockEventE20: 'InboundLockLogger(address,address,bytes32,uint256,address)',
       outStgLockEventE20: 'OutboundLockLogger(address,address,bytes32,uint256,address)',
       dataName: 'testnet',
       rpcIpcPath: '/home/jacob/.wanchain/gwan.ipc',
       keyStorePath: '/home/jacob/.wanchain/testnet/keystore/',
       ethkeyStorePath: '/home/jacob/.ethereum/testnet/keystore/',
       databasePath: '/home/jacob/LocalDb',
       crossDbname: 'wanchainDb',
       crossCollection: 'crossTrans',
       crossCollectionBtc: 'crossTransBtc',
       normalCollection: 'normalTrans',
       wanKeyStorePath: '/home/jacob/.wanchain/testnet/keystore/',
       ethKeyStorePath: '/home/jacob/.ethereum/testnet/keystore/',
       btcKeyStorePath: '',
       confirmBlocks: 2,
       tryTimes: 3,
       consoleColor:
        { COLOR_FgRed: '\u001b[31m',
          COLOR_FgYellow: '\u001b[33m',
          COLOR_FgGreen: '\u001b[32m' },
       ccLog: 'logs/crossChainLog.log',
       ccErr: 'logs/crossChainErr.log',
       mrLog: 'logs/ccMonitorLog.log',
       mrErr: 'logs/ccMonitorErr.log',
       mrLogNormal: 'logs/ccMonitorLogN.log',
       mrErrNormal: 'logs/ccMonitorErrN.log',
       logfileName: 'logs/crossChainLog.log',
       errfileName: 'logs/crossChainErr.log',
       logfileNameMR: 'logs/ccMonitorLog.log',
       errfileNameMR: 'logs/ccMonitorErr.log',
       logfileNameMRN: 'logs/ccMonitorLogN.log',
       errfileNameMRN: 'logs/ccMonitorErrN.log'
     }
     </pre>
     * @type {Object}
     */
    this.config                 = config;
    this.tokensE20              = [];
    /**
     * All coin and token's info. including wan coin on WAN chain.
     * <pre>
     {
       'ETH' => Map {
                           'ETH' =>

                           {
                                       tokenSymbol: 'ETH',
                                       tokenStand: 'ETH',
                                       tokenType: 'ETH',
                                       buddy: '0x46397994a7e1e926ea0de95557a4806d38f10b0d',
                                       storemenGroup: [Array],
                                       token2WanRatio: 0,
                                       tokenDecimals: 18
                           },

                           '0x54950025d1854808b09277fe082b54682b11a50b' =>
                           {
                                       tokenSymbol: 'MKR',
                                       tokenStand: 'E20',
                                       tokenType: 'ETH',
                                       buddy: '0x29204554d51b6d8e7b477fe0fa4769b47f2a00ef',
                                       storemenGroup: [Array],
                                       token2WanRatio: '6000000',
                                       tokenDecimals: '18'

                           },

                           '0xdbf193627ee704d38495c2f5eb3afc3512eafa4c' =>
                           {
                                       tokenSymbol: 'DAI',
                                       tokenStand: 'E20',
                                       tokenType: 'ETH',
                                       buddy: '0xcc0ac621653faae13dae742ebb34f6e459218ff6',
                                       storemenGroup: [Array],
                                       token2WanRatio: '5000',
                                       tokenDecimals: '18'
                           },

                           '0x00f58d6d585f84b2d7267940cede30ce2fe6eae8' =>
                           {
                                       tokenSymbol: 'ZRX',
                                       tokenStand: 'E20',
                                       tokenType: 'ETH',
                                       buddy: '0xe7d648256543d2467ca722b7560a92c1dcb654bb',
                                       storemenGroup: [Array],
                                       token2WanRatio: '3000',
                                       tokenDecimals: '18'
                           },

                           '0x87271f3df675f13e8ceffa6e426d18a787267e9e' =>
                           {
                                       tokenSymbol: 'WCT',
                                       tokenStand: 'E20',
                                       tokenType: 'ETH',
                                       buddy: '0xe9585620239e4eca4f906cb0382ae9eb57d3ba3b',
                                       storemenGroup: [Array],
                                       token2WanRatio: '10000',
                                       tokenDecimals: '13'
                           }
                    },

       'BTC' => Map {
                       '0xcdc96fea7e2a6ce584df5dc22d9211e53a5b18b2' =>
                           {
                                       tokenSymbol: 'BTC',
                                       tokenStand: 'BTC',
                                       tokenType: 'BTC',
                                       buddy: '0xcdc96fea7e2a6ce584df5dc22d9211e53a5b18b2',
                                       storemenGroup: [],
                                       token2WanRatio: 0,
                                       tokenDecimals: 18
                           }
                    },

       'WAN' => Map {
                       'WAN' =>
                       {
                                       tokenSymbol: 'WAN',
                                       tokenStand: 'WAN',
                                       tokenType: 'WAN',
                                       buddy: 'WAN',
                                       storemenGroup: [Array],
                                       token2WanRatio: 0,
                                       tokenDecimals: 18
                       }
                    }

     }
     </pre>
     * @type {Map<any, any>}
     */
    this.chainsNameMap          = new Map();
    /**
     * Source chain's information  including both coin info. and configuration of cross chain.</br>
     * <pre>
     Map {
  'ETH' =>
	  Map {
				  'ETH' =>
				  {
					srcChain: 'ETH',
				  dstChain: 'WAN',
				  tokenSymbol: 'ETH',
				  tokenStand: 'ETH',
				  useLocalNode: false,
				  tokenDecimals: 18,
				  srcSCAddr: '0x358b18d9dfa4cce042f2926d014643d4b3742b31',
				  srcSCAddrKey: 'ETH',
				  midSCAddr: '0x358b18d9dfa4cce042f2926d014643d4b3742b31',
				  dstSCAddr: '0xfbaffb655906424d501144eefe35e28753dea037',
				  dstSCAddrKey: 'WAN',
				  srcAbi: [Array],
				  midSCAbi: [Array],
				  dstAbi: [Array],
				  srcKeystorePath: '/home/jacob/.ethereum/testnet/keystore/',
				  dstKeyStorePath: '/home/jacob/.wanchain/testnet/keystore/',
				  lockClass: 'CrossChainEthLock',
				  redeemClass: 'CrossChainEthRedeem',
				  revokeClass: 'CrossChainEthRevoke',
				  normalTransClass: 'NormalChainEth',
				  approveScFunc: 'approve',
				  lockScFunc: 'eth2wethLock',
				  redeemScFunc: 'eth2wethRefund',
				  revokeScFunc: 'eth2wethRevoke',
				  srcChainType: 'ETH',
				  dstChainType: 'WAN',
				  crossCollection: 'crossTrans',
				  normalCollection: 'normalTrans'
				  },
				  '0x54950025d1854808b09277fe082b54682b11a50b' =>
					{
				  srcChain: 'MKR',
				  dstChain: 'WAN',
				  tokenSymbol: 'MKR',
				  tokenStand: 'E20',
				  useLocalNode: false,
				  tokenDecimals: '18',
				  srcSCAddr: '0x54950025d1854808b09277fe082b54682b11a50b',
				  srcSCAddrKey: '0x54950025d1854808b09277fe082b54682b11a50b',
				  midSCAddr: '0x4a8f5dd531e4cd1993b79b23dbda21faacb9c731',
				  dstSCAddr: '0xfc0eba261b49763decb6c911146e3cf524fa7ebc',
				  dstSCAddrKey: 'WAN',
				  srcAbi: [Array],								// token abi
				  midSCAbi: [Array],							// HTLCETH abi
				  dstAbi: [Array],								// HTLCWAN abi
				  srcKeystorePath: '/home/jacob/.ethereum/testnet/keystore/',
				  dstKeyStorePath: '/home/jacob/.wanchain/testnet/keystore/',
				  approveClass: 'CrossChainE20Approve',
				  lockClass: 'CrossChainE20Lock',
				  redeemClass: 'CrossChainE20Redeem',
				  revokeClass: 'CrossChainE20Revoke',
				  normalTransClass: 'NormalChainE20',
				  approveScFunc: 'approve',
				  transferScFunc: 'transfer',
				  lockScFunc: 'inboundLock',
				  redeemScFunc: 'inboundRedeem',
				  revokeScFunc: 'inboundRevoke',
				  srcChainType: 'ETH',
				  dstChainType: 'WAN',
				  crossCollection: 'crossTrans',
				  normalCollection: 'normalTrans',
				  token2WanRatio: '6000000'
					},

				  '0x87271f3df675f13e8ceffa6e426d18a787267e9e' =>
				  {
				  srcChain: 'WCT',
				  dstChain: 'WAN',
				  tokenSymbol: 'WCT',
				  tokenStand: 'E20',
				  useLocalNode: false,
				  tokenDecimals: '13',
				  srcSCAddr: '0x87271f3df675f13e8ceffa6e426d18a787267e9e',
				  srcSCAddrKey: '0x87271f3df675f13e8ceffa6e426d18a787267e9e',
				  midSCAddr: '0x4a8f5dd531e4cd1993b79b23dbda21faacb9c731',
				  dstSCAddr: '0xfc0eba261b49763decb6c911146e3cf524fa7ebc',
				  dstSCAddrKey: 'WAN',
				  srcAbi: [Array],
				  midSCAbi: [Array],
				  dstAbi: [Array],
				  srcKeystorePath: '/home/jacob/.ethereum/testnet/keystore/',
				  dstKeyStorePath: '/home/jacob/.wanchain/testnet/keystore/',
				  approveClass: 'CrossChainE20Approve',
				  lockClass: 'CrossChainE20Lock',
				  redeemClass: 'CrossChainE20Redeem',
				  revokeClass: 'CrossChainE20Revoke',
				  normalTransClass: 'NormalChainE20',
				  approveScFunc: 'approve',
				  transferScFunc: 'transfer',
				  lockScFunc: 'inboundLock',
				  redeemScFunc: 'inboundRedeem',
				  revokeScFunc: 'inboundRevoke',
				  srcChainType: 'ETH',
				  dstChainType: 'WAN',
				  crossCollection: 'crossTrans',
				  normalCollection: 'normalTrans',
				  token2WanRatio: '10000'
				  }

				},

	'BTC' =>
				Map
				{
				  '0xcdc96fea7e2a6ce584df5dc22d9211e53a5b18b2' =>
				  {
				  srcChain: 'BTC',
				  dstChain: 'WAN',
				  tokenSymbol: 'BTC',
				  tokenStand: 'BTC',
				  useLocalNode: false,
				  tokenDecimals: 18,
				  srcSCAddr: '0xcdc96fea7e2a6ce584df5dc22d9211e53a5b18b2',
				  srcSCAddrKey: '0xcdc96fea7e2a6ce584df5dc22d9211e53a5b18b2',
				  midSCAddr: '0xcdc96fea7e2a6ce584df5dc22d9211e53a5b18b2',
				  dstSCAddr: '0x5d1dd99ebaa6ee3289d9cd3369948e4ce96736c3',
				  dstSCAddrKey: 'WAN',
				  srcAbi: [Array],
				  midSCAbi: [Array],
				  dstAbi: [Array],
				  srcKeystorePath: '',
				  dstKeyStorePath: '/home/jacob/.wanchain/testnet/keystore/',
				  approveClass: 'CrossChainE20Approve',
				  lockClass: 'CrossChainBtcLock',
				  redeemClass: 'CrossChainBtcRedeem',
				  revokeClass: 'CrossChainBtcRevoke',
				  normalTransClass: 'NormalChainBtc',
				  approveScFunc: 'approve',
				  lockScFunc: 'inboundLock',
				  redeemScFunc: 'inboundRedeem',
				  revokeScFunc: 'inboundRevoke',
				  srcChainType: 'BTC',
				  dstChainType: 'WAN',
				  crossCollection: 'crossTransBtc',
				  normalCollection: 'normalTrans'
				  }
				}

  }
     </pre>
     * @type {Map<any, any>}
     */
    this.srcChainsMap           = new Map();
    /**
     * Destination chain's information  including both coin info. and configuration of cross chain.</br>
     * It is similar to {@link CrossInvoker#srcChainsMap  [Destination chains info.]}
     * @type {Map<any, any>}
     */
    this.dstChainsMap           = new Map();
  };

  /**
   * Init all the configuration used for cross chain.
   * step1: get tokens info. from api server.</br>
   * step2: init all chains info.</br>
   * step3: update token or coin symbol info. and the storemengroup related to this token or coin.</br>
   * step4: init all the token or coin info. in source chains Map</br>
   * step5: init all the token or coin info. in destination chains Map</br>
   * @returns {Promise<void>}
   */
  async  init() {
    global.logger.debug("CrossInvoker init");
    try{
      global.logger.debug("getTokensE20 start>>>>>>>>>>");
      this.tokensE20              = await this.getTokensE20();
      global.logger.debug("getTokensE20 done<<<<<<<<<<");

      global.logger.debug("initChainsNameMap start>>>>>>>>>>");
      this.chainsNameMap          = this.initChainsNameMap();
      global.logger.debug("initChainsNameMap done<<<<<<<<<<");

      global.logger.debug("initChainsSymbol&&initChainsStoremenGroup start>>>>>>>>>>");
      await Promise.all(this.initChainsSymbol().concat(this.initChainsStoremenGroup()));
      global.logger.debug("initChainsSymbol&&initChainsStoremenGroup done<<<<<<<<<<");

      global.logger.debug("initSrcChainsMap start>>>>>>>>>>");
      this.srcChainsMap           = this.initSrcChainsMap();
      global.logger.debug("initSrcChainsMap done<<<<<<<<<<");

      global.logger.debug("initDstChainsMap start>>>>>>>>>>");
      this.dstChainsMap           = this.initDstChainsMap();
      global.logger.debug("initDstChainsMap done<<<<<<<<<<");

      global.logger.info("this.chainsNameMap");
      global.logger.info(this.chainsNameMap);

      global.logger.info("this.srcChainsMap");
      global.logger.info(this.srcChainsMap);

      global.logger.info("this.dstChainsMap");
      global.logger.info(this.dstChainsMap);


    }catch(error){
      global.logger.error("CrossInvoker init error: ",error);
      process.exit();
    }
  };

  /**
   * get ERC20 tokens from API server, the configuration of API server is located in ../../../../conf/config.js
   * @returns {Promise<void>}
   */
  async getTokensE20(){
    let tokensE20 = await ccUtil.getRegErc20Tokens();
    return tokensE20;
  };

  /**
   * Build all the coins and tokens information, this information is two-layer map structure.</br>
   * first layer: key is chains name(such as 'ETH', 'WAN','BTC'), value is all the tokens and coins info. on this chain.
   * second layer: key is the token unique address(currently, system use contract address of the tokens.</br>
   * second layer: value is the info. about the token or coin.</br>
   * Below is an example.
   * {@link CrossInvoker#chainsNameMap [example for chainsName]}
   * @returns {Map<any, any>} - Two layers Map including all the tokens and coins chain information.
   */
  initChainsNameMap(){
    let chainsNameMap     = new Map();
    let chainsNameMapEth  = new Map();
    let chainsNameMapBtc  = new Map();
    let chainsNameMapWan  = new Map();
    // init ETH
    let keyTemp;
    keyTemp               = this.config.ethTokenAddress;
    let valueTemp         = {};
    valueTemp.tokenSymbol = 'ETH';
    valueTemp.tokenStand  = 'ETH';
    valueTemp.tokenType   = 'ETH';
    valueTemp.buddy       = this.config.ethTokenAddressOnWan;
    valueTemp.storemenGroup = [];
    valueTemp.token2WanRatio = 0;
    valueTemp.tokenDecimals   = 18;
    chainsNameMapEth.set(keyTemp,valueTemp);

    // init E20
    for(let token of this.tokensE20){
      /**
       * key of coin or token's chain info., contract address of coin or token.
       * @member {string}  - key of the token or coin's chain info., contract address
       */
      let keyTemp;
      /**
       * value of coin or token's chain info.
       * @type {Object}   - value of the token or coin's chain info.
       */
      let valueTemp           = {};

      keyTemp                 = token.tokenOrigAddr;
      valueTemp.tokenSymbol   = '';
      valueTemp.tokenStand    = 'E20';
      valueTemp.tokenType     = 'ETH';
      valueTemp.buddy         = token.tokenWanAddr;
      valueTemp.storemenGroup = [];
      valueTemp.token2WanRatio = token.ratio;
      valueTemp.tokenDecimals   = 18;
      chainsNameMapEth.set(keyTemp, valueTemp);
    }
    chainsNameMap.set('ETH',chainsNameMapEth);

    // init BTC
    keyTemp                 = this.config.ethHtlcAddrBtc;
    valueTemp               = {};
    valueTemp.tokenSymbol   = 'BTC';
    valueTemp.tokenStand    = 'BTC';
    valueTemp.tokenType     = 'BTC';
    valueTemp.buddy         = this.config.ethHtlcAddrBtc;
    valueTemp.storemenGroup = [];
    valueTemp.token2WanRatio = 0;
    valueTemp.tokenDecimals   = 18;
    chainsNameMapBtc.set(keyTemp,valueTemp);

    chainsNameMap.set('BTC',chainsNameMapBtc);

    // init WAN
    keyTemp                 = this.config.wanTokenAddress;
    valueTemp               = {};
    valueTemp.tokenSymbol   = 'WAN';
    valueTemp.tokenStand    = 'WAN';
    valueTemp.tokenType     = 'WAN';
    valueTemp.buddy         = 'WAN';
    valueTemp.storemenGroup = [];
    valueTemp.token2WanRatio = 0;
    valueTemp.tokenDecimals   = 18;

    chainsNameMap.set(keyTemp,valueTemp);

    chainsNameMapWan.set(keyTemp,valueTemp);
    chainsNameMap.set('WAN',chainsNameMapWan);

    return chainsNameMap;
  };

  /**
   * Build promise array which is used to get the tokens' symbol and tokens' decimal
   * @returns {Array} - promise array about getting symbol
   */
  initChainsSymbol() {
    global.logger.debug("Entering initChainsSymbol...");
    let promiseArray = [];
    for (let dicValue of this.chainsNameMap.values()) {
      for(let [keyTemp, valueTemp] of dicValue){
        if (valueTemp.tokenStand === 'E20'){
          promiseArray.push(ccUtil.getErc20Info(keyTemp).then(ret => {
              global.logger.debug("tokenSymbol: tokenDecimals:", ret.symbol,ret.decimals);
              valueTemp.tokenSymbol = ret.symbol;
              valueTemp.tokenDecimals = ret.decimals;
            },
            err=>{
              global.logger.debug("initChainsSymbol err:", err);
              global.logger.debug("Symbol key deleted:", keyTemp);

              let subMap = this.chainsNameMap.get('ETH');
              subMap.delete(keyTemp);
            }));
        }
      }
    }
    return promiseArray;
  };
  /**
   * Build promise array which is used to get the storemen group information related to the token or coin.
   * @returns {Array}
   */
  initChainsStoremenGroup(){
    global.logger.debug("Entering initChainsStoremenGroup...");
    let promiseArray = [];
    for (let dicValue of this.chainsNameMap.values()) {
      for(let [keyTemp, valueTemp] of dicValue){
        switch(valueTemp.tokenStand){
          case 'ETH':
          {
            promiseArray.push(ccUtil.getEthSmgList().then(ret => valueTemp.storemenGroup = ret));
            break;
          }
          case 'E20':
          {
            promiseArray.push(ccUtil.syncErc20StoremanGroups(keyTemp).then(ret => valueTemp.storemenGroup = ret));
            break;
          }
          // case 'BTC':
          // {
          //   valueTemp.storemenGroup = await ccUtil.getEthSmgList();
          //   break;
          // }
          case 'WAN':
          {
            promiseArray.push(ccUtil.getEthSmgList().then(ret => valueTemp.storemenGroup = ret));
            break;
          }
          default:
            break;
        }
      }
    }
    return promiseArray;
  };

  /**
   * Init source chains map, this map is also a two layer map data structure.</br>
   * first layer: key is chains name(such as 'ETH', 'WAN','BTC'), value is all the tokens and coins info. on this chain.</br>
   * second layer: key is the token unique address(currently, system use contract address of the tokens.</br>
   * second layer: value is the info. which used to finish cross token or coin from source chain to destination chain.</br>
   * In this map, there is no WAN info., If the source chain in this map, it surely cross source chain to 'WAN'</br>
   * If the destination chain in destination map (dstChainsMap), it surely the source chain is 'WAN'</br>
   * Using this machine , system can decide the inbound (to 'WAN' chain)or outbound (from 'WAN')direction easily, </br>
   * and in the next cross chain step</br>
   * system gets rid of inbound or outbound decision, this sharply make service logic more easier.</br>
   * Attention : in srcChainsMap and in dstChainsMap ,there is no info. of 'WAN', because after system know</br>
   * one side non 'WAN' chain, the other side chain is surely 'WAN'.
   * Below is an example.</br>
   {@link CrossInvoker#srcChainsMap [example for source chains map]}
   * @returns {Map<any, any>}
   */
  initSrcChainsMap(){

    let srcChainsMap    = new Map();
    let srcChainsMapEth = new Map();
    let srcChainsMapBtc = new Map();

    for (let item of this.chainsNameMap) {
      let dicValue  = item[1];
      for(let chainName of dicValue){
        let tockenAddr      = chainName[0];
        let chainNameValue  = chainName[1];
        if(chainNameValue.tokenStand === 'WAN'){
          continue;
        }
        let srcChainsKey    = tockenAddr;
        let srcChainsValue  = {};
        srcChainsValue.srcChain = chainNameValue.tokenSymbol;
        srcChainsValue.dstChain = 'WAN';

        srcChainsValue.tokenSymbol  = chainNameValue.tokenSymbol;
        srcChainsValue.tokenStand   = chainNameValue.tokenStand;
        srcChainsValue.useLocalNode = this.config.useLocalNode;
        srcChainsValue.tokenDecimals = chainNameValue.tokenDecimals;

        switch(chainNameValue.tokenStand){
          case 'ETH':
          {
            srcChainsValue.srcSCAddr      = this.config.ethHtlcAddr;
            srcChainsValue.srcSCAddrKey   = tockenAddr;
            srcChainsValue.midSCAddr      = this.config.ethHtlcAddr;
            srcChainsValue.dstSCAddr      = this.config.wanHtlcAddr;
            srcChainsValue.dstSCAddrKey   = this.config.wanTokenAddress;
            srcChainsValue.srcAbi         = this.config.HtlcETHAbi;
            srcChainsValue.midSCAbi       = this.config.HtlcETHAbi;
            srcChainsValue.dstAbi         = this.config.HtlcWANAbi;
            srcChainsValue.srcKeystorePath= this.config.ethKeyStorePath ;
            srcChainsValue.dstKeyStorePath= this.config.wanKeyStorePath;
            srcChainsValue.lockClass      = 'CrossChainEthLock';
            srcChainsValue.redeemClass    = 'CrossChainEthRedeem';
            srcChainsValue.revokeClass    = 'CrossChainEthRevoke';
            srcChainsValue.normalTransClass    = 'NormalChainEth';
            srcChainsValue.approveScFunc  = 'approve';
            srcChainsValue.lockScFunc     = 'eth2wethLock';
            srcChainsValue.redeemScFunc   = 'eth2wethRefund';
            srcChainsValue.revokeScFunc   = 'eth2wethRevoke';
            srcChainsValue.srcChainType   = 'ETH';
            srcChainsValue.dstChainType   = 'WAN';
            srcChainsValue.crossCollection    = this.config.crossCollection;
            srcChainsValue.normalCollection    = this.config.normalCollection;
          }
            break;
          case 'E20':
          {
            srcChainsValue.srcSCAddr      = tockenAddr;
            srcChainsValue.srcSCAddrKey   = tockenAddr;
            srcChainsValue.midSCAddr      = this.config.ethHtlcAddrE20;
            srcChainsValue.dstSCAddr      = this.config.wanHtlcAddrE20;
            srcChainsValue.dstSCAddrKey   = this.config.wanTokenAddress;
            srcChainsValue.srcAbi         = this.config.orgEthAbiE20;
            srcChainsValue.midSCAbi       = this.config.ethAbiE20;
            srcChainsValue.dstAbi         = this.config.wanAbiE20;
            srcChainsValue.srcKeystorePath= this.config.ethKeyStorePath ;
            srcChainsValue.dstKeyStorePath= this.config.wanKeyStorePath;
            srcChainsValue.approveClass   = 'CrossChainE20Approve';
            srcChainsValue.lockClass      = 'CrossChainE20Lock';
            srcChainsValue.redeemClass    = 'CrossChainE20Redeem';
            srcChainsValue.revokeClass    = 'CrossChainE20Revoke';
            srcChainsValue.normalTransClass    = 'NormalChainE20';
            srcChainsValue.approveScFunc  = 'approve';
            srcChainsValue.transferScFunc = 'transfer';
            srcChainsValue.lockScFunc     = 'inboundLock';
            srcChainsValue.redeemScFunc   = 'inboundRedeem';
            srcChainsValue.revokeScFunc   = 'inboundRevoke';
            srcChainsValue.srcChainType   = 'ETH';
            srcChainsValue.dstChainType   = 'WAN';
            srcChainsValue.crossCollection    = this.config.crossCollection;
            srcChainsValue.normalCollection    = this.config.normalCollection;
            srcChainsValue.token2WanRatio     = chainNameValue.token2WanRatio;
          }
            break;
          case 'BTC':
          {
            srcChainsValue.srcSCAddr      = tockenAddr;
            srcChainsValue.srcSCAddrKey   = tockenAddr;
            srcChainsValue.midSCAddr      = this.config.ethHtlcAddrBtc;
            srcChainsValue.dstSCAddr      = this.config.wanHtlcAddrBtc;
            srcChainsValue.dstSCAddrKey   = this.config.wanTokenAddress;
            srcChainsValue.srcAbi         = this.config.orgEthAbiBtc;
            srcChainsValue.midSCAbi       = this.config.ethAbiBtc;
            srcChainsValue.dstAbi         = this.config.wanAbiBtc;
            srcChainsValue.srcKeystorePath= this.config.btcKeyStorePath ;
            srcChainsValue.dstKeyStorePath= this.config.wanKeyStorePath;
            srcChainsValue.approveClass   = 'CrossChainE20Approve';
            srcChainsValue.lockClass      = 'CrossChainBtcLock';
            srcChainsValue.redeemClass    = 'CrossChainBtcRedeem';
            srcChainsValue.revokeClass    = 'CrossChainBtcRevoke';
            srcChainsValue.normalTransClass    = 'NormalChainBtc';
            srcChainsValue.approveScFunc  = 'approve';
            srcChainsValue.lockScFunc     = 'inboundLock';
            srcChainsValue.redeemScFunc   = 'inboundRedeem';
            srcChainsValue.revokeScFunc   = 'inboundRevoke';
            srcChainsValue.srcChainType   = 'BTC';
            srcChainsValue.dstChainType   = 'WAN';
            srcChainsValue.crossCollection    = this.config.crossCollectionBtc;
            srcChainsValue.normalCollection    = this.config.normalCollection;
          }
            break;
          default:
            break;
        }
        switch(chainNameValue.tokenType){
          case 'ETH':
          {

            srcChainsMapEth.set(srcChainsKey,srcChainsValue);
            break;
          }
          case 'BTC':
          {
            srcChainsMapBtc.set(srcChainsKey,srcChainsValue);
            break;
          }
          default:
          {
            break;
          }
        }

      }
    }
    srcChainsMap.set('ETH',srcChainsMapEth);
    srcChainsMap.set('BTC',srcChainsMapBtc);

    return srcChainsMap;
  };

  /**
   * Build destination chains info. It is similar to source chains info.
   * {@link CrossInvoker#srcChainsMap [example for destination chains map]}
   * @returns {Map<any, any>}
   */
  initDstChainsMap(){

    let config            = this.config;
    let dstChainsMap      = new Map();

    let dstChainsMapEth   = new Map();
    let dstChainsMapBtc   = new Map();

    for (let item of this.chainsNameMap) {
      let dicValue = item[1];
      for(let chainName of dicValue){
        let tockenAddr      = chainName[0];
        let chainNameValue  = chainName[1];
        if(chainNameValue.tokenStand === 'WAN'){
          continue;
        }
        let srcChainsKey            = tockenAddr;
        let srcChainsValue          = {};
        srcChainsValue.srcChain     = 'WAN';
        srcChainsValue.dstChain     = chainNameValue.tokenSymbol;

        srcChainsValue.tokenSymbol  = chainNameValue.tokenSymbol;
        srcChainsValue.tokenStand   = chainNameValue.tokenStand;
        srcChainsValue.useLocalNode = config.useLocalNode;
        srcChainsValue.tokenDecimals = chainNameValue.tokenDecimals;

        switch(chainNameValue.tokenStand){
          case 'ETH':
          {
            srcChainsValue.srcSCAddr      = config.wanHtlcAddr;
            srcChainsValue.srcSCAddrKey   = config.wanTokenAddress;
            srcChainsValue.midSCAddr      = config.wanHtlcAddr;
            srcChainsValue.dstSCAddr      = config.ethHtlcAddr;
            srcChainsValue.dstSCAddrKey   = tockenAddr;
            srcChainsValue.srcAbi         = config.HtlcWANAbi;
            srcChainsValue.midSCAbi       = config.HtlcWANAbi;
            srcChainsValue.dstAbi         = config.HtlcETHAbi;
            srcChainsValue.srcKeystorePath= config.wanKeyStorePath ;
            srcChainsValue.dstKeyStorePath= config.ethKeyStorePath;
            srcChainsValue.lockClass      = 'CrossChainEthLock';
            srcChainsValue.redeemClass    = 'CrossChainEthRedeem';
            srcChainsValue.revokeClass    = 'CrossChainEthRevoke';
            srcChainsValue.normalTransClass = 'NormalChainEth';
            srcChainsValue.approveScFunc  = 'approve';
            srcChainsValue.lockScFunc     = 'weth2ethLock';
            srcChainsValue.redeemScFunc   = 'weth2ethRefund';
            srcChainsValue.revokeScFunc   = 'weth2ethRevoke';
            srcChainsValue.srcChainType   = 'WAN';
            srcChainsValue.dstChainType   = 'ETH';
            srcChainsValue.crossCollection    = this.config.crossCollection;
            srcChainsValue.normalCollection    = this.config.normalCollection;
          }
            break;
          case 'E20':
          {
            srcChainsValue.buddySCAddr    = chainNameValue.buddy;  // use for WAN approve
            srcChainsValue.srcSCAddr      = tockenAddr;            // use for contract parameter
            srcChainsValue.srcSCAddrKey   = config.wanTokenAddress;
            srcChainsValue.midSCAddr      = config.wanHtlcAddrE20;
            srcChainsValue.dstSCAddr      = config.ethHtlcAddrE20;
            srcChainsValue.dstSCAddrKey   = tockenAddr;
            srcChainsValue.srcAbi         = config.orgWanAbiE20;    // for approve
            srcChainsValue.midSCAbi       = config.wanAbiE20;       // for lock
            srcChainsValue.dstAbi         = config.ethAbiE20;
            srcChainsValue.srcKeystorePath= config.wanKeyStorePath ;
            srcChainsValue.dstKeyStorePath= config.ethKeyStorePath;
            srcChainsValue.approveClass   = 'CrossChainE20Approve';
            srcChainsValue.lockClass      = 'CrossChainE20Lock';
            srcChainsValue.redeemClass    = 'CrossChainE20Redeem';
            srcChainsValue.revokeClass    = 'CrossChainE20Revoke';
            srcChainsValue.normalTransClass    = 'NormalChainE20';
            srcChainsValue.approveScFunc  = 'approve';
            srcChainsValue.lockScFunc     = 'outboundLock';
            srcChainsValue.redeemScFunc   = 'outboundRedeem';
            srcChainsValue.revokeScFunc   = 'outboundRevoke';
            srcChainsValue.srcChainType   = 'WAN';
            srcChainsValue.dstChainType   = 'ETH';
            srcChainsValue.crossCollection    = this.config.crossCollection;
            srcChainsValue.token2WanRatio     = chainNameValue.token2WanRatio;
            srcChainsValue.normalCollection    = this.config.normalCollection;
          }
            break;
          case 'BTC':
          {
            srcChainsValue.srcSCAddr      = chainNameValue.buddy;
            srcChainsValue.srcSCAddrKey   = config.wanTokenAddress;
            srcChainsValue.midSCAddr      = config.wanHtlcAddrBtc;
            srcChainsValue.dstSCAddr      = config.ethHtlcAddrBtc;
            srcChainsValue.dstSCAddrKey   = config.ethHtlcAddrBtc;
            srcChainsValue.srcAbi         = config.orgWanAbiBtc;
            srcChainsValue.midSCAbi       = config.wanAbiBtc;
            srcChainsValue.dstAbi         = config.ethAbiBtc;
            srcChainsValue.srcKeystorePath= config.wanKeyStorePath ;
            srcChainsValue.dstKeyStorePath= config.btcKeyStorePath;
            srcChainsValue.approveClass   = 'CrossChainE20Approve';
            srcChainsValue.lockClass      = 'CrossChainBtcLock';
            srcChainsValue.redeemClass    = 'CrossChainBtcRedeem';
            srcChainsValue.revokeClass    = 'CrossChainBtcRevoke';
            srcChainsValue.normalTransClass    = 'NormalChainBtc';
            srcChainsValue.approveScFunc  = 'approve';
            srcChainsValue.lockScFunc     = 'inboundLock';
            srcChainsValue.redeemScFunc   = 'inboundRedeem';
            srcChainsValue.revokeScFunc   = 'inboundRevoke';
            srcChainsValue.srcChainType   = 'WAN';
            srcChainsValue.dstChainType   = 'BTC';
            srcChainsValue.crossCollection    = this.config.crossCollectionBtc;
            srcChainsValue.normalCollection    = this.config.normalCollection;
          }
            break;
          default:
            break;
        }

        switch(chainNameValue.tokenType){
          case 'ETH':
          {
            dstChainsMapEth.set(srcChainsKey,srcChainsValue);
            break;
          }
          case 'BTC':
          {
            dstChainsMapBtc.set(srcChainsKey,srcChainsValue);
            break;
          }
          default:
          {
            break;
          }
        }
      }
    }

    dstChainsMap.set('ETH',dstChainsMapEth);
    dstChainsMap.set('BTC',dstChainsMapBtc);


    return dstChainsMap;
  };

  /**
   * Check the chainName whether in source chain Map or not , if yes, the cross chain is chainName->'WAN'</br>
   * @param {Object} chainName   - {@link CrossInvoker#chainsNameMap chainName} ,chainName[0] the contract address of
   * coin or token; chainName[1] the value of toke or coin chain's info.
   * @returns {boolean}
   * true: In source chains map, the destination chain is 'WAN'</br>
   * false: Not in source chains map.
   */
  isInSrcChainsMap(chainName){
    let keyTemp   = chainName[0];
    let valueTemp = chainName[1];
    let chainType = valueTemp.tokenType;

    if(this.srcChainsMap.has(chainType)){
      let  subMap = this.srcChainsMap.get(chainType);
      if(subMap.has(keyTemp)){
        return true;
      }
    }
    return false;
  }
  /**
   * Check the chainName whether in destination chain Map or not , if yes, the cross chain is 'WAN'>chainName</br>
   * @param {Object} chainName   - {@link CrossInvoker#chainsNameMap chainName} ,chainName[0] the contract address of
   * coin or token; chainName[1] the value of toke or coin chain's info.
   * @returns {boolean}
   * true: In destination chains map, the source chain is 'WAN'</br>
   * false: Not in destination chains map.
   */
  isInDstChainsMap(chainName){
    let keyTemp   = chainName[0];
    let valueTemp = chainName[1];
    let chainType = valueTemp.tokenType;

    if(this.dstChainsMap.has(chainType)){
      let  subMap = this.dstChainsMap.get(chainType);
      if(subMap.has(keyTemp)){
        return true;
      }
    }
    return false;
  }

  /**
   * Get the source chains info. supported by system.
   * @returns {Promise<Map|*>} similar to {@link CrossInvoker#chainsNameMap this}
   */
  async getSrcChainName(){
    try{
      await this.freshErc20Symbols();
      return this.chainsNameMap;
    }catch(err){
      global.logger.debug("getSrcChainName error:",err);
      process.exit();
    }
  };

  /**
   * Get the destination chains info. after SDK users have selected the source chain.</br>
   * @param {Object}selectedSrcChainName  - {@link CrossInvoker#chainsNameMap selectedSrcChainName} ,selectedSrcChainName[0] the contract address of
   * coin or token; selectedSrcChainName[1] the value of toke or coin chain's info.
   * @returns {Map<any, any>} similar to {@link CrossInvoker#chainsNameMap this}
   */
  getDstChainName(selectedSrcChainName){
    try{
      let ret = new Map();
      if(selectedSrcChainName[1].tokenType !== 'WAN'){
        ret.set('WAN',this.chainsNameMap.get('WAN'));
      }else{
        // get new E20 symbols
        // update delete or insert E20 symbols in the old chainsName
        // update delete or insert E20 symbols in srcChainName and  dstChainName
        //await this.freshErc20Symbols();
        for(let item of this.chainsNameMap){
          if(item[0] !== 'WAN'){
            ret.set(item[0],item[1]);
          }
        }
      }
      return ret;
    }catch(err){
      global.logger.error("getDstChainName error:",err);
      process.exit();
    }
  };

  /**
   * Because during the system running, there is no Erc20 symbols added or deleted. </br>
   * system can process this scenario automatically.
   * @returns {Promise<void>}
   */
  async freshErc20Symbols(){
    global.logger.debug("Entering freshErc20Symbols");
    try{
      let tokensE20New      = await this.getTokensE20();
      global.logger.debug("freshErc20Symbols new tokens: \n",tokensE20New);
      global.logger.debug("freshErc20Symbols old tokens: \n",this.tokensE20);

      let tokenAdded     = ccUtil.differenceABTokens(tokensE20New,this.tokensE20);
      let tokenDeleted   = ccUtil.differenceABTokens(this.tokensE20,tokensE20New);
      global.logger.info("tokenAdded size: freshErc20Symbols:", tokenAdded.size,tokenAdded);
      global.logger.info("tokenDeleted size: freshErc20Symbols:",tokenDeleted.size,tokenDeleted);
      let chainsNameMapEth = this.chainsNameMap.get('ETH');
      let promiseArray          = [];
      if(tokenAdded.size !== 0){
        for(let token of tokenAdded.values()){
          // Add token
          let keyTemp;
          let valueTemp             = {};
          keyTemp                   = token.tokenOrigAddr;
          valueTemp.tokenSymbol     = '';
          valueTemp.tokenStand      = 'E20';
          valueTemp.tokenType       = 'ETH';
          valueTemp.buddy           = token.tokenWanAddr;
          valueTemp.storemenGroup   = [];
          valueTemp.token2WanRatio  = token.ratio;
          valueTemp.tokenDecimals   = 18;

          // promiseArray.push(ccUtil.syncErc20StoremanGroups(keyTemp).then(
          //   ret => valueTemp.storemenGroup = ret));

          promiseArray.push(ccUtil.getErc20Info(keyTemp).catch(tokenInfo=>{
              valueTemp.tokenSymbol   = tokenInfo.symbol;
              valueTemp.tokenDecimals = tokenInfo.decimals;
              chainsNameMapEth.set(keyTemp, valueTemp);
            },
            err=>{
              global.logger.debug("freshErc20Symbols err:", err);
            }));
        }
        await Promise.all(promiseArray);
      }else{
        global.logger.info("freshErc20Symbols no new symbols added");
      }
      if(tokenDeleted.size !== 0){
        for(let token of tokenAdded.values()){
          // delete token
          let keyTemp;
          keyTemp                 = token.tokenOrigAddr;
          chainsNameMapEth.delete(keyTemp);
        }
      }else{
        global.logger.info("freshErc20Symbols no new symbols deleted!");
      }
      // reinitialize the srcChainsMap and dstChainsMap
      if(tokenDeleted.size !== 0 || tokenAdded.size !== 0){
        this.srcChainsMap         = this.initSrcChainsMap();
        this.dstChainsMap         = this.initDstChainsMap();
      }
    }catch(err){
      global.logger.error("freshErc20Symbols error:",err);
      global.logger.debug("freshErc20Symbols error:",err);
      process.exit();
    }
  };

  /**
   * When users provide source chain, and destination chain. System can get the right keystore path </br>
   * for future use in cross chain process.
   * @param {Object}  srcChainName  - {@link CrossInvoker#chainsNameMap srcChainName} ,srcChainName[0] the contract address of
   * coin or token; srcChainName[1] the value of toke or coin chain's info.
   * @param {Object}  dstChainName - {@link CrossInvoker#chainsNameMap dstChainName} ,dstChainName[0] the contract address of
   * coin or token; dstChainName[1] the value of toke or coin chain's info.
   * @returns {Array}
   */
  getKeyStorePaths(srcChainName,dstChainName){
    let valueTemp = srcChainName[1];
    let keyStorePaths = [];
    switch(valueTemp.tokenStand){
      case 'WAN':
      {
        keyStorePaths.push({path:config.wanKeyStorePath,type:valueTemp.tokenStand });
      }
        break;
      case 'E20':
      {
        keyStorePaths.push({path:config.ethKeyStorePath,type:valueTemp.tokenStand });
      }
        break;
      case 'ETH':
      {
        keyStorePaths.push({path:config.ethKeyStorePath,type:valueTemp.tokenStand });
      }
        break;
      case 'BTC':
      {
        keyStorePaths.push({path:config.btcKeyStorePath,type:valueTemp.tokenStand });
      }
        break;
      default:
        break;
    }
    valueTemp = dstChainName[1];
    switch(valueTemp.tokenStand){
      case 'WAN':
      {
        keyStorePaths.push({path:config.wanKeyStorePath,type:valueTemp.tokenStand });
      }
        break;
      case 'E20':
      {
        keyStorePaths.push({path:config.ethKeyStorePath,type:valueTemp.tokenStand });

      }
        break;
      case 'ETH':
      {
        keyStorePaths.push({path:config.ethKeyStorePath,type:valueTemp.tokenStand });
      }
        break;
      case 'BTC':
      {
        keyStorePaths.push({path:config.btcKeyStorePath,type:valueTemp.tokenStand });
      }
        break;
      default:
        break;
    }
    return keyStorePaths;
  };

  /**
   * Get the buddy contract address, in chain info., there is two contract address. One is contract address</br>
   * on the chain, for example ZRX is ERC20 token,ZRX token has a contract address on ETH chain; The other </br>
   * contract address for token ZRX is  the contract address on WAN chain.Here the buddy contract address is the</br>
   * second contract address. System does not support get contract address on ETH by contract address on WAN</br>
   * @param {sting} contractAddr  - The coin or token's contract address,unique representing a coin or token.
   * @param {string} chainType    - enum {'ETH','WAN','BTC'}
   * @returns {string}            - The buddy address of coin or token's contract address.
   */
  getKeyByBuddyContractAddr(contractAddr,chainType){
    let chainNameSubMap =  this.chainsNameMap.get(chainType);
    for(let chainsNameItem of chainNameSubMap){
      if(chainsNameItem[1].buddy === contractAddr){
        return chainsNameItem[0];
      }
    }
    return null;
  };

  /**
   * Build the right storeman group list by srcChainName and dstChainName.</br>
   * Since each storeman group has two address, one is the address on ETH chain, the other address is on WAN.</br>
   * System can get the right address by below two parameters.
   * @param {Object}  srcChainName  - {@link CrossInvoker#chainsNameMap srcChainName} ,srcChainName[0] the contract address of
   * coin or token; srcChainName[1] the value of toke or coin chain's info.
   * @param {Object}  dstChainName - {@link CrossInvoker#chainsNameMap dstChainName} ,dstChainName[0] the contract address of
   * coin or token; dstChainName[1] the value of toke or coin chain's info.
   * @returns {Promise<Array>}
   */
  async getStoremanGroupList(srcChainName,dstChainName){

    try{
      let valueSrcTemp      = srcChainName[1];
      let valueDstTemp      = dstChainName[1];

      let keySrcTemp        = srcChainName[0];
      let keyDstTemp        = dstChainName[0];

      let storemanGroupListResult  = [];

      if (this.isInSrcChainsMap(srcChainName)){
        // destination is WAN
        // build StoremenGroupList src address list
        // get latest storemengroup

        switch(valueSrcTemp.tokenStand){
          case 'ETH':
          {
            valueSrcTemp.storemenGroup = await ccUtil.getEthSmgList();
            break;
          }
          case 'E20':
          {
            valueSrcTemp.storemenGroup = await ccUtil.syncErc20StoremanGroups(keySrcTemp);
            break;
          }
          default:
          {
            break;
          }
        }

        for(let itemOfStoreman of valueSrcTemp.storemenGroup){
          switch(valueSrcTemp.tokenStand){
            case 'ETH':
            {
              itemOfStoreman.storemenGroupAddr = itemOfStoreman.ethAddress;
              break;
            }
            case 'E20':
            {
              //itemOfStoreman.storemenGroupAddr = itemOfStoreman.smgOriginalChainAddress;
              itemOfStoreman.storemenGroupAddr = itemOfStoreman.smgOrigAddr;
              break;
            }
            default:
            {
              itemOfStoreman.storemenGroupAddr = itemOfStoreman.ethAddress;
              break;
            }
          }
          storemanGroupListResult.push(itemOfStoreman);
        }
      }else{
        if(this.isInDstChainsMap(dstChainName)){
          // source is WAN
          // build StoremenGroupList dst address list
          // get latest storemengroup

          switch(valueDstTemp.tokenStand){
            case 'ETH':
            {
              valueDstTemp.storemenGroup = await ccUtil.getEthSmgList();
              break;
            }
            case 'E20':
            {
              valueDstTemp.storemenGroup = await ccUtil.syncErc20StoremanGroups(keyDstTemp);
              break;
            }
            default:
            {
              break;
            }
          }

          for(let itemOfStoreman of valueDstTemp.storemenGroup){
            switch(valueDstTemp.tokenStand){
              case 'ETH':
              {
                itemOfStoreman.storemenGroupAddr = itemOfStoreman.wanAddress;
                break;
              }
              case 'E20':
              {
                //itemOfStoreman.storemenGroupAddr = itemOfStoreman.storemanGroup;
                itemOfStoreman.storemenGroupAddr = itemOfStoreman.smgWanAddr;
                break;
              }
              default:
              {
                itemOfStoreman.storemenGroupAddr = itemOfStoreman.wanAddress;
                break;
              }
            }
            storemanGroupListResult.push(itemOfStoreman);
          }
        }else{
          process.exit();
        }
      }
      return storemanGroupListResult;
    }catch(err){
      global.logger.error("getStoremanGroupList error:",err);
      process.exit();
    }
  };

  /**
   * Get the chain info by contract address, and the chainType.</br>
   * First, system search  value in two layer MAP by chainType. </br>
   * Second, system search value in the second layer, and get the right info. of chain</br>
   * @param contractAddr
   * @param chainType
   * @returns {null}
   */
  getSrcChainNameByContractAddr(contractAddr,chainType){
    // global.logger.debug("contractAddr",contractAddr);
    // global.logger.debug("chainType",chainType);
    if(this.chainsNameMap.has(chainType) === false){
      return null;
    }
    let subMap = this.chainsNameMap.get(chainType);
    for(let chainsNameItem of subMap){
      if(chainsNameItem[0] === contractAddr){
        return chainsNameItem;
      }
    }
    return null;
  };

  /**
   * Get the configuration used during cross chain.</br>
   * @param {Object}  srcChainName  - {@link CrossInvoker#chainsNameMap srcChainName} ,srcChainName[0] the contract address of
   * coin or token; srcChainName[1] the value of toke or coin chain's info.
   * @param {Object}  dstChainName - {@link CrossInvoker#chainsNameMap dstChainName} ,dstChainName[0] the contract address of
   * coin or token; dstChainName[1] the value of toke or coin chain's info.
   */
  getCrossInvokerConfig(srcChainName, dstChainName) {
    let config = {};
    //global.logger.debug("this.srcChainsMap:",this.srcChainsMap);
    if (srcChainName && this.isInSrcChainsMap(srcChainName)){
      // destination is WAN
      let chainType   = srcChainName[1].tokenType;
      let subMap      = this.srcChainsMap.get(chainType);
      config          = subMap.get(srcChainName[0]);
    } else {
      if (dstChainName && this.isInDstChainsMap(dstChainName)) {
        // source is WAN
        let chainType = dstChainName[1].tokenType;
        let subMap    = this.dstChainsMap.get(chainType);
        config        = subMap.get(dstChainName[0]);
      } else {
        global.logger.debug("invoke error!");
        global.logger.debug("srcChainName: ", srcChainName);
        global.logger.debug("dstChainName: ", dstChainName);
        process.exit();
      }
    }
    return config;
  };

  /**
   * Get the class, invoke this class's function run, users can finish cross chain.
   * @param crossInvokerConfig
   * @param action
   * @returns {*}
   */
  getCrossInvokerClass(crossInvokerConfig, action){
    let ACTION = action.toString().toUpperCase();
    let invokeClass = null;
    switch(ACTION){
      case 'LOCK':
      {
        invokeClass = crossInvokerConfig.lockClass;
      }
        break;

      case 'REDEEM':
      {
        invokeClass = crossInvokerConfig.redeemClass;
      };
        break;
      case 'REVOKE':
      {
        invokeClass = crossInvokerConfig.revokeClass;
      };
        break;
      case 'APPROVE':
      {
        invokeClass = crossInvokerConfig.approveClass;
      };
        break;
      default:
      {
        global.logger.debug("Error action! ", ACTION);
      }
    }
    return invokeClass;
  };

  /**
   * Get invoker which includes class, input, config ,this invoker used to finish cross chain.
   * @param crossInvokerClass
   * @param crossInvokerInput
   * @param crossInvokerConfig
   * @returns {any}
   */
  getInvoker(crossInvokerClass, crossInvokerInput, crossInvokerConfig){
    let invoke = eval(`new ${crossInvokerClass}(crossInvokerInput,crossInvokerConfig)`);
    return invoke;
  }

  /**
   * Users provide source chain info., destination chain info., and the action,input(amount, gas,gas limit..)</br>
   * 1) SDK build the configuration</br>
   * 2) SDK get the invoke class</br>
   * 3) SDK generate invoker</br>
   * 4) SDK call run function of invoker to finish cross chain.</br>
   * @param srcChainName
   * @param dstChainName
   * @param action
   * @param input
   * @returns {Promise<*>}
   */
  async invoke(srcChainName, dstChainName, action, input){
    let config      = this.getCrossInvokerConfig(srcChainName,dstChainName);
    let ACTION      = action.toString().toUpperCase();
    let invokeClass = null;

    switch(ACTION){
      case 'LOCK':
      {
        invokeClass = config.lockClass;
      }
        break;

      case 'REDEEM':
      {
        invokeClass = config.redeemClass;
      }
        break;
      case 'REVOKE':
      {
        invokeClass = config.revokeClass;
      }
        break;
      case 'APPROVE':
      {
        invokeClass = config.approveClass;
      }
        break;
      default:
      {
        global.logger.debug("Error action! ", ACTION);
        process.exit();
      }
    }
    // global.logger.debug("Action is : ", ACTION);
    // global.logger.debug("invoke class : ", invokeClass);
    // global.logger.debug("config is :",config);
    // global.logger.debug("input is :",input);
    let invoke = eval(`new ${invokeClass}(input,config)`);
    let ret = await invoke.run();
    return ret;
  }

  /**
   * This function is used to transfer coin or token on the same chain.</br>
   * Source chain name and destination chain name is same.</br>
   * For example:</br>
   * ETH->ETH, ETH(ZRX)->ETH(ZRX),WAN->WAN</br>
   * @param srcChainName
   * @param input
   * @returns {Promise<*>}
   */
  async  invokeNormalTrans(srcChainName, input){
    let config;
    let dstChainName  = null;
    if(srcChainName[1].tokenType === 'WAN'){
      // on wan chain: coin WAN->WAN
      dstChainName    = ccUtil.getSrcChainNameByContractAddr(this.config.ethTokenAddress,'ETH');
    }
    config            = this.getCrossInvokerConfig(srcChainName,dstChainName);
    global.logger.debug("invokeNormalTrans config is :",config);
    let invokeClass;
    invokeClass       = config.normalTransClass;
    global.logger.debug("invokeNormalTrans invoke class : ", invokeClass);
    let invoke        = eval(`new ${invokeClass}(input,config)`);
    let ret           = await invoke.run();
    return ret;
  }

  /**
   * This function is used to transfer coin or token on the same chain.</br>
   * Source chain name and destination chain name is same.</br>
   * For example:</br>
   * ETH->ETH, ETH(ZRX)->ETH(ZRX),WAN->WAN;</br>
   * WAN(WETH)->WAN(WETH), WAN(WZRX)->WANWZRX),WAN(WBTC)->WAN(WBTC)</br>
   * @param srcChainName
   * @param dstChainName
   * @param input
   * @returns {Promise<*>}
   */
  async  invokeNormal(srcChainName,dstChainName,input){
    let config;
    // on wan chain: support  WZRX->WZRX, WETH->WETH
    config            = this.getCrossInvokerConfig(srcChainName,dstChainName);
    global.logger.debug("invokeNormal config is :",config);
    let invokeClass;
    invokeClass       = config.normalTransClass;
    global.logger.debug("invokeNormal invoke class : ", invokeClass);
    let invoke        = eval(`new ${invokeClass}(input,config)`);
    let ret           = await invoke.run();
    return ret;
  }
}
module.exports = CrossInvoker;