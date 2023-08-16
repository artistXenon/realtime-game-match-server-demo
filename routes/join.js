const axios = require("axios");

const { searchForOpenPubs, createLobby, applyJoin, clearLobby } = require("../db");

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
                console.log(e?.response?.data);
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
                console.log(e.response.data);
            }
        } else {
            lobby = pubs[0].id;
            // TODO: use pubs[0].server
        }
    }

    try {
        await applyJoin(id, lobby);
        const { data } = await axios({
            method: 'get',
            url: `http://${server}:${http}/join?uid=${id}&lid=${lobby}`,
        });
        // TODO: write lobby server and port from this response

        return {
            server,
            udp, tcp,
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
            } else if (e.errno === 1452) {
                console.log("lobby does not exist");
            } else {
                console.log(e);
            }
        return {};
    }
}

module.exports = {
    onJoin
};
