<?php

$config = parse_ini_file("../config.ini");

$pdo = new PDO('mysql:host='.$config['host'].';dbname='.$config['dbname'], 
	$config['username'], $config['password']);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

?>