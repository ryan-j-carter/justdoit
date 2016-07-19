<?php

function isValidUser($u, $p, $pdo) {
	try {
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
	catch (PDOException $e) {
		print_r($e.error_log(message));
	}
}

function registerUser($u, $p, $pdo) {
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

function storeTasks($jsondata, $user_id, $pdo) {
	try {
		$tasklist = json_decode($jsondata);
		$query = "INSERT INTO tasks (user_id, title, importance, completed) VALUES ";
		$qparam = array_fill(0, count($tasklist), "(?, ?, ?, ?)");
		$query .= implode(",", $qparam);
		$query .= " ON DUPLICATE KEY UPDATE importance=VALUES(importance), completed=VALUES(completed)";
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
		print_r($e.error_log(message));
	}
}

function retrieveTasks($user_id, $pdo) {
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

function removeTask($user_id, $title, $pdo) {
	try {
		$stmt = $pdo->prepare("DELETE FROM tasks WHERE user_id = :user_id AND title = :title");
		$stmt->bindParam(':user_id', $user_id);
		$stmt->bindParam(':title', $title);
		$stmt->execute();
	}
	catch(PDOException $e) {
		print_r($e.error_log(message));
	}
}

?>