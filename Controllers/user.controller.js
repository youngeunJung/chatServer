const mysql = require("mysql2");
const dbconfig = require("../config/database");
const connection = mysql.createPool(dbconfig);
const util = require('util');
const queryAsync = util.promisify(connection.query).bind(connection);
const bcrypt = require("bcrypt");
const saltRounds = 10;

const userController = {};

userController.loginUser = async (id, pw) => {
    console.log("userid", id);
    console.log("userpw", pw);

    // 이미 있는 유저인지 확인(query문으로 찾기??)
    try {
        const user = await queryAsync(`select name, id, pw from user where id = ?`, [id]);
        console.log(";;;;;;;;;;;;;;;;;;;;", user);

        const userList = user.map(data => ({ name: data.name, id: data.id, pw: data.pw }));
        console.log("------------", userList);

        var loginSt = "";

        // 없다면 insert 반환
        if (userList == '') {
            //로그인 페이지에서 로그인했을 때
            loginSt = "insert";
            console.log("회원가입 해주세요");

            // // 유저 정보저장
            // connection.query(`insert into user (name, token) values (?,?)` 
            // , [userName, sid] 
            // , (err, result) => {
            //     console.log("===============");
            //     console.log(result);
            // });

            return [loginSt];

        } else {

            // if (id == userList[0].id && pw == userList[0].pw)
            console.log ("유저가 친 pw:::::", pw);
            console.log("데이터에 저장된 pw:", userList[0].pw);
            let result = await bcrypt.compare(pw, userList[0].pw);
            
            console.log("비밀번호 확인결과", result );

            if (id == userList[0].id && await bcrypt.compare(pw, userList[0].pw)){   //await를 써줘야 bcrypt.compare 처리할 때까지 기다려줌!! 그래서 데이터를 받아 if 조건문 판단가능
                loginSt = "ok"
                console.log("로그인 되었습니다.")
                //MainaPage 화면으로 넘어가기

            } else {
                loginSt = "false"
                console.log("로그인에 실패하였습니다.")
            }

            // connection.query(
            //     `update user set token = ? where token =(select token from ( select token from user where name = ? )as a)`
            //     , [sid, userName], 
            //     (err, result) => {
            //     console.log("result :::::::::::::", result);
            //     // console.log("user :::", user);
            // });

            // return { name: userList[0].name, id: userList[0].id };

            console.log(loginSt, { name: userList[0].name, id: userList[0].id });
            return [loginSt, { name: userList[0].name, id: userList[0].id }];
        };

    } catch (err) {
        console.log('Error:', err.message);
        throw err; // Rethrow the error to be handled by the caller
    };
};

userController.checkUser = async (sid) => {
    try {
        const result = await queryAsync('SELECT name, token FROM user WHERE token = ?', [sid]);  // [RowDataPacket{}]형태로 반환해줌
        console.log("result::::", result);

        if (result.length === 0) {
            throw new Error('User not found');
        }

        const userList = result.map(data => ({ name: data.name, token: data.token }));
        console.log('userList:', userList);

        return userList;
    } catch (err) {
        console.log('Error:', err.message);
        throw err; // Rethrow the error to be handled by the caller
    }
};

userController.saveUser = async (userdata) => {

    try {
        const userInsert = await queryAsync(`select * from user where id = ?`, [userdata.id])

        if (userInsert.length === 0) {
            // queryAsync(`insert user(name, id, pw, phone) values (?,?,?,?)`, [name, id, pw, phone]);

            bcrypt.genSalt(saltRounds, function (err, salt) {       //비밀번호 암호화 - salt 이용
                if (err) throw err;

                //해시 처리
                bcrypt.hash(userdata.pw, salt, function (err, hash) {
                    if (err) throw err;
                    console.log("<><><><><><><><><><>", hash);
                    let userpw = hash;

                    connection.query(
                        `insert user(name, id, pw, phone) values (?,?,?,?)`, [userdata.name, userdata.id, userpw, userdata.phone],
                        (err, result) => {
                            console.log("result :::::::::::::", result);
                    });
                })
            })
        };
    } catch (err) {
        console.log('Error:', err.message);
        throw err;
    }
}

module.exports = userController;