const mysql = require("mysql");
const dbconfig = require("../config/database");
const connection = mysql.createPool(dbconfig);
const util = require('util');
const queryAsync = util.promisify(connection.query).bind(connection);

const galleryController = {};

galleryController.getAllgallery = async () => {
    try {
        const gallery = await queryAsync('select num, id, title, content from gallery');
        
        if(gallery.length !== 0 ){
            const date = await queryAsync('select date_format(regdate,"%Y-%m-%d %p %h:%i") as date from gallery;');
            console.log("_++----------++++", gallery);
            console.log("________________", gallery[0].num);
            console.log("{}{}{}{}{}{}{", date[0].date);
    
            let galleryList = [];
    
            for(i = 0 ; i < gallery.length; i++){
                galleryList.push([gallery[i],date[i]]);
            }
            // console.log("+++++++++++", galleryList);
            
            console.log("====???????", galleryList);
            console.log("???????!!!!!!!!!!!!!!!1", galleryList[0][0]);
            console.log("+++++++++++++++!!!!!!!!!!!!!!!1", galleryList[0][1]);
            return galleryList;
        }else{
            return null;
        }

    } catch (err) {
        console.log('Error:', err.message);
        throw err;
    }
}

module.exports = galleryController;