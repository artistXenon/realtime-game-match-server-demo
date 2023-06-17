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

async function searchForOpenPubs() {
    const [rows, _] = await pool.query(`SELECT id, server FROM lobby WHERE private=false AND started=false LIMIT 5;`);
    return rows;
}

async function createLobby(raw_private, raw_server) {
    const raw_id = randomLobbyID();
    const id = sql.escape(raw_id);
    const isPrivate = raw_private === true;
    const server = sql.escape(raw_server);
    const syntax = `INSERT INTO lobby (id, server, private, started) VALUES (${id}, ${server}, ${isPrivate}, false);`;
    try {
        await pool.query(syntax);   
        return raw_id;
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
            return await createLobby(raw_private, raw_server); // TODO: this is very inefficient. do notice.
        } else {
            console.log(e);
        }
    }
}

async function clearLobby(lobbyId) {
    const id = sql.escape(lobbyId)
    const syntax = `DELETE FROM lobby WHERE id=${id} LIMIT 1;`;
    try {
        return await pool.query(syntax);
    } catch (e) {}
}

function applyJoin(raw_user_id, raw_lobby_id) {
    const user_id = sql.escape(raw_user_id);
    const lobby_id = sql.escape(raw_lobby_id);
    const syntax = `UPDATE user_cred SET lid=${lobby_id} WHERE id=${user_id};`;
    return pool.query(syntax);
}


function randomLobbyID() {
    const map = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`;
    let id = '';
    id += map[Math.floor(Math.random() * map.length)]
    id += map[Math.floor(Math.random() * map.length)]
    id += map[Math.floor(Math.random() * map.length)]
    id += map[Math.floor(Math.random() * map.length)]
    id += map[Math.floor(Math.random() * map.length)]
    return id;
}

// insert into ab (a) values (cast(117324779009017873395 as binary)); // 65C3558E537B783F3
// select cast(a as decimal(21)) as ai from ab;



module.exports = {
    insertCredential,
    validateCredential,
    searchForOpenPubs,
    createLobby,
    clearLobby,
    applyJoin
}
