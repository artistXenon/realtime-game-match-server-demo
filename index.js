const express = require("express");
const helmet = require("helmet");


const { code2Token, token2Token } = require("./routes");

const app = express();

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send("blyat");
});

app.post("/code", async (req, res) => {
    const code = req.query.code;
    const session = await code2Token(code);
    res.json(session);
});

app.post("/token", async (req, res) => {
    const { token, id, machine } = req.body;
    const session = await token2Token(token, id, machine);
    res.json(session);
});

app.listen(5002);

//exports.main = app;


/**
 * entry points
 * get google oauth code
 * return google id, google name, session key
 * 
 * get encrypted token, device id, google sub id
 * return google id, google name, session key
 * 
 * get join match: prv/pub lobbyid?, userid, <- req hash in session key
 * return server address
 * 
 */