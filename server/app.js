//set up===========================
var mysql = require("mysql");
var express = require('express');
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var app = express();         // create our app w/ express
var fs = require("fs");
var urlencodedParser = bodyParser.urlencoded({ extended: false })// Create application/x-www-form-urlencoded parser
var EN_data = require("./locale/build/en_US.json");
var CN_data = require("./locale/build/zh_CN.json");
var _ = require("underscore");

//define model====================
// First you need to create a connection to the db---------
var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "ucloud"
});

//api=============================
con.connect(function(err){
	if(err){
		console.log('Error connecting to Db');
		return;
	}
	console.log('Connection established');
});

//Reading---------------------------------------------
var rows_readData;
function Read(){
	con.query('SELECT * FROM ucloud_datas',function(err,rows){
		if(err) throw err;
		rows_readData = rows;
	});
}

//Creating-----------------------------------------------
var addTag = {KeyValue:"",CN:"",EN:"",Field:""};
function Create(){
	con.query('INSERT INTO ucloud_datas SET ?', addTag, function(err, res){
		if(err) throw err;
	});
}

//Updating----------------------------------------------
var update_data = {KeyValue:"-1",CN:"天明",EN:"tomorrows",Field:"USST"};
function Update(){
	con.query('UPDATE ucloud_datas SET CN = ?,EN = ?,Field = ? WHERE KeyValue = ?', [update_data.CN, update_data.EN, update_data.Field,update_data.KeyValue], function (err, result) {
		if (err) throw err;
		}
	);
}

//Destroying---------------------------------------------
function Destroy(){
	con.query('DELETE FROM ucloud_datas WHERE id = ?', [5], function(err, result){
		if(err) throw err;
		console.log('Deleted ' + result.affectedRows + ' rows');
	});
}
//Read();
// Update();
// Read();
//console.log(CN_data);
// _.each(EN_data, function(value, key){
// 	addTag.KeyValue = key;
// 	addTag.EN = value;
// 	//Create Table
// 	Create(addValue);
// });
// console.log(addValue);
// _.each(CN_data, function(value, key){
// 	update_data.CN = value;
// 	update_data.KeyValue = key;
// 	//Update Table
// 	Update(update_date);
// });
// console.log(addValue);

//configuration======================
app.use(express.static('public'));
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header ("Access-Control-Allow-Credentials", true);
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
	next();
});
app.use(bodyParser.urlencoded({'extended':'true'}));// parse application/x-www-form-urlencoded
app.use(bodyParser.json());// parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));// parse application/vnd.api+json as json

//api=============================

// // application -------------------------------------------------------------
// app.get('*', function(req, res) {
// 	res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
// });
//update from client data---------------------------------
// app.get('/Updatedata', function (req, res) {
// 	updata_date.KeyValue = req.body.KeyValue;
// 	updata_date.CN = req.body.CN;
// 	updata_date.EN = req.body.EN;
// 	updata_date.Field = req.body.Field;
// 	//Update Table    var update_data = {KeyValue:"-1",CN:"天明",EN:"tomorrows",Field:"USST"};
// 	Update();	
// })

app.post('/addTag', urlencodedParser, function (req, res) {
//var addTag = {KeyValue:"",CN:"",EN:"",Field:""};
	addTag.KeyValue = req.body.KeyValue;
	addTag.CN = req.body.CN;
	addTag.EN = req.body.EN;
	addTag.Field = req.body.Field;
	console.log(addTag);
	Create();
});

//send to client--------------------------------------------
app.get('/loadData', function (req, res) {
	Read();
	res.json(rows_readData);// return JSON format
})

//receive from client---------------------------------------
app.post('/process_post', urlencodedParser, function (req, res) {
	console.log(req.body);
	res.json("success");
})

//listen (start app with node server.js)==============
var server = app.listen(8081, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log("Example app listening at http://%s:%s", host, port);
})

// con.end(function(err) {
// 	// The connection is terminated gracefully
// 	// Ensures all previously enqueued queries are still
// 	// before sending a COM_QUIT packet to the MySQL server.
// });