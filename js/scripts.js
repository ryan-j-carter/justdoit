
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
					func:"isValidUser"
				}
			}).success(function(data) {
				if (data != '') {
					localStorage.setItem("username", $scope.username);
					localStorage.setItem("password", $scope.password);
					localStorage.setItem("user_id", data);

					sharedProps.retrieveTasks(data, $http);

					$scope.name = $scope.username;
					$scope.logged_in = true;
					$scope.username = null;				}
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
					func:"registerUser"
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

	$scope.removeTask = function(task) {
		var index = $scope.tasklist.indexOf(task);
		$scope.tasklist.splice(index, 1);
		$http({
			url: '../php/db_handler.php',
			method: 'POST',
			data: {
				user_id: localStorage.getItem("user_id"),
				title: task.title,
				func: 'removeTask'
			}
		});
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

			//ignore request if the task is in the list
			if ($scope.tasklist.some(function(task) {return task.title == $scope.title;})) {
				return;
			}
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

	$scope.saveTasks = function() {
		console.log($scope.tasklist);
		$http({
			url: '../php/db_handler.php',
			method: 'POST',
			data: {
				jsondata: JSON.stringify($scope.tasklist),
				user_id: localStorage.getItem("user_id"),
				func: 'storeTasks'
			}
		}).success(function(data) {
			console.log(data);
		});
	}
});