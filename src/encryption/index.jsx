import RSA from "node-rsa";
import aes from "browserify-aes";
import SessionSelectors from "../authenticate/selectors";
import { keyReducer } from "../reducers/key.reducer";
import { store } from "../store";
import { Buffer } from "buffer";


const CRYPTO = Symbol("Crypto");
const CRYPTO_SINGLE = Symbol("CyptoSingle");
const CRYPTO_KEY = Symbol("Mozilla");

const convertToPEM = (text, type) => {
    let pem = `-----BEGIN ${type} KEY-----\n`;
    for (let i = 0; i < text.length; i = i + 64) {
        let end = i + 64;
        if (end > text.length) {
            end = text.length;
        }
        pem += text.slice(i, end) + "\n";
    }
    pem += `-----END ${type} KEY-----`;
    return pem;
};

/**
 * @access public
 * Crypto class is used to encrypt and decrypt SecureDTO messages from the API.
 * The basic requirements for the class is that there is a public key and key for
 * AES encryption set before using encrypt and decrypt functions.
 *
 * The steps to use are:
 * 1) Set public key using setPublicKey
 * 2) Generate the AES key and encrypt it using the public key using encryptKey
 *
 * After this you can use the functions.  We are using AES-256-GCM, which requires the use of
 * a 12 byte initialization vector (IV)
 *
 * @see {http://redmine.konami.net/wiki/functional_specs/api/4.0/security/secure_data_transfer_object}
 */
class Crypto {
    cipher = "aes-256-gcm";

    static getInstance = () => {
        if (!window[CRYPTO]) {
            window[CRYPTO] = new Crypto(CRYPTO_SINGLE);
            // move a call to `window[CRYPTO].rehydrate()` to the end of the call stack so that it
            // doesn't interfere in an import thread
            // setTimeout(window[CRYPTO].rehydrate, 0)
            Object.defineProperties(window, {
                [CRYPTO]: { enumerable: false },
            });
        }
        return window[CRYPTO];
    };

    constructor(INSTANCE) {
        if (INSTANCE !== CRYPTO_SINGLE) {
            throw new Error("Use getInstance");
        }
    }

    // This was designed like this to ensure that in the console the key and public key were
    // not visible and not accessible
    keys = (() => {
        let publicKey = null;
        let valid = false;

        return {
            getPublicKey: (req) => (req !== CRYPTO_KEY ? null : publicKey),
            setPublicKey: (req, value) => {
                if (req !== CRYPTO_KEY) {
                    return null;
                }
                publicKey = value;
            },
            isValid: (req) => (req !== CRYPTO_KEY ? null : valid),
            setValid: (req, value) => {
                if (req !== CRYPTO_KEY) {
                    return null;
                }
                valid = value;
            },
        };
    })();

    /**
     * decrypt is used to decrypt encrypted data.
     * @property {Object} encrypted
     * @param {string} encrypted.data
     * @param {string} encrypted.iv
     * @return {string} text
     */
    decrypt = (encrypted, state) => {
        return SessionSelectors.data
            .getKey(state)
            .then((key) => this.syncDecrypt(encrypted, key));
    };

    /**
     * encrypt is used to encrypt the data and returns an object with the encrypted data and the IV
     * @param {string} decrypted
     * @return {Object} encrypted
     */
    encrypt = (decrypted, state) => {
        return SessionSelectors.data
            .getKey(state)
            .then((key) => this.syncEncrypt(decrypted, key));
    };

    encryptInline = (decrypted, key) => {
        if (key) {
            const iv = this._generate(12);
            const crypter = aes.createCipheriv(this.cipher, key, iv);
            const encrypted = [];
            encrypted.push(iv);
            encrypted.push(crypter.update(decrypted, "utf8"));
            encrypted.push(crypter.final());
            encrypted.push(crypter.getAuthTag());
            return `enc:${Buffer.concat(encrypted).toString("base64")}`;
        } else {
            return decrypted;
        }
    };

    /**
     * Used to generatre shared key and encrypt it using the public RSA key
     * @returns {Buffer} encryptedKey
     */
    encryptKey = () => {
        if (!this.keys.getPublicKey(CRYPTO_KEY)) {
            // eslint-disable-next-line prefer-promise-reject-errors
            return Promise.reject("Public Key must be set before encrypting a key");
        }
        return new Promise((resolve, reject) => {
            try {
                const key = new RSA(
                    convertToPEM(this.keys.getPublicKey(CRYPTO_KEY), "PUBLIC"),
                    {
                        environment: "browser",
                        encryptionScheme: "pkcs1",
                    }
                )

                const k = this.generateKey().toString("hex");
                store.dispatch(keyReducer({ key: k }));
                console.log(key)
                const hardcoded_key ="kn93QMQCxQFDl0HJ9crB8JX6SvlZYSHBl1k4yLVCXLIySxuM9JitlT9NXt/DrSTGlouX1l3Y7M4Z6y1zSeWPUXi6/9XlxcPKyKvVan4oehcD+xLwM4VmDpF1+dlu5veN1jriMO+llfDM/3GVTMfpwDsBzE4/4Nu2xt9B31W6v9UKA1npod7Q2c6EbLbZyRInXc/EABHiGg0qSuaU3v4P6+zFab0r0mueRx3Cm9q/7NAXFkeXlyHJrVyqzn+JMlgloi16OzsKYzA4Ld69DSShwNZIlPARD902OcZsY93pMs03T4hoJxxPwXHweUZ1Q4Qoo4jVkoj3JjkNzBsAsXUvgQ=="
                return hardcoded_key
                // return resolve(key.encrypt(k, "buffer", "hex").toString("base64"));
            } catch (e) {
                // eslint-disable-next-line prefer-promise-reject-errors
                return reject( e);
            }
        });
    };

