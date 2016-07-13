<?php

require_once "pdo.php";



function is_valid_user($pdo, $u, $p) {
	$stmt = $pdo->prepare("SELECT * FROM users WHERE username=:username AND password=:password");
	$stmt->bindParam(':username', $u);
	$stmt->bindParam(':password', $p);
	$stmt->execute();
	$row = $stmt->fetch();
	if ($row) {
		echo $row['user_id'];
	}
	else {
		echo '';
	}
}

function register_user($pdo, $u, $p) {
	try {
		$stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (:username, :password)");
		$stmt->bindParam(':username', $u);
		$stmt->bindParam(':password', $p);
		$stmt->execute();
		
		$stmt = $pdo->prepare("SELECT LAST_INSERT_ID()");
		$stmt->execute();
		$row = $stmt->fetch();
		echo $row[0];
	}
	catch (PDOException $e) {
		echo '';
	}
}

function storeTasks($pdo, $jsondata, $user_id) {
	$tasklist = json_decode($jsondata);
	try {
		$pdo->query("DELETE FROM tasks");

		$query = "INSERT IGNORE INTO tasks (user_id, title, importance, completed) VALUES ";
		$qparam = array_fill(0, count($tasklist), "(?, ?, ?, ?)");
		$query .= implode(",", $qparam);
		$stmt = $pdo->prepare($query);
		$i = 1;
		foreach($tasklist as $task) {
			$stmt->bindValue($i++, $user_id);
			$stmt->bindValue($i++, $task->{'title'});
			$stmt->bindValue($i++, $task->{'importance'});
			$stmt->bindValue($i++, $task->{'completed'});
		}
		$stmt->execute();
	}
	catch (PDOException $e) {
		echo $e.error_log(message);
	}
}

function retrieveTasks($pdo, $user_id) {
	try {
		$stmt = $pdo->prepare("SELECT * FROM tasks WHERE user_id = :user_id");
		$stmt->bindParam(':user_id', $user_id);
		$stmt->execute();

		$tasklist = [];

		foreach($stmt as $row) {
			$task = (object) [
				'title' => $row['title'],
				'importance' => $row['importance'],
				'completed' => $row['completed']
			];
			array_push($tasklist, $task);
		}
		echo json_encode($tasklist);
	}
	catch (PDOException $e) {
		print_r($e.error_log(message));
	}
}

$postdata = file_get_contents("php://input");
$request = json_decode($postdata, false);
global $pdo;

//store values in array and use call_user_array_func
switch ($request->func) {
	case "is_valid_user":
		is_valid_user($pdo, $request->user, $request->pass);
		break;
	case "register_user":
		register_user($pdo, $request->user, $request->pass);
		break;
	case "storeTasks":
		storeTasks($pdo, $request->jsondata, $request->user_id);
		break;
	case "retrieveTasks":
		retrieveTasks($pdo, $request->user_id);
}

?>