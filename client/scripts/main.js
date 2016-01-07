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
.controller('JSONController',function($scope, $http){
	// $scope.Tags=[
	// {KeyValue:'No1',CN:'服务器',EN:'Server',Field:'common'},
	// {KeyValue:'No2',CN:'云',EN:'Cloud',Field:'main'},
	// {KeyValue:'No3',CN:'主机',EN:'Main Engine',Field:'CDN'},
	// {KeyValue:'No4',CN:'客户端',EN:'Client',Field:'SAAS'}
	// ];
	$scope.Tags = [];
	//$scope.Tag.$edit = false;
	var newTag = {KeyValue:"",CN:"",EN:"",Field:""};
	var oldTag = {KeyValue:"",CN:"",EN:"",Field:""};

	$scope.saveTag = function(Tag) {
		newTag.KeyValue = Tag.KeyValue;
		newTag.CN = Tag.CN;
		newTag.EN = Tag.EN;
		newTag.Field = Tag.Field;
		console.log(newTag);
		if( (newTag.KeyValue !== oldTag.KeyValue) || (newTag.CN !== oldTag.CN) || (newTag.EN !== oldTag.EN) || (newTag.Field !== oldTag.Field) ){
			console.log("success");
			var method = 'http://127.0.0.1:8081/saveTag';
			var Tag = newTag;
			POST(method, Tag);
		}
	}

	$scope.editTag = function(Tag) {
		oldTag.KeyValue = Tag.KeyValue;
		oldTag.CN = Tag.CN;
		oldTag.EN = Tag.EN;
		oldTag.Field = Tag.Field;
		console.log(oldTag);
	}

	$scope.deleteTag = function(Tag){
		//$scope.Tags.splice($scope.students.indexOf(student),1);
		//$scope.student.splice(index,1);//删除选中的一行
		newTag.KeyValue = Tag.KeyValue;
		newTag.CN = Tag.CN;
		newTag.EN = Tag.EN;
		newTag.Field = Tag.Field;
		console.log(newTag);
		var method = 'http://127.0.0.1:8081/deleteTag';
		var Tag = newTag;
		POST(method, Tag);
	};

	$scope.addTag=function(){
		if( $scope.newKeyValue || $scope.newCN || $scope.newEN || $scope.newField){
			$scope.Tags.push({KeyValue: $scope.newKeyValue, CN:$scope.newCN, EN:$scope.newEN, Field:$scope.newField});	
			newTag.KeyValue = $scope.newKeyValue;
			newTag.CN = $scope.newCN;
			newTag.EN = $scope.newEN;
			newTag.Field = $scope.newField;
			console.log(newTag);
			var method = 'http://127.0.0.1:8081/addTag';
			var Tag = newTag;
			POST(method, Tag);	
			$scope.newKeyValue = '';
			$scope.newCN = '';
			$scope.newEN = '';
			$scope.newField = '';
		}
	};

	$scope.loadData = function() {
		$http.get('http://127.0.0.1:8081/loadData')
			.success(function(data){
				$scope.Tags = data;
				console.log(data);
				// for(var key in data){ 
				// 	console.log(key); console.log(data[key]);//这个就是value 
				// }
			})
			.error(function(data){
				console.log('Error: ' + data);
			});
	};

	$scope.tm="xtm";
	$scope.sendData = function() {
		console.log($scope.tm);
		var data1 = {tm: $scope.tm};
		$http.post('http://127.0.0.1:8081/process_post', data1)
			.success(function(data){
				console.log(data); 
			})
			.error(function(data){
				console.log('Error: ' + data);
			});
	};

	function POST(method, Tag){
		$http.post(method, Tag)
			.success(function(data){
				console.log(data); 
			})
			.error(function(data){
				console.log('Error: ' + data);
			});		
	}
})