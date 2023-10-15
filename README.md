# realtime-match-server-demo

## Goal

- creating connection between [real-time-game-server-demo](https://github.com/artistXenon/realtime-game-server-demo) to communicate through UDP and TCP channel to exchange game data.
- creating connection between [real-time-game-client-demo](https://github.com/artistXenon/realtime-game-client-demo) to communicate through http to exchange user authentication, match-making data.
- creating reliable SQL connection to safely share same information with game-server.

## Build

1. Clone the repository.

> git clone https://github.com/artistXenon/realtime-match-server-demo.git match-server
cd match-server
> 
1. Install dependencies

> npm i
> 
1. Configure SQL server address as config.json referring to [config-load/index.js](https://github.com/artistXenon/realtime-game-match-server-demo/blob/main/config-load/index.js). 
2. Run 

> node .
>
