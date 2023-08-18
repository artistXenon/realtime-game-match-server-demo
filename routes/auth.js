const axios = require("axios");
const qs = require("qs");
const { v4 } = require('uuid');

const { decrypt } = require("../crypto");
const { config } = require("../config-load")
const { insertCredential, validateCredential } = require("../db");
const { axiosError, neverHappens } = require("../error");

const { client_id, client_secret, redirect_uri } = config().oauth;

async function code2Token(code) {
    try {
        const res = await axios({
            method: 'post',
            url: 'https://oauth2.googleapis.com/token',
            data: qs.stringify({
                code,
                client_id,
                client_secret,
                redirect_uri,
                grant_type: 'authorization_code',
            }),
            headers: {
                'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        });
        const { refresh_token, id_token } = res.data;

        const { sub: id } = JSON.parse(atob(id_token.split(".")[1]));

        const session_key = v4();  
        await insertCredential(id, refresh_token, session_key);     

        return {
            session_key,
            id 
        };
    } catch (e) {
        const ae = axiosError(e);
        if (ae) {
            console.log(`[${new Date()}] AUTH#code2Token: ${ae.status}`);
        } else {
            neverHappens("AUTH#code2Token", e);
        }
        return undefined;
    }
}

async function token2Token(token, requested_id, requested_machine) {
    let tmpkey, tmptoken;
    try {
        const cred = await validateCredential(requested_id);

        const saved_session_key = cred?.skey;
        tmpkey = saved_session_key;
        if (saved_session_key == null) {
            return undefined;
        }
        const dec = await decrypt(saved_session_key, token);
        const { machine: decryted_machine, id: decrypted_id } = JSON.parse(dec);

        if (decryted_machine !== requested_machine || decrypted_id !== requested_id) {
            return undefined;
        }

        const res = await axios({
            method: 'post',
            url: 'https://oauth2.googleapis.com/token',
            data: qs.stringify({
                refresh_token: cred.gtoken,
                client_id,
                client_secret,
                grant_type: 'refresh_token',
            }),
            headers: {
                'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        });
        const { access_token } = res.data;

        const { data } = await axios({
            method: 'get',
            url: `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
        });
        const { id: validated_id } = data;
        if (requested_id !== validated_id) {
            return undefined;
        }

        const session_key = v4();

        await insertCredential(requested_id, cred.gtoken, session_key);

        return {
            session_key,
            id: requested_id 
        };
    } catch (e) {
        const ae = axiosError(e);
        if (ae) {
            console.log(`[${new Date()}] AUTH#token2Token: ${ae.status}`);
        } else {
            neverHappens("AUTH#token2Token", e);
        }
        return undefined;
    }

}

module.exports = {
    code2Token,
    token2Token
};