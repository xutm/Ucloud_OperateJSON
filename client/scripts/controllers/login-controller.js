angular.module('main').controller('LoginCtrl', function($scope, $state, loginData) {
	$scope.doAuth = function() {
		$state.go('menu');
	}
});