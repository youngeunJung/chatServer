const {createServer} = require('http');   //app = 데이터 + websocket 얹기
const app = require('./app');
const {Server} = require('socket.io');
require('dotenv').config();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors:{
        origin: "http://localhost:3000" //front end 주소 (3000번만 port 5001번에 접근 가능해!!)
    }
});

require("./utils/io")(io);

httpServer.listen(process.env.PORT, () =>{
    console.log("server listening on port", process.env.PORT);
});


