function setContentHeight() {
	var navHeight = document.getElementById("nav").offsetHeight;
	document.getElementById("content").style.minHeight = window.innerHeight - navHeight + "px";
}

var todoApp = angular.module('todoApp', [])
.service('sharedProps', function() {
	var _tasklist = [];

	this.retrieveTasks = function(user_id, $http) {
		$http({
			url:'../php/db_handler.php',
			method:'POST',
			data: {
				user_id:user_id,
				func:'retrieveTasks'
			}
		}).success(function(data) {
			data.forEach(function(item) {
				_tasklist.push({
					title: item.title,
					importance: item.importance,
					completed: item.completed == 1
				});
			});
			console.log(_tasklist);
			this.tasklist = _tasklist;
		});
	}
	this.tasklist = _tasklist;
})
.factory('beforeUnload', function ($rootScope, $window) {
    // Events are broadcast outside the Scope Lifecycle
    
    $window.onbeforeunload = function (e) {
        var confirmation = {};
        var event = $rootScope.$broadcast('onBeforeUnload', confirmation);
        if (event.defaultPrevented) {
            return confirmation.message;
        }
    };
    
    $window.onunload = function () {
        $rootScope.$broadcast('onUnload');
    };
    return {};
})
.run(function (beforeUnload) {
    // Must invoke the service at least once
});

todoApp.controller('todoCtrl', function($scope, $http, sharedProps) {
	var u;
	if ((u = localStorage.getItem("username")) === null) {
		return;
	}
	$scope.name = u;
	$scope.logged_in = true;

	sharedProps.retrieveTasks(localStorage.getItem("user_id"), $http);

});

//Handle user login, registration, etc
todoApp.controller('userCtrl', function($scope, $http, sharedProps) {
	$scope.tasklist = sharedProps.tasklist;

	function fieldsFilled() {
		if ($scope.username == null || $scope.password == null) {
			alert("Please enter a username and password");
			return false;
		}
		else {
			return true;
		}
	}

	$scope.login = function() {
		if (fieldsFilled()) {
			$http({
				url: '../php/db_handler.php',
				method: 'POST',
				data: {
					user:$scope.username, 
					pass:$scope.password,
					func:"is_valid_user"
				}
			}).success(function(data) {
				if (data != '') {
					localStorage.setItem("username", $scope.username);
					localStorage.setItem("password", $scope.password);
					localStorage.setItem("user_id", data);

					sharedProps.retrieveTasks(data, $http);

					$scope.name = $scope.username;
					$scope.logged_in = true;
					$scope.username = null;
					setContentHeight();
				}
				else {
					alert("Invalid username or password");
				}
				$scope.password = null;
			});
		}
	}

	$scope.register = function() {
		if (fieldsFilled()) {
			$http({
				url: '../php/db_handler.php',
				method: 'POST',
				data: {
					user:$scope.username,
					pass:$scope.password,
					func:"register_user"
				}
			}).success(function(data) {
				if (data != '') {
					localStorage.setItem("username", $scope.username);
					localStorage.setItem("password", $scope.password);
					localStorage.setItem("user_id", data);
					$scope.name = $scope.username;
					$scope.logged_in = true;
					$scope.newreg = true;
					$scope.username = null;
				}
				else {
					alert("Username taken.");
				}
				$scope.password = null;
			});
		}
	}

	$scope.logout = function() {
		var uid = localStorage.getItem("user_id");
		if (uid != null) {
	        $http({
				url: '../php/db_handler.php',
				method: 'POST',
				data:{
					jsondata: JSON.stringify($scope.tasklist),
					user_id: uid,
					func: 'storeTasks'
				}
			});
		}
		localStorage.removeItem("username");
		localStorage.removeItem("user_id");
		$scope.logged_in = false;
		$scope.newreg = false;
		$scope.tasklist.length = 0;
	}
});

todoApp.controller('taskCtrl', function($scope, $http, sharedProps) {
	$scope.tasklist = sharedProps.tasklist;

	$scope.remove = function(task) {
		var index = $scope.tasklist.indexOf(task);
		$scope.tasklist.splice(index, 1);
	}

	function fieldsFilled() {
		if ($scope.title == null || $scope.importance == null) {
			alert("Fill out the task fields");
			return false;
		}
		else {
			return true;
		}
	}

	$scope.addTask = function() {
		if (fieldsFilled()) {
			var t = {
				title: $scope.title,
				importance: $scope.importance,
				completed: false
			};

			$scope.tasklist.push(t);

			$scope.title = null;
			$scope.importance = null;
		}
	}

	//store tasks when leaving page
	$scope.$on('onBeforeUnload', function (e, confirmation) {
		var uid = localStorage.getItem("user_id");
		if (uid != null) {
	        $http({
				url: '../php/db_handler.php',
				method: 'POST',
				data:{
					jsondata: JSON.stringify($scope.tasklist),
					user_id: uid,
					func: 'storeTasks'
				}
			});
		}
    });
});