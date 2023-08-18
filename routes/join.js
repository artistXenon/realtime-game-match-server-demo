const axios = require("axios");

const { searchForOpenPubs, createLobby, applyJoin, clearLobby } = require("../db");
const { axiosError } = require("../error");

const servers = [
    {
        server: "localhost",
        http: 5000,
        udp: 5001,
        tcp: 5003
    }
]

async function onJoin(id, isPrivate, lobbyId, isSecondAttempt) {
    const { server, http, udp, tcp } = servers[0];

    let lobby = lobbyId;
    
    if (isPrivate) {
        if (lobbyId === "") {
            lobby = await createLobby(isPrivate, server, tcp, udp);
            try {
                const { data } = await axios({
                    method: 'get',
                    url: `http://${server}:${http}/create?id=${lobby}&private=${isPrivate}`,
                });
            } catch (e) {
                console.log(`[${new Date()}] JOIN#onJoin/create[0]: ${e.response.data}`);
            }
        } 
    } else {
        const pubs = await searchForOpenPubs();

        if (pubs.length === 0) {
            lobby = await createLobby(isPrivate, server, tcp, udp);
            try {
                const { data } = await axios({
                    method: 'get',
                    url: `http://${server}:${http}/create?id=${lobby}&private=${isPrivate}`,
                });
            } catch (e) {
                console.log(`[${new Date()}] JOIN#onJoin/create[1]: ${e.response.data}`);
            }
        } else {
            lobby = pubs[0].id;
            // TODO: use pubs[0].server
        }
    }

    try {
        const { data } = await axios({
            method: 'get',
            url: `http://${server}:${http}/join?uid=${id}&lid=${lobby}`,
        });
        // TODO: write lobby server and port from this response

        await applyJoin(id, lobby);

        return {
            server,
            udp, tcp,
            lobby
        };
    } catch (e) {
        const ae = axiosError(e);
        if (ae) {
            console.log(`[${new Date()}] JOIN#onJoin/join: ${ae.status}`);
            if (ae.response === "lobby does not exist") {
                await clearLobby(lobby);
                if (!isSecondAttempt) {
                    return await onJoin(id, isPrivate, lobbyId, true);
                }
            } 
            // else if (ae.response === "lobby is full") {
            //     // handled
            // }
        } else if (e.errno === 1452) {
            console.log("lobby does not exist");
        } else {
            neverHappens("JOIN#onJoin/join", e);
        }
        return {};
    }
}

module.exports = {
    onJoin
};
