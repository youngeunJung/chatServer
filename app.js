const express = require("express");
const mysql = require("mysql");
const dbconfig = require("./config/database");
const connection = mysql.createPool(dbconfig);
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/', (req, res) =>{
    //mysql과 connection 됬는지 확인하고, 방을 강제로 만듦!!! 
    //한 번만 만들어 놓으면 다시 만들필요없다!!!

    var room_multi_insert = 'insert into room (room) values ?;';
    var values = [
        ['자바스크립트 단톡방'],
        ['리액트 단톡방'],
        ['Node JS 단톡방']
    ];

    var query = connection.query(room_multi_insert, [values],
                (err, result) => {
                if(err){
                    res.send(err);
                }else{
                    res.send("ok");
                    console.log("result::::::::;;;;;" , result);
                    console.log(query.values);
                }
                })
    // res.send('Root');
});

app.get('/user', (req, res) =>{
    res.send('connection');
    connection.query('select * from user', (error, rows, fields) =>{
        if(error) throw error;
        console.log('User info is: ', rows);
    });     //connection이 되었는지 확인!!! (제대로 되면 query 문이 출력됨)    
});

module.exports = app;
