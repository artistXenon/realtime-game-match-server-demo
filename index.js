const express = require("express");
const helmet = require("helmet");

const { code2Token, token2Token, onJoin } = require("./routes");
const { hashCheck } = require("./crypto");

const app = express();

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send(
        "you don't usually reach here unless you are me..\n" + 
        "your connection is recorded and will be further inspected for suspicious requests in near future."
    );
});

app.post("/code", async (req, res) => {
    const { code } = req.query;
    const session = await code2Token(code);
    if (session === undefined) {
        return res.status(400).send("err");
    }
    res.json(session);
});

app.post("/token", async (req, res) => {
    const { token, id, machine } = req.body;
    const session = await token2Token(token, id, machine);
    if (session === undefined) {
        return res.status(400).send("err");
    }
    res.json(session);
});

app.post("/join", async (req, res) => {
    const { private, lobby } = req.query;
    const { id, hash } = req.body;
    const vals = [ id, private ];
    if (lobby !== undefined) {
        vals.push(lobby);
    }
    if (!hashCheck(vals, hash)) {
        return res.status(400).send("err");
    }
    const lobbyRes = await onJoin(id, private === "true", lobby);
    // todo: route function for creating/joining lobby to return server address and lobby id

    res.json(lobbyRes);
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