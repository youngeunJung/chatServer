// chat Schema 만들기 (chat 데이터가 어떻게 생길 예정인지)

//const mysql = require("mysql");    //mysql을 사용하면 데이터 table이 있기 때문에 객체 생성할 필요 없음.??

const chatSchema = new Object({
        chat: this.chat,
        user: {
            id: this.id,
            name: this.name,
        }
        // room: {
        //     type: mongoose.Schema.ObjectId,
        //     ref: "Room",
        // },
    });

module.exports = chatSchema;