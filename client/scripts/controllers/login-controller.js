angular.module('main').controller('LoginCtrl', function($scope, $state, $http, loginData) {
	$scope.doAuth = function() {
		loginData.UserName = $scope.loginData.UserName;
		loginData.Passward = $scope.loginData.Passward;
		$http.post('http://192.168.1.104:4011/login', loginData)
			.success(function(data){
				//$scope.messageStatus = data;
				console.log(data);
				if( data === 'success'){	
					loginData.status = true;
				}else{
					loginData.status = false;
				}
				$state.go('menu');
			})
			.error(function(data){
				$scope.messageStatus = data;
				console.log('Error: ' + data);
			});
		//console.log(loginData);		
		//$state.go('menu');
	};
});