const fs = require('fs');
const keythereum = require('keythereum');
const wanUtil = require('wanchain-util');

class Account {
  constructor(fileName) {
    try {
      this.keystore = JSON.parse(fs.readFileSync(fileName, "utf8"));
    } catch (e) {
      this.keystore = null;
    }
  }

  getPrivateKey(password) {
    return this.getPrivateKeyFunc({
      version: this.keystore.version,
      crypto: this.keystore.crypto
    }, password);
  }

  getWanPrivateKey(password) {
    return this.getPrivateKeyFunc({
      version: this.keystore.version,
      crypto: this.keystore.crypto2
    }, password);
  }

  getPrivateKeyFunc(cryptoObj, password) {
    let privateKey;
    try {
      privateKey = keythereum.recover(password, cryptoObj);
    } catch (e) {
      global.logger.debug('Wrong Password!');
      return null;
    }
    return privateKey;
  }

  getAddress() {
    return `0x${this.keystore.address}`.toLowerCase();
  }

  getWaddress() {
    return `0x${this.keystore.waddress}`.toLowerCase();
  }

  getOTAPrivateKey(password, OTAAddress) {
    let privateKey = this.getPrivateKey(password);
    let wanKey = this.getWanPrivateKey(password);
    if (privateKey && wanKey) {
      return wanUtil.computeWaddrPrivateKey(OTAAddress, privateKey, wanKey);
    }
    return null;
  }
}

module.exports = Account;