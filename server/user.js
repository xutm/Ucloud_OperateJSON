var express = require('express');
var config = require('./config.json');
var bodyParser = require('body-parser');
var app = module.exports = express.Router();

app.use(bodyParser.urlencoded({ extended: false }));
app.all('/login', function(req, res) {
    if( config.username === req.body.UserName && config.passwd === req.body.Passward){
		res.json("success");
	}else{
		res.json("error");
	}

});

app.all('/logout', function(req, res) {

});

app.all('/user', function(req, res) {

});
