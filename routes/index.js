const axios = require("axios");
const qs = require("qs");
const { v4 } = require('uuid');

const { decrypt } = require("../crypto");
const { config } = require("../config-load")

const { client_id, client_secret, redirect_uri } = config().oauth;

let object;

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
        const { access_token, refresh_token, id_token } = res.data;

        const { sub: id } = JSON.parse(atob(id_token.split(".")[1]));

        const session_key = v4();

        object = { // todo: replace w/ database access
            access_token, 
            refresh_token, 
            id,
            session_key
        };

        return {
            session_key,
            id 
        };
    } catch (e) {
        const error_code = e.response?.status;
        if (error_code != null) {
            // this is axios
            console.log(String(new Date()) + "code2Token: " + error_code);
        }
        console.log(String(new Date()) + "code2Token: " + e);
        // console.log(e);
        return undefined;
    }
}

async function token2Token(token, id, machine) {
    try {
        const saved_session_key = object?.session_key;
        if (saved_session_key == null) {
            return undefined;
        }
        const dec = await decrypt(saved_session_key, token);
        const { machine: dec_machine, id: dec_id } = JSON.parse(dec);

        if (dec_machine !== machine || dec_id !== id) {
            console.log(machine);
            return undefined;
        }

        const res = await axios({
            method: 'post',
            url: 'https://oauth2.googleapis.com/token',
            data: qs.stringify({
                refresh_token: object.refresh_token,
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
        const { id: req_id } = data;

        if (id !== req_id) {
            return undefined;
        }

        const session_key = v4();

        object = { // todo: replace w/ database access
            access_token, 
            refresh_token: object.refresh_token, 
            id,
            session_key
        };

        return {
            session_key,
            id 
        };
    } catch (e) {
        const error_code = e.response?.status;
        if (error_code != null) {
            // this is axios
            console.log(String(new Date()) + "code2Token: " + error_code);
        }
        console.log(String(new Date()) + "code2Token: " + e);
        return undefined;
    }

}

module.exports = {
    code2Token,
    token2Token
};