const sql = require("mysql2");

const { config } = require("../config-load")

const sqlConfig = config().sql;

const pool = sql.createPool(sqlConfig).promise();


(async () => {
    const [rows, fields] = await pool.query(`SELECT current_timestamp;`);
    console.log(rows, fields);
})();


// CREATE TABLE lobby (id char(5) PRIMARY KEY, server TINYTEXT, private boolean, started boolean)
// CREATE TABLE user_cred (id DECIMAL(21) PRIMARY KEY, gtoken TINYTEXT, skey CHAR(36), lid char(5) references lobby(id))
// optional: CREATE TABLE user_info (level smallint, progress smallint)
// optional: CREATE TABLE cosmetics (uid DECINAML(21), cosmetics /* array of ids */)




// on code: server
// get token from google
// get sub id, name from token
// generate session key
// sql insert or update user w/ info
// response w/ session key and google id and google name
// on code: client
// save google id and session token w/ session key (google id, device id)
// use session key, google name, google id in memory

// on session token & device id & google id: server
// get previous session key from db
// decrypt token w/ session key
// compare sent device id, google id w/ decrypted device id, google id
// generate session key
// sql update session key
// response w/ new session key and google id and google name
// on session token: client
// save google id and session token w/ session key (google id, device id)
// use session key, google name, google id in memory

// join
// sql select from lobby where pub not started
// while not granted
//      request join to game servers
// 





// ABANDON?
// get pub matches
// sql select from lobby where pub not started
// if none: 
//      query gaming server to create match
//      sql insert lobby 
// response list of lobbies w/ their address
// get pub matches: client
// query game server for join. 
// join (google id and hash): game server
// if full reject
// sql select user 
// validate google id 
// sql update user w/ new lobby


