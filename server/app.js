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

// create a connection to the mysql---------
var pool = mysql.createPool({
	connectionLimit: 100,
	host: "localhost",
	user: "root",
	password: "",
	database: "ucloud",
	debug: false
});

//Reading---------------------------------------------
function Read(con){
	con.query('SELECT * FROM ucloud_datas',function(err,rows){
		con.release();		
		if(err) throw err;
	});
}

//Creating-----------------------------------------------
var addTag = {KeyValue:"",CN:"",EN:"",Field:""};
function Create(con, addTag){
	con.query('INSERT INTO ucloud_datas SET ?', addTag, function(err, res){
		con.release();	
		if(err) throw err;
	});
}

//Updating----------------------------------------------
var updateTag = {KeyValue:"",CN:"",EN:"",Field:""};
function Update(con, updateTag){
	con.query('UPDATE ucloud_datas SET CN = ?,EN = ?,Field = ? WHERE KeyValue = ?', [updateTag.CN, updateTag.EN, updateTag.Field, updateTag.KeyValue], function (err, result) {
		con.release();	
		if (err) throw err;
	});
}

//Destroying---------------------------------------------
var destroyTag = {KeyValue:"",CN:"",EN:"",Field:""};
function Destroy(con, destroyTag){
	con.query('DELETE FROM ucloud_datas WHERE KeyValue = ?', [destroyTag.KeyValue], function(err, result){
		con.release();	
		if(err) throw err;
	});
}

function handle_createTable() {
	pool.getConnection(function(err,con){//delete Ucloud_datas
		if (err) {
			con.release();
			//res.json({"code" : 100, "status" : "Error in con database"});
			console.log("false");
			return;
		}   
		console.log('connected as id ' + con.threadId);

		var sql = " DROP TABLE IF EXISTS Ucloud_datas ";
		con.query(sql,function(err, rows){
			con.release();
			if(!err) {
				console.log("delete table Ucloud_datas success");
			}           
		});

		con.on('error', function(err) {      
			//res.json({"code" : 100, "status" : "Error in con database"});
			console.log("false");
			return;     
		});
	});
	pool.getConnection(function(err,con){//create a new tables
		if (err) {
			con.release();
			//res.json({"code" : 100, "status" : "Error in con database"});
			console.log("false");
			return;
		}   
		console.log('connected as id ' + con.threadId);

		sql = ' CREATE TABLE Ucloud_datas(KeyValue varchar(50),CN TEXT, EN TEXT, Field varchar(50) ) ENGINE=InnoDB  DEFAULT CHARSET=utf8 ';
		con.query(sql,function(err, rows){
			con.release();
			if(!err) {
				console.log("create table Ucloud_datas success");
			}           
		});

		con.on('error', function(err) {      
			//res.json({"code" : 100, "status" : "Error in con database"});
			console.log("false");
			return;     
		});
	});
}
handle_createTable();

//input the en_US.json & zh_CN.json into the mysql==========================
function handle_inputJsonFile(req, res, sql, values) {
	pool.getConnection(function(err,con){//add EN_data
		if (err) {
			con.release();
			res.json({"code" : 100, "status" : "Error in con database"});
			return;
		}
		console.log('connected as id ' + con.threadId);

		//Create(con, addTag);
		con.query(sql, [values], function(err) {
			con.release();
			if (err) throw err;
		});    

		con.on('error', function(err) {      
			res.json({"code" : 100, "status" : "Error in con database"});
			return;
		});
	});
}
app.post('/inputJsonFile', urlencodedParser, function (req, res) {
	var sql = "INSERT INTO Ucloud_datas (KeyValue, CN, EN, Field) VALUES ?";
	var values = [];
	//console.log(EN_data);            problem: save the last value
	_.each(EN_data, function(value, key){
		values.push([key, '', value, '']);
	});
	_.each(CN_data, function(value, key){
		var flag = 0;
		for(var i = 0; i < values.length; i++){
			if(key === values[i][0]){
				flag = 1;
				values[i][1] = value;
				break;
			}
		}
		if(!flag){
			values.push([key, value, '', '']);
			flag = 0;
		}
	});	
	handle_inputJsonFile(req, res, sql, values)	
	//console.log(values);
	console.log(values[1]);
	console.log(values.length);
	res.json("success");
})

//update Tag when receive the commend from front end---------------------------------   
function handle_saveTag(req, res, updateTag) {
	pool.getConnection(function(err,con){
		if (err) {
			con.release();
			res.json({"code" : 100, "status" : "Error in con database"});
			return;
		}   
		console.log('connected as id ' + con.threadId);
		Update(con, updateTag);
		con.on('error', function(err) {      
			res.json({"code" : 100, "status" : "Error in con database"});
			return;     
		});
	});
}
app.post('/saveTag', urlencodedParser, function (req, res) {
	updateTag.KeyValue = req.body.KeyValue;
	updateTag.CN = req.body.CN;
	updateTag.EN = req.body.EN;
	updateTag.Field = req.body.Field;
	console.log(updateTag);
	//Update Table    var updateTag = {KeyValue:"-1",CN:"天明",EN:"tomorrows",Field:"USST"};
	handle_saveTag(req, res, updateTag);
	res.json("success");	
});

//insert Tag when receive the commend from front end-----------------------------------
function handle_addTag(req, res, addTag) {
	pool.getConnection(function(err,con){
		if (err) {
			con.release();
			res.json({"code" : 100, "status" : "Error in con database"});
			return;
		}   
		console.log('connected as id ' + con.threadId);
		Create(con, addTag);
		con.on('error', function(err) {      
			res.json({"code" : 100, "status" : "Error in con database"});
			return;     
		});
	});
}
app.post('/addTag', urlencodedParser, function (req, res) {
	//var addTag = {KeyValue:"",CN:"",EN:"",Field:""};
	addTag.KeyValue = req.body.KeyValue;
	addTag.CN = req.body.CN;
	addTag.EN = req.body.EN;
	addTag.Field = req.body.Field;
	console.log(addTag);
	handle_addTag(req, res, addTag);
	res.json("success");
});

//destroy Tag when receive the commend from front end----------------------------------
function handle_deleteTag(req, res, destroyTag) {
	pool.getConnection(function(err,con){
		if (err) {
			con.release();
			res.json({"code" : 100, "status" : "Error in con database"});
			return;
		}   
		console.log('connected as id ' + con.threadId);
		Destroy(con, destroyTag);
		con.on('error', function(err) {      
			res.json({"code" : 100, "status" : "Error in con database"});
			return;     
		});
	});
}
app.post('/deleteTag', urlencodedParser, function (req, res) {
	//var destroyTag = {KeyValue:"lp",CN:"",EN:"",Field:""};
	destroyTag.KeyValue = req.body.KeyValue;
	console.log(destroyTag.KeyValue);
	handle_deleteTag(req, res, destroyTag);
	res.json("success");
});

//send to client--------------------------------------------
function handle_loadData(req, res) {
	pool.getConnection(function(err,con){
		if (err) {
			con.release();
			res.json({"code" : 100, "status" : "Error in con database"});
			return;
		}   
		console.log('connected as id ' + con.threadId);
		con.query('SELECT * FROM ucloud_datas',function(err,rows){
			con.release();
			if(err) throw err;
			res.json(rows);// return JSON format
		});        
		con.on('error', function(err) {      
			res.json({"code" : 100, "status" : "Error in con database"});
			return;     
		});
	});
}
app.get('/loadData', function (req, res) {
	handle_loadData(req, res);
});

//convert to  json file from mysql---------------------------------------
var EN_res = {};//EN_res[key] = keyvalue;
var CN_res = {};//CN[key] = keyvalue;
function handle_outputJsonFile(req, res) {
	pool.getConnection(function(err,con){
		if (err) {
			con.release();
			res.json({"code" : 100, "status" : "Error in con database"});
			return;
		}   
		console.log('connected as id ' + con.threadId);
		con.query('select * from ucloud_datas  ', function(err, results, fields){
			con.release();
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
		con.on('error', function(err) {      
			res.json({"code" : 100, "status" : "Error in con database"});
			return;     
		});
	});
}
app.post('/outputJsonFile', urlencodedParser, function (req, res) {
	handle_outputJsonFile(req, res);
	res.json("success");
})

//listen (start app with node server.js)==============
var server = app.listen(4011, function () {
	console.log("Server Up");
})