const chatController = require('../Controllers/chat.controller');
const userController = require('../Controllers/user.controller');
const roomController = require('../Controllers/room.controller');
const galleryController = require('../Controllers/gallery.controller');

module.exports = function (io) {
  // io ~~~~~~ 브라우저에서 연결!!
  io.on("connection", async (socket) => {
    console.log("client is connected", socket.id);

    // socket.emit("rooms", await roomController.getAllRooms());   //룸 리스트 보내기

    socket.emit("galleryList", await galleryController.getAllgallery());   //갤러리 리스트 보내기

    socket.on("joinRoom", async (rid, cb) => {          //room join할 때도 방 정보(rid)를 받아야됨
      try {
        const user = await userController.checkUser(socket.id); // 일단 유저정보들고오기
        //await roomController.joinRoom(rid, user); // 1~2작업
        socket.join(rid.toString());  // 3 작업, 채팅방이 생기면서 
        // 이제는 우리가 모두에게 emit을 할 수 없어졌다.
        // 따라서 socket들을 어떤 그룹으로 분리 할 수 있고
        // 그 그룹에 들어가게 하는 함수를 join이라고한다.
        // socket.join(user.room.toString()); 의 의미는 
        // 이 소켓은 유저가 들어있는 방의 id를 이름으로 
        // 사용하는 어떤 그룹으로 들어가겠다는 이야기다. 
        // 이 같은이름의 방으로 다른 소켓이 들어가면 
        // 우리는 그 다른 소켓과 프라이베잇한 대화를 할 수 있다.
        const welcomeMessage = {
          chat: `${user[0].name} is joined to this room`,
          user: [{ id: null, name: "system" }],
        };
        io.to(rid.toString()).emit("message", welcomeMessage);  // 4 작업, 
        // io.to(user.room.toString()).emit("message", welcomeMessage);
        // 이 코드를 통해 프라이베잇하게 대화할 수 있다.
        // 이 룸id에들어있는 사람들 에게(to) 말한다 (emit) 이 메세지를 (welcomeMessages)
        io.emit("rooms", await roomController.getAllRooms());// 5 작업
        cb({ ok: true });
      } catch (error) {
        cb({ ok: false, error: error.message });
      }
    });

    socket.on("login", async (id, pw, cb) => {
      console.log("backend id", id);
      console.log("backend pw:", pw);

      // 유저정보를 저장
      try {
        console.log("-------");
        // const user = await userController.loginUser(id, pw);
        const user = await userController.loginUser(id, pw)
        io.emit("loginInfo", user);
        console.log("======");

        socket.emit("galleryList", await galleryController.getAllgallery());

        // if(id == "dkfi334"){
        //   console.log('-----------');
          // const data = user[0];
          // io.to(socket.id.toString()).emit("loginInfo", user[0].toString());
          // console.log(data);
          // socket.emit("loginInfo", "안녕");
        return cb({ ok: true, data: user });
        // }
      } catch (error) {
        cb({ ok: false, error: error.message });
      }
    });

    socket.on("sendMessage", async (rid, message, cb) => {    //rid를 받아서 넘겨주어야 됨!!
      try {
        // 유저찾기 (socket id로!!)
        const user = await userController.checkUser(socket.id);  //name , token 값 객체로 return?? [{name, token}]
        console.log("=====================", user);

        if (user.length > 0) {
          // 메세지 저장(방정보도 보내서 저장해야함)
          const newMessage = await chatController.saveChat(rid, message, user);
          io.to(rid.toString()).emit("message", newMessage);     //전체 클라이언트에게 알려줘야 하니까 server자체에서 새로운 메세지 왔다고 전송해야함!!
          return cb({ ok: true });
        }
      } catch (error) {
        cb({ ok: false, error: error.message });
      }
    });

    socket.on("leaveRoom", async (rid, cb) => {
      try {
        const user = await userController.checkUser(socket.id); //[{name, token}]
        //await roomController.leaveRoom(user);   
        const leaveMessage = {
          chat: `${user[0].name} left this room`,
          user: [{ id: null, name: "system" }],
        };
        socket.broadcast.to(rid.toString()).emit("message", leaveMessage);
        // socket.broadcast의 경우 io.to()와 달리,나를 제외한 채팅방에 모든 맴버에게 메세지를 보낸다 
        io.emit("rooms", await roomController.getAllRooms());
        socket.leave(rid.toString()); // join했던 방을 떠남 
        cb({ ok: true });
      } catch (error) {
        cb({ ok: false, message: error.message });
      }
    });

    socket.on("sendUser", async (userdata, cb) => {    // client에서 들어오는 비밀번호
      
      console.log("name::::::", userdata);
      // console.log("id::::::::", id);
      // console.log("pw:::::::::::::", pw);
      // console.log("phone::::::::::::", phone);

      // 유저정보를 저장
      try {
        const user = await userController.saveUser(userdata);  //socket.id = 뭘로 사용할수 있을까
        // const welcomeMessage = {
        //     chat: `${user.name}님이 입장하였습니다.`,
        //     user: [{name: "system", token: null}],
        // };
        // io.emit("message", welcomeMessage);
        cb({ ok: true, data: user });
      } catch (error) {
        cb({ ok: false, error: error.message });
      }
    })

    socket.on("sendWrite", async (write, attach, cb) => {
      io.on("sendUserInfo" , async (userId)=>{
        console.log("userid", userId);
      });
      console.log("write", write);
      console.log("attach", attach);

      // // 유저정보를 저장
      // try {
      //   console.log("-------");
      //   // const user = await userController.loginUser(id, pw);
      //   const user = await userController.loginUser(id, pw)
      //   io.emit("loginInfo", user);
      //   console.log("======");

      //   socket.emit("galleryList", await galleryController.getAllgallery());

      //   // if(id == "dkfi334"){
      //   //   console.log('-----------');
      //     // const data = user[0];
      //     // io.to(socket.id.toString()).emit("loginInfo", user[0].toString());
      //     // console.log(data);
      //     // socket.emit("loginInfo", "안녕");
      //   return cb({ ok: true, data: user });
      //   // }
      // } catch (error) {
      //   cb({ ok: false, error: error.message });
      // }
    });

    socket.on("sendUserInfo", async (id) => {
      console.log("login id", id);

      io.emit("loginUserId", id);
      console.log("======");
    });

    socket.on

    socket.on("disconnect", () => {
      console.log("user is disconnected");
    });
  });
};