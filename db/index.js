const sql = require("mysql2");

const { config } = require("../config-load")

const sqlConfig = config().sql;

const pool = sql.createPool(sqlConfig).promise();

function insertCredential(raw_id, raw_token, raw_key) {
    const id = sql.escape(raw_id);
    const token = sql.escape(raw_token);
    const key = sql.escape(raw_key);
    const syntax = `INSERT INTO user_cred (id, gtoken, skey) VALUES (${id}, ${token}, ${key}) ON DUPLICATE KEY UPDATE gtoken=${token}, skey=${key};`;
    return pool.query(syntax);
}

async function validateCredential(raw_id) {
    const id = sql.escape(raw_id);
    const [rows, _] = await pool.query(`SELECT gtoken, skey FROM user_cred WHERE id=${id} LIMIT 1;`);
    return rows[0];
}


module.exports = {
    insertCredential,
    validateCredential

}