    /**
     * Generates random values, stores them in a Buffer
     * @returns {Buffer}
     */
    _generate = (len = 16) => {
        const buf = Buffer.alloc(len);
        window.crypto.getRandomValues(buf);
        return buf;
    };

    getPublicKey = () => this.keys.getPublicKey(CRYPTO_KEY);

    /**
     * Used to generate a random 32 byte key
     * @returns {Buffer} key
     */
    generateKey = () => this._generate(32);

    setPublicKey = (publicKey) => {
        if (!publicKey || publicKey === "") {
            throw new Error("Public Key cannot be null or an empty string");
        }
        this.keys.setPublicKey(CRYPTO_KEY, publicKey);
    };

    syncDecrypt = (encrypted, key) => {
        if (key) {
            const data = Buffer.from(encrypted.data, "base64");
            const tag = data.slice(data.length - 16, data.length);
            const text = data.slice(0, data.length - 16);
            const iv = Buffer.from(encrypted.iv, "base64");

            const decrypt = aes.createDecipheriv(this.cipher, key, iv);
            const out = [];
            decrypt.setAuthTag(tag);
            out.push(decrypt.update(text, "ascii", "utf8"));
            out.push(decrypt.final("utf8"));
            return out.join("");
        }
        return encrypted.data;
    };

    syncEncrypt = (decrypted, key) => {
        if (key) {
            const iv = this._generate(12);
            const crypter = aes.createCipheriv(this.cipher, key, iv);
            const encrypted = [];
            encrypted.push(crypter.update(decrypted, "utf8"));
            encrypted.push(crypter.final());
            encrypted.push(crypter.getAuthTag());
            return {
                data: Buffer.concat(encrypted).toString("base64"),
                iv: iv.toString("base64"),
            };
        }
        return { data: decrypted };
    };

    verify = (plainText, encrypted, iv, state) => {
        if (plainText && encrypted && iv) {
            return this.decrypt({ data: encrypted, iv }, state).then((test) => {
                this.keys.setValid(CRYPTO_KEY, test === plainText);
            });
        }
        this.keys.setValid(CRYPTO_KEY, false);
        return Promise.resolve();
    };

    /* decryptInline = encrypted => {
      if (this.keys.getKey(CRYPTO_KEY)) {
        encrypted = encrypted.replaceAll('enc:', '')
        const data = Buffer.from(encrypted, 'base64')
        const tag = data.slice(data.length - 16, data.length)
        const text = data.slice(12, data.length - 16)
        const iv = data.slice(0, 12)
  
        const decrypt = aes.createDecipheriv(this.cipher, this.keys.getKey(CRYPTO_KEY), iv)
        const out = []
        decrypt.setAuthTag(tag)
        out.push(decrypt.update(text, 'ascii', 'utf8'))
        out.push(decrypt.final('utf8'))
        return out.join('')
      } else {
        return encrypted.replaceAll('enc:', '')
      }
    } */

    /**
     * Returns if the Crypto class will be encoding and decoding data from the server
     */
    /* isValid = () => {
      return this.keys.isValid(CRYPTO_KEY)
    } */

    /**
     * Used to decrypt key using private key
     * @param {string} privateKey The private key used to decrypt the key
     * @param {string} key        The key that has been encrypted
     * @returns {Buffer} key      The key that has been decrypted
     */
    /* decryptKey = (privateKey, key) => {
      if (!privateKey) {
        throw new Error('Private Key must be set')
      }
      try {
        const key = new RSA(convertToPEM(privateKey, 'PRIVATE'), {
          environment      : 'browser',
          encryptionScheme : 'pkcs1'
        })
        const k = key.decryptPrivate(key, 'buffer')
        return k
      } catch (e) {
        throw new Error('decryption error')
      }
    } */

    /**
     * Used to destroy the current instance, usually when a new public key is requested
     * or when a user logs off.
     */
    /* destroyInstance = () => {
      if (window[CRYPTO]) {
        window[CRYPTO] = new Crypto(CRYPTO_SINGLE)
      }
    } */

    /* rehydrate = () => {
      Promise.all([SynkUI.getSharedPublicKey(), SynkUI.getSharedSecureKey()])
        .then(([publicKey, secureKey]) => {
          const key = new Uint8Array(secureKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))
          try {
            this.setPublicKey(publicKey)
            this.keys.setKey(CRYPTO_KEY, key)
            this.keys.setValid(CRYPTO_KEY, true)
            console.log('rehydrated true')
            return true
          } catch (e) {
            this.keys.setValid(CRYPTO_KEY, false)
            console.log('rehydrated false')
            return false
          }
        })
        .catch(() => {
          console.log('rehydrated false')
          return false
        })
    } */
}

export default Crypto.getInstance();
