var module = angular.module('main');

module.filter('startFrom', function() {
	return function(input, start, scope) {
		start = +start;
		scope.maxPage = Math.floor(input.length/scope.pageSize) + 1;
		return input.slice(start);
	};
});