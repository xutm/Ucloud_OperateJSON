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
function Read(){
	con.query('SELECT * FROM ucloud_datas',function(err,rows){
		if(err) throw err;
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
var updateTag = {KeyValue:"0",CN:"许天明",EN:"Your login has expired, please login again.",Field:""};
function Update(){
	con.query('UPDATE ucloud_datas SET CN = ?,EN = ?,Field = ? WHERE KeyValue = ?', [updateTag.CN, updateTag.EN, updateTag.Field, updateTag.KeyValue], function (err, result) {
		if (err) throw err;
	});
}

//Destroying---------------------------------------------
var destroyTag = {KeyValue:"lp",CN:"",EN:"",Field:""};
function Destroy(){
	con.query('DELETE FROM ucloud_datas WHERE KeyValue = ?', [destroyTag.KeyValue], function(err, result){
		if(err) throw err;
	});
}

//console.log(CN_data);
//input the en_US.json & zh_CN.json into the mysql==========================
// _.each(EN_data, function(value, key){
// 	addTag.KeyValue = key;
// 	addTag.EN = value;
// 	//Create Table
// 	Create(addValue);
// });
// console.log(addValue);
// _.each(CN_data, function(value, key){
// 	updateTag.CN = value;
// 	updateTag.KeyValue = key;
// 	//Update Table
// 	Update(updateTag);
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
// 	console.log(__dirname + '\..\client\index.html');
// 	res.sendFile(__dirname + '\..\client\index.html'); // load the single view file (angular will handle the page changes on the front-end)
// });

//update Tag when receive the commend from front end---------------------------------
app.post('/saveTag', urlencodedParser, function (req, res) {
	updateTag.KeyValue = req.body.KeyValue;
	updateTag.CN = req.body.CN;
	updateTag.EN = req.body.EN;
	updateTag.Field = req.body.Field;
	console.log(updateTag);
	//Update Table    var updateTag = {KeyValue:"-1",CN:"天明",EN:"tomorrows",Field:"USST"};
	Update();
	res.json("success");	
})

//insert Tag when receive the commend from front end-----------------------------------
app.post('/addTag', urlencodedParser, function (req, res) {
	//var addTag = {KeyValue:"",CN:"",EN:"",Field:""};
	addTag.KeyValue = req.body.KeyValue;
	addTag.CN = req.body.CN;
	addTag.EN = req.body.EN;
	addTag.Field = req.body.Field;
	console.log(addTag);
	Create();
	res.json("success");
});

//destroy Tag when receive the commend from front end----------------------------------
app.post('/deleteTag', urlencodedParser, function (req, res) {
	//var destroyTag = {KeyValue:"lp",CN:"",EN:"",Field:""};
	destroyTag.KeyValue = req.body.KeyValue;
	console.log(destroyTag.KeyValue);
	Destroy();
	res.json("success");
})

//send to client--------------------------------------------
app.get('/loadData', function (req, res) {
	con.query('SELECT * FROM ucloud_datas',function(err,rows){
		if(err) throw err;
		res.json(rows);// return JSON format
	});
})

var EN_res = {};//EN_res[key] = keyvalue;
var CN_res = {};//CN[key] = keyvalue;
//receive from client---------------------------------------
app.post('/process_post', urlencodedParser, function (req, res) {
	con.query('select * from ucloud_datas  ', function(err, results, fields){
		if (err) throw err;
		console.log(results.length);
		for(var i = 0; i < results.length; i++){
			EN_res[results[i].KeyValue] = results[i].EN;
			CN_res[results[i].KeyValue] = results[i].CN;
		}
		fs.writeFile('xutm_EN.json', JSON.stringify(EN_res), function (err){
			if (err) throw err;
			console.log("EN_Saved!");
		});
		fs.writeFile('xutm_CN.json', JSON.stringify(CN_res), function (err){
			if (err) throw err;
			console.log("CN_Saved!");
		});		
	});	
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