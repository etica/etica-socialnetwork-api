const crypto = require('crypto');
const ethUtil = require('ethereumjs-util');

class SignatureService {
  generateSignature(apiKey, requestUrl, requestBodyString, nonce, apiSecret) {
    if (!requestBodyString) {
      requestBodyString = '';
    }

    const hmac = crypto.createHmac('sha256', apiSecret);
    hmac.update(apiKey + requestUrl + requestBodyString + nonce);
    return hmac.digest('hex');
  }

  generateRandomHex() {
    const randomBytes = crypto.randomBytes(32);
    return '0x' + randomBytes.toString('hex');
  }

  generateNewKeyPair() {
    const apiKey = crypto.randomBytes(16).toString('hex'); // Generate a 32-character API key
    const apiSecret = crypto.randomBytes(32).toString('hex'); // Generate a 64-character API secret

    return { apiKey, apiSecret };
  }

  generateRandomToken() {
    const token = crypto.randomBytes(32).toString('hex'); // Generate a 64-character API secret
    return token;
  }

  generateSecretKey() {
    // Generate a longer secret key (128 characters) by generating 64 bytes
    const token = crypto.randomBytes(64).toString('hex'); // Generate a 64-character API secret
    return token;
  }


  generateRandomHex() {
    const token = '0x' + crypto.randomBytes(32).toString('hex'); // Generate a 64-character API secret
    return token;
  }

  // Add other necessary methods as per your requirements
}

module.exports = SignatureService ;