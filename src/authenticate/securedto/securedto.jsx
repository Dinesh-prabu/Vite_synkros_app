import axios from "axios";
import Crypto from "../../encryption";

const testPhrase = "When I let go of who I am, I become what I might be";

/**
 * @see {http://redmine.konami.net/wiki/functional_specs/api/4.0/security/secure_data_transfer_object}
 */
export default class SecureDTO {
	static authenticate = (login) => (dispatch, getState) => {
		const publicKey = Crypto.getPublicKey();
		return Crypto.encryptKey(dispatch).then((key) =>
		console.log(key,"hiui"),
			Crypto.encrypt(testPhrase, getState()).then(async (sharedKey) => {
				Crypto.setPublicKey(publicKey);
				const uri = "v1/security/keys";
				const headers = {
					"X-Public-Key": `RSA="${publicKey}"`,
					"X-Key-Exchange": `RSA="${key}"; AES`,
					"X-Key-Verify": `plainText="${testPhrase}", AES="${sharedKey.data}", iv="${sharedKey.iv}"`,
					"Authorization": 'Basic ' + btoa(login.username + ':' + login.password)
				};
				return axios.put(uri, "", { headers }).then((res) => res).catch(err => err.response);
			})
		);
	};
}
