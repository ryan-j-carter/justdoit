<?php

require_once "pdo.php";
require_once "db_handler.php";

global $pdo;

$postdata = file_get_contents("php://input");
$request = json_decode($postdata, false);

array_push($request->params, $pdo);

call_user_func_array($request->func, $request->params);

?>