const { scryptSync, createCipheriv, createDecipheriv, createHash } = require("crypto");

const algorithm = 'aes-192-cbc';
const iv = Buffer.alloc(16, 0);
// First, we'll generate the key. The key length is dependent on the algorithm.
// In this case for aes192, it is 24 bytes (192 bits).

function encrypt(password, plain) {
    return new Promise((resolve) => {
        const key = scryptSync(password, 'salt', 24);

        const cipher = createCipheriv(algorithm, key, iv);
    
        let encrypted = cipher.update(plain, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        resolve(encrypted);
    });    
}

function decrypt(password, code) {
    return new Promise((resolve) => {
        const key = scryptSync(password, 'salt', 24);
        // The IV is usually passed along with the ciphertext.
        
        const decipher = createDecipheriv(algorithm, key, iv);
        
        // Encrypted using same algorithm, key and iv.
        let decrypted = decipher.update(code, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        resolve(decrypted);
    });
}

function hashCheck(values, hash) {
    values.sort();
    const plain = values.join('');
    const generated_hash = createHash('sha256').update(plain).digest('base64');
    return generated_hash === hash;
}

module.exports = {
    encrypt,
    decrypt,
    hashCheck
};