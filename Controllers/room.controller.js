const mysql = require("mysql");
const dbconfig = require("../config/database");
const connection = mysql.createPool(dbconfig);
const util = require('util');
const queryAsync = util.promisify(connection.query).bind(connection);

const roomController = {};
roomController.getAllRooms = async () => {
  try{
    const rooms = await queryAsync(`select r.*, ifnull(chatCount.roomTokenCount,0) as roomTokenCount from room as r
    left join (select roomToken, count(roomToken) as roomTokenCount from chat group by roomToken)as chatCount
    on r.roomToken = chatCount.roomToken;`);
    console.log("roomList::::", rooms);
    
    const roomList = rooms.map(data =>({roomToken: data.roomToken,room: data.room, count: data.roomTokenCount}));
    console.log('roomrist:::::::::::', roomList);
    
    return roomList;
  }catch(err){
    console.log('Error:', err.message);
    throw err;
  }
};

// roomController.joinRoom = async (rid, user) => {
//   const room = await queryAsync(`select room from room where room = ?`,[rid]);
//   console.log("++++++++ join room : ", room);
//   if (!room) {
//     throw new Error("해당 방이 없습니다.");
//   }
//   if (!room.members.includes(user._id)) {
//     room.members.push(user._id);
//     await room.save();
//   }
//   user.room = roomId;
//   await user.save();
// };

// roomController.leaveRoom = async (user) => {
//   const room = await Room.findById(user.room);
//   if (!room) {
//     throw new Error("Room not found");
//   }
//   room.members.remove(user._id);
//   await room.save();
// };

module.exports = roomController;