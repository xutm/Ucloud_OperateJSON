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
var userLandVariable = '4 ';

function Read(){
	con.query('SELECT * FROM ucloud_datas',function(err,rows){
		if(err) throw err;
		console.log('Data received from Db:\n');
		console.log(rows);
	});
}
	
//Creating-----------------------------------------------
var addValue = {KeyValue:"",CN:"",EN:"",Field:""};
function Create(addValue){
	con.query('INSERT INTO ucloud_datas SET ?', addValue, function(err, res){
		if(err) throw err;
		//console.log('Last insert ID:', res.insertId);
	});
}

//Updating----------------------------------------------
var updata_data = {CN: "",KeyValue: ""};
function Update(updata_data){
	con.query('UPDATE ucloud_datas SET CN = ? Where KeyValue = ?', [updata_data.CN, updata_data.KeyValue], function (err, result) {
		if (err) throw err;
		//Similarly, when executing an update query, the number of rows affected can be retrieved using result.affectedRows
		//console.log('Changed ' + result.changedRows + ' rows');
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

//console.log(CN_data);
// _.each(EN_data, function(value, key){
// 	addValue.KeyValue = key;
// 	addValue.EN = value;
// 	//Create Table
// 	Create(addValue);
// });
// console.log(addValue);
// _.each(CN_data, function(value, key){
// 	updata_data.CN = value;
// 	updata_data.KeyValue = key;
// 	//Update Table
// 	Update(updata_data);
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

//send to client--------------------------------------------
app.get('/listUsers', function (req, res) {
	var rows_data;
	con.query('SELECT * FROM ucloud_datas where KeyValue = "-1"',function(err,rows){
		if(err) throw err;
		//console.log('Data received from Db:\n');
		console.log(rows);
		rows_data = rows;
		//res.json(rows);// return JSON format
	});
	con.query('SELECT * FROM ucloud_datas ',function(err,rows){
		if(err) throw err;
		//console.log('Data received from Db:\n');
		//console.log(rows);
		//rows_data.concat(rows)
		res.json(rows_data.concat(rows));// return JSON format
	});
})

//receive from client---------------------------------------
app.post('/process_post', urlencodedParser, function (req, res) {
	// response = {
	//     first_name:req.body.first_name,
	//     last_name:req.body.last_name
	// };
	console.log(req.body);
	res.json("success");
})

//listen (start app with node server.js)==============
var server = app.listen(8081, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log("Example app listening at http://%s:%s", host, port);
})

Read();
// Create();
// Read();
// // Update();
// // Read();
// // Destroy();
// // Read();

// con.end(function(err) {
// 	// The connection is terminated gracefully
// 	// Ensures all previously enqueued queries are still
// 	// before sending a COM_QUIT packet to the MySQL server.
// });