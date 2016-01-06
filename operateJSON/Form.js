angular.module('myModule', [], function($httpProvider) {
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
})
.controller('FormController',function($scope, $http){
	$scope.Tags=[
	{Key:'No1',CN:'服务器',EN:'Server',Field:'common'},
	{Key:'No2',CN:'云',EN:'Cloud',Field:'main'},
	{Key:'No3',CN:'主机',EN:'Main Engine',Field:'CDN'},
	{Key:'No4',CN:'客户端',EN:'Client',Field:'SAAS'}
	];
	$scope.addTag=function(){
		$scope.Tags.push({Key:$scope.newKey,CN:$scope.newCN,EN:$scope.newEN,Field:$scope.newField});
		$scope.newKey='';
		$scope.newCN='';
		$scope.newEN='';
		$scope.newField='';
	};
	$scope.deleteTag=function(student){
		$scope.Tags.splice($scope.students.indexOf(student),1);
		//$scope.student.splice(index,1);//删除选中的一行
	};

	$scope.loadData = function() {
		$http.get('http://127.0.0.1:8081/listUsers')
			.success(function(data){
				//console.log(JSON.stringify(angular.fromJson(data)));
				console.log(data);
			})
			.error(function(data){
				console.log('Error: ' + data);
			});
	};

	$scope.tm="xtm";
	$scope.sendData = function() {
		console.log($scope.tm);
		var data = $scope.tm;
		$http.post('http://127.0.0.1:8081/process_post', {tm: $scope.tm})
			.success(function(data){
				console.log(data);
			})
			.error(function(data){
				console.log('Error: ' + data);
			});
	};
})