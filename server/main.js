//set up===========================
var _ = require("underscore");
var config = require("./config.json");
var EN_data = require(config.locale+ "en_US.json");
var CN_data = require(config.locale + "zh_CN.json");
var mysql = require("mysql");
var express = require('express');
var bodyParser = require('body-parser');
var fs = require("fs");
var app = module.exports = express.Router();

var parser = bodyParser.urlencoded({ extended: false });
// create a connection to the mysql----------------
var pool = mysql.createPool({
	connectionLimit: 100,
	host: config.host,
	user: config.user,
	password: config.password,
	database: config.database,
	debug: false
});

function getTag(req) {
    return _.pick(req.body, 'Name', 'CN', 'EN', 'Field');
}

function download(filename, data, res) {
    fs.writeFile(config.download + filename, JSON.stringify(data), function(error){
        if (error) {
            return res.json({code: 100, message: 'Download:' + error});
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + filename);
        res.download(config.download + filename, filename, function(error) {
            res.end;
        })
    });
}

function doExport(req, res, con) {
    return function(error, result) {
        var en = {},
            cn = {},
            conf = {
                cn: {
                    file: 'zh_CN.json',
                    data: cn
                },
                en: {
                    file: 'en_US.json',
                    data: en
                }
            },
            data = conf[req.params.lan] || conf.cn;
        
        if (error) {
            console.error(error);
            return res.status(404, error);
        }
        
        _.each(result, function(data) {
            en[data.Name] = data.EN;
            cn[data.Name] = data.CN;
        });

        download(data.file, data.data, res);     
        con.release();
    }
}

function queryCommand(command, value, req, res) {
    var con;

    function callback(error, result) {
        con && (con.release(), con = null);
        res.json(_.isObject(error)? error: error? {code: 100, status: command + ' error!', error: error}: result);
    }

    function excute(command, callback){
        switch (command) {
            case 'import':
                return con.query('DELETE FROM locale', function(error, result){
                    return error? res.json(error): con.query('INSERT INTO locale (Name, CN, EN, Field) VALUES ?', [value], callback);
                });
            case 'export':
                return con.query('SELECT * FROM locale', doExport(req, res, con));
            case 'create':
                return con.query('CREATE TABLE locale(Name varchar(50) PRIMARY KEY,CN TEXT NOT NULL, EN TEXT, Field varchar(200)) ENGINE=InnoDB DEFAULT CHARSET=utf8;', callback);
            case 'drop':
                return con.query('DROP TABLE locale', callback);
            case 'query':
                return con.query('SELECT * FROM locale', callback);
            case 'insert':
                return con.query('INSERT INTO locale SET ?', [value], callback);
            case 'update':
                return con.query('UPDATE locale SET CN = ?,EN = ?,Field = ? WHERE Name = ?', [value.CN, value.EN, value.Field, value.Name], callback);
            case 'delete':
                return con.query('DELETE FROM locale WHERE Name = ?', [value.Name], callback);
        }
    }

	pool.getConnection(function(err,connection){
        con = connection;

		if (err) {
            return callback(err);
		} 
	
        con.on('error', callback);
        excute(command, callback);
	});

}

app.all(/^create|drop|query|update|insert|delete/, parser, function(req, res){
    queryCommand(req.path.slice(1), getTag(req), req, res);
});

app.all('/export/:lan',parser, function(req, res) {
    queryCommand('export', getTag(req), req, res);
});

app.all('/import', parser, function (req, res) {
    var values = [];

    _.each(CN_data, function(value, key) {
        var find = _.find(values, function(value, index){
            return value[0] === key;
        });

        find? (find[1] = value): values.push([key, value, '', '']);
    });

    _.each(EN_data, function(value, key) {
        var find = _.find(values, function(value, index){
            return value[0] === key;
        });

        find && (find[2] = value);
    });

    queryCommand('import', values, req, res);
});

