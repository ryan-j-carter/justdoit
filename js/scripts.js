
var todoApp = angular.module('todoApp', [])
.service('sharedProps', function() {
	var _tasklist = [];

	this.retrieveTasks = function(user_id, $http) {
		$http({
			url:'../php/request_handler.php',
			method:'POST',
			data: {
				func:'retrieveTasks',
				params: [user_id]
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
		var filled = true;
		if ($scope.username == null) {
			$('#username input').addClass("err-empty-input");
			filled = false;
		}
		if ($scope.password == null) {
			$('#password input').addClass("err-empty-input");
			filled = false;
		}
		return filled;
	}

	$scope.login = function() {
		if (fieldsFilled()) {
			$http({
				url: '../php/request_handler.php',
				method: 'POST',
				data: {
					func:'isValidUser',
					params: [$scope.username, $scope.password]
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
				}
				else {
					$('#bad-login').removeClass("hidden");
					$scope.reg = false;
				}
				$scope.password = null;
			});
		}
	}

	$scope.register = function() {
		if (fieldsFilled()) {
			$http({
				url: '../php/request_handler.php',
				method: 'POST',
				data: {
					func:'registerUser',
					params: [$scope.username, $scope.password]
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
					$('#bad-login').removeClass("hidden");
					$scope.reg = true;
				}
				$scope.password = null;
			});
		}
	}

	$scope.logout = function() {
		var user_id = localStorage.getItem("user_id");
		if (user_id != null) {
	        $http({
				url: '../php/request_handler.php',
				method: 'POST',
				data:{
					func: 'storeTasks',
					params: [JSON.stringify($scope.tasklist), user_id]
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
			url: '../php/request_handler.php',
			method: 'POST',
			data: {
				func: 'removeTask',
				params: [localStorage.getItem("user_id"), task.title]
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
			url: '../php/request_handler.php',
			method: 'POST',
			data: {
				func: 'storeTasks',
				params: [JSON.stringify($scope.tasklist), localStorage.getItem("user_id")]
			}
		}).success(function(data) {
			$('#success').trigger('save-success');
		});
	}
});

$(document).ready(function() {
	$('#username input, #password input').on("focus", function() {
		$(this).removeClass("err-empty-input");
		$('#bad-login').addClass("hidden");
	});

	$('#success').on('save-success', function() {
		var that = $(this);
		that.removeClass("invisible");
		setTimeout(function() {that.addClass("invisible");}, 2000);
	});
});