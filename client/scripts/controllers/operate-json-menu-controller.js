angular.module('main', ['ui.router']).controller('OperateJsonMenuCtrl',function($scope, $http, $state){
	$scope.Tags = [];
	var newTag = {KeyValue:"",CN:"",EN:"",Field:""};
	var oldTag = {KeyValue:"",CN:"",EN:"",Field:""};
	$scope.currentPage = 1;
	$scope.pageSize = 10;
	$scope.addKeyValueFlag = 0;
	$scope.maxPage = 1;

	$scope.$watch('keyValueFilter', function(){
		$scope.currentPage = 1;
		//console.log("success_tm");
	}, true);

	$scope.changePage = function(){
		if( parseInt($scope.Page) > 0 && parseInt($scope.Page) <= $scope.maxPage){
			$scope.currentPage = parseInt($scope.Page);
		}else{
			alert("The number is wrong");
		}
		$scope.Page = "";
	};

	$scope.searchByKeyValue = function(){
		if($scope.keyValueFilter){
			$scope.currentPage = 1;
		}
	}

	$scope.saveTag = function(Tag) {
		newTag.KeyValue = Tag.KeyValue;
		newTag.CN = Tag.CN;
		newTag.EN = Tag.EN;
		newTag.Field = Tag.Field;
		console.log(newTag);
		if( (newTag.KeyValue !== oldTag.KeyValue) || (newTag.CN !== oldTag.CN) || (newTag.EN !== oldTag.EN) || (newTag.Field !== oldTag.Field) ){
			console.log("success");
			var method = 'http://192.168.1.104:4011/saveTag';
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
		var method = 'http://192.168.1.104:4011/deleteTag';
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
			var method = 'http://192.168.1.104:4011/addTag';
			var Tag = newTag;
			POST(method, Tag);	
			$scope.newKeyValue = '';
			$scope.newCN = '';
			$scope.newEN = '';
			$scope.newField = '';
		}
	};

	$scope.logOut = function() {
		$state.go('login');
	}

	$scope.loadData = function() {
		$http.get('http://192.168.1.104:4011/loadData')
			.success(function(data){
				$scope.Tags = data;
				$scope.maxPage = Math.floor($scope.Tags.length/$scope.pageSize) + 1;
				console.log(data);
			})
			.error(function(data){
				console.log('Error: ' + data);
			});
	};

	$scope.inputJsonFile = function() {
		var method = 'http://192.168.1.104:4011/inputJsonFile';
		var Tag = newTag;
		POST(method, Tag);		
	}

	$scope.outputJsonFile = function() {
		var method = 'http://192.168.1.104:4011/outputJsonFile';
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
});