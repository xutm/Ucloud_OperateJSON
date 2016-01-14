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
	$scope.Tags = [];
	var newTag = {KeyValue:"",CN:"",EN:"",Field:""};
	var oldTag = {KeyValue:"",CN:"",EN:"",Field:""};
	$scope.currentPage = 1;
	$scope.pageSize = 10;
	$scope.addKeyValueFlag = 0;
  
	$scope.numberOfPages = function(){
		return Math.floor($scope.Tags.length/$scope.pageSize);         
	};

	$scope.changePage = function(){
		if( parseInt($scope.Page) > 0 && parseInt($scope.Page) <= ( Math.floor($scope.Tags.length/$scope.pageSize)+ 1)){
			$scope.currentPage = parseInt($scope.Page);
		}else{
			alert("The number is wrong");
		}
		$scope.Page = "";
	};

	$scope.saveTag = function(Tag) {
		newTag.KeyValue = Tag.KeyValue;
		newTag.CN = Tag.CN;
		newTag.EN = Tag.EN;
		newTag.Field = Tag.Field;
		console.log(newTag);
		if( (newTag.KeyValue !== oldTag.KeyValue) || (newTag.CN !== oldTag.CN) || (newTag.EN !== oldTag.EN) || (newTag.Field !== oldTag.Field) ){
			console.log("success");
			var method = 'http://172.16.2.100:4011/saveTag';
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
		var index = 0;
		for(var i = 0; i < $scope.Tags.length; i++){
			if(Tag.KeyValue === $scope.Tags[i].KeyValue){
				index = i;
			}
		}
		$scope.Tags.splice(index,1);
		newTag.KeyValue = Tag.KeyValue;
		newTag.CN = Tag.CN;
		newTag.EN = Tag.EN;
		newTag.Field = Tag.Field;
		console.log(newTag);
		var method = 'http://172.16.2.100:4011/deleteTag';
		var Tag = newTag;
		POST(method, Tag);
	};

	$scope.addTag=function(){
		if(!$scope.newKeyValue){
			alert("Please input KeyValue!");
		}
		if(!$scope.newCN){
			alert("Please input CN!");
		}
		if(!$scope.newEN){
			alert("Please input EN!");
		}
		if(!$scope.newField){
			alert("Please input Field!");
		}
		if( $scope.newKeyValue && $scope.newCN && $scope.newEN && $scope.newField){
			$scope.Tags.push({KeyValue: $scope.newKeyValue, CN: $scope.newCN, EN: $scope.newEN, Field: $scope.newField});	
			newTag.KeyValue = $scope.newKeyValue;
			newTag.CN = $scope.newCN;
			newTag.EN = $scope.newEN;
			newTag.Field = $scope.newField;
			console.log(newTag);
			var method = 'http://172.16.2.100:4011/addTag';
			var Tag = newTag;
			POST(method, Tag);	
			$scope.newKeyValue = '';
			$scope.newCN = '';
			$scope.newEN = '';
			$scope.newField = '';
		}
	};

	$scope.loadData = function() {
		$http.get('http://172.16.2.100:4011/loadData')
			.success(function(data){
				$scope.Tags = data;
				console.log(data);
			})
			.error(function(data){
				console.log('Error: ' + data);
			});
	};

	$scope.inputJsonFile = function() {
		var method = 'http://172.16.2.100:4011/inputJsonFile';
		var Tag = newTag;
		POST(method, Tag);		
	}

	$scope.outputJsonFile = function() {
		var method = 'http://172.16.2.100:4011/outputJsonFile';
		var Tag = newTag;
		POST(method, Tag);	
	};

	function POST(method, Tag){//method=>string;Tag=>object;
		$http.post(method, Tag)
			.success(function(data){
				$scope.messageStatus = data;
				console.log(data); 
			})
			.error(function(data){
				$scope.messageStatus = data;
				console.log('Error: ' + data);
			});		
	}
}).filter('startFrom', function() {
	return function(input, start) {
		start = +start;
		return input.slice(start);
	};
});