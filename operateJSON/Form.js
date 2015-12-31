var myModule=angular.module('myModule',[]).controller('FormController',function($scope){
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
});