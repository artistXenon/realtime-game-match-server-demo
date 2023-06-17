const axios = require("axios");

const { searchForOpenPubs, createLobby, applyJoin, clearLobby } = require("../db");

const MAIN_SERVER_UDP = 'localhost:5001';
const MAIN_SERVER_HTTP = 'localhost:5000';

async function onJoin(id, isPrivate, lobbyId, isSecondAttempt) {
    const server = "localhost";
    const port = 5001;

    let lobby = lobbyId;
    
    if (isPrivate) {
        if (lobbyId === "") {
            lobby = await createLobby(isPrivate, MAIN_SERVER_UDP);
        } 
    } else {
        const pubs = await searchForOpenPubs();

        if (pubs.length === 0) {
            lobby = await createLobby(isPrivate, MAIN_SERVER_UDP);
            try {
                const { data } = await axios({
                    method: 'get',
                    url: `http://${MAIN_SERVER_HTTP}/create?id=${lobby}&private=${isPrivate}`,
                });
            } catch (e) {
                console.log(e.response.data);
            }
        } else {
            lobby = pubs[0].id;
            // TODO: use pubs[0].server
        }
    }

    await applyJoin(id, lobby);
    try {
        const { data } = await axios({
            method: 'get',
            url: `http://${MAIN_SERVER_HTTP}/join?uid=${id}&lid=${lobby}`,
        });
        // TODO: write lobby server and port from this response

        return {
            server,
            port,
            lobby
        };
    } catch (e) {
            const error_code = e.response?.status;
            // this is axios
            if (error_code != null) {
                const response = e.response.data;
                if (response === "lobby does not exist") {
                    await clearLobby(lobby);
                    if (!isSecondAttempt) {
                        return await onJoin(id, isPrivate, lobbyId, true);
                    }
                    console.log(response);
                }
            } else console.log(e);
        return {};
    }
}

module.exports = {
    onJoin
};
