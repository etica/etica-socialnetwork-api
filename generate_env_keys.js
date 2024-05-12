const SignatureService = require('./src/services/SignatureService');

const signatureService = new SignatureService();

async function generateKeys(){

    const envKeys = {};
    envKeys.SECRETKEY = await signatureService.generateSecretKey();
    envKeys.REGISTERCHALLENGE = await signatureService.generateRandomHex();
    
    console.log('Random generated keys to use in .env:', envKeys);
    return envKeys;

}

generateKeys();
