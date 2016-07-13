<?php

require_once "db_handler.php";

$postdata = file_get_contents("php://input");
$request = json_decode($postdata, false);

$ct = 0;
foreach($request as $item) {
	$ct++;
}
print_r(count((array)$request));

//echo is_valid_user($request->user, $request->pass) ? "true" : "false";

?>