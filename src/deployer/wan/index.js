'use strict'

// common
let setFilePath             = require('./utils/tool').setFilePath;
let getOutputPath           = require('./utils/tool').getOutputPath;
let getNonceOffline         = require('./utils/tool').getNonce;
let updateNonce             = require('./utils/tool').updateNonce;
let initNonce               = require('./utils/scTool').initNonce;
let getNonceOnline          = require('./utils/scTool').updateNonce;
let getContractVar          = require('./utils/scTool').getContractVar;

// online
let deployLib               = require('./online/1_deployLib');
let deployContract          = require('./online/3_deployContract');
let setDependency           = require('./online/5_setDependency');
let registerToken           = require('./online/7_registerToken');
let registerSmg             = require('./online/9_registerSmg');
let update                  = require('./online/update');
let upgradeContract         = require('./online/upgradeContract');
let upgradeDependency       = require('./online/upgradeDependency');

// offline
let buildDeployContract     = require('./offline/2_buildDeployContract');
let buildSetDependency      = require('./offline/4_buildSetDependency');
let buildRegisterToken      = require('./offline/6_buildRegisterToken');
let buildRegisterSmg        = require('./offline/8_buildRegisterSmg');
let setUpgradeComponents    = require('./utils/tool').setUpgradeComponents;
let buildUpdate             = require('./offline/buildUpdate');
let buildUpgradeContract    = require('./offline/buildUpgradeContract');
let buildUpgradeDependency  = require('./offline/buildUpgradeDependency');

// test
let testDependency          = require('./test/testDependency');
let testFunction            = require('./test/testFunction');

module.exports = {
  setFilePath,
  getOutputPath,
  getNonceOffline,
  getNonceOnline,
  getContractVar,
  // deploy
  deployLib,             // step 1
  initNonce,             // called by online
  updateNonce,           // called by offline
  buildDeployContract,   // step 2
  deployContract,        // step 3
  buildSetDependency,    // step 4
  setDependency,         // step 5
  buildRegisterToken,    // step 6
  registerToken,         // step 7
  buildRegisterSmg,      // step 8
  registerSmg,           // step 9
  // upgrade
  setUpgradeComponents,  // called by offline
  buildUpgradeContract,
  upgradeContract,
  buildUpgradeDependency,
  upgradeDependency,
  // update
  buildUpdate,
  update,
  // test
  testDependency,
  testFunction
};
