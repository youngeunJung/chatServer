// const Chat = require("../Models/chat")
const mysql = require("mysql");
const dbconfig = require("../config/database");
const connection = mysql.createPool(dbconfig);
const util = require('util');
const queryAsync = util.promisify(connection.query).bind(connection);

const chatController = {};

chatController.saveChat = async(rid, message, user) => {
    console.log("saveChat");
    const room = await queryAsync (`select roomToken from room where room = ?`, [rid]);
    const roomToken = room.map(data => ({ roomToken: data.roomToken}));
    console.log("!!!!!!!!!!!!!!!!!!!!1", roomToken);
    
    const newMessage = await connection. query (`insert into chat (roomToken, token, chat) values (?, ?, ?)`
    , [roomToken[0].roomToken, user[0].token, message, user] , (err , result) => {
        if(err) console.log("err:" , err.message);
        console.log("newMessage:::::::", newMessage.values);
        console.log("result:::: ", result);
    });
    return {roomToken: newMessage.values[0], chat: newMessage.values[2], user: newMessage.values[3]};
};

module.exports = chatController;