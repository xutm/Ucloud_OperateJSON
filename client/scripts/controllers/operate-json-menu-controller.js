angular.module('main', ['ui.router']).controller('OperateJsonMenuCtrl',function($scope, $http, $state, urls){
    $scope.Tags = [];
	var oldTag = {Name:"",CN:"",EN:"",Field:""};

	$scope.currentPage = 1;
	$scope.pageSize = 10;
	$scope.addNameFlag = 0;
	$scope.maxPage = 1;

	$scope.$watch('keyValueFilter', function(){
		$scope.currentPage = 1;
		//console.log("success_tm");
	}, true);

    $scope.logout = function() {
		$state.go('login');
	}

	$scope.changePage = function(){
		if( parseInt($scope.Page) > 0 && parseInt($scope.Page) <= $scope.maxPage){
			$scope.currentPage = parseInt($scope.Page);
		}else{
			alert("The number is wrong");
		}
		$scope.Page = "";
	};

	$scope.searchByName = function(){
		if($scope.keyValueFilter){
			$scope.currentPage = 1;
		}
	}

	$scope.saveTag = function(Tag) {
        if(_.isEqual(oldTag, Tag)) {
            return;
        }
		
        post(urls.api + 'update', Tag);
	}

	$scope.editTag = function(Tag) {
        _.extend(oldTag, Tag);
	}

	$scope.deleteTag = function(Tag){
        var index = _.find($scope.Tags, {Name: Tag.Name});
		
        $scope.Tags.splice(index,1);
		post(urls.api + 'delete', Tag);
	};

	$scope.addTag=function(){
		if(!$scope.newTag.Name || !$scope.newTag.CN || !$scope.newTag.EN){
			return alert("Please input Name, CN, EN!");
		}
	
        post(urls.api + 'insert', $scope.newTag);
        $scope.Tags.push(_.clone($scope.newTag));
        $scope.newTag = {
            Name: '',
            CN: '',
            EN: '',
            Field: ''
        };
    };

	$scope.load = function() {
		$http.get(urls.api + 'query')
			.success(function(data){
				$scope.Tags = data;
				$scope.maxPage = Math.floor($scope.Tags.length/$scope.pageSize) + 1;
                $scope.currentPage = 1;
			})
			.error(function(data){
				console.error('Error: ' + data);
			});
	};

	$scope.import = function() {
		post(urls.api + 'import');	
	}

	$scope.export = function(lan) {
        window.open(urls.api + 'export/' + lan, 'width=0,height=0');
	};

    $scope.load();
	function post(method, Tag){//method=>string;Tag=>object;
		$http.post(method, _.clone(Tag))
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
