angular.module('myModule', ['ui.router', 'main'], function($httpProvider) {
	// Use x-www-form-urlencoded Content-Type
	$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
 
	/**
		* The workhorse; converts an object to x-www-form-urlencoded serialization.
		* @param {Object} obj
		* @return {String}
	*/ 
	var param = function(obj) {
		var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
	      
		for(name in obj) {
			value = obj[name];
	        
			if(value instanceof Array) {
				for(i=0; i<value.length; ++i) {
					subValue = value[i];
					fullSubName = name + '[' + i + ']';
					innerObj = {};
					innerObj[fullSubName] = subValue;
					query += param(innerObj) + '&';
				}
			}else if(value instanceof Object) {
				for(subName in value) {
					subValue = value[subName];
					fullSubName = name + '[' + subName + ']';
					innerObj = {};
					innerObj[fullSubName] = subValue;
					query += param(innerObj) + '&';
				}
			}else if(value !== undefined && value !== null) {
				query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
			}
		}
	      
		return query.length ? query.substr(0, query.length - 1) : query;
	};
 
	// Override $http service's default transformRequest
	$httpProvider.defaults.transformRequest = [function(data) {
		return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
	}];
}).config(function($stateProvider, $urlRouterProvider) {
	var checkAuth = function($state, loginData) {
		setTimeout(function(){
			if(!loginData.status){
				alert("username or passward isnt corrent!!!");
				$state.go('login');
			}			
		},500)
	};

	$stateProvider.state('login', {
		url: "/login",
		templateUrl: "templates/login.html",
		controller: "LoginCtrl"
	}).state('menu', {
		url: "/menu",
		templateUrl: "templates/operate-json-menu.html",
		controller: "OperateJsonMenuCtrl",
		onEnter: checkAuth
	});

	$urlRouterProvider.otherwise('menu');
});