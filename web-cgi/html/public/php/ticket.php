#!/usr/bin/php-cgi
<?php
	session_set_cookie_params([
		'samesite' => 'Lax'
	]);
	$var = explode("?",$_SERVER['REQUEST_URI']);
	$param = explode("&",$var[1]);
	for($i = 0; $i < 2; $i++){
		$temp = $param[$i];
		$myparam = explode("=",$temp);
		switch($myparam[0]){
			case "id":
				$id = $myparam[1];
				break;
			case "ticket":
				$ticket = $myparam[1];
				break;
		}
	}
	$sess = session_id();
	if($sess == false || $sess == ""){
		session_id($id);
	}
	session_start();
	if(isset($_SESSION['old_ticket'])){
		if($ticket == $_SESSION['old_ticket']){
			unset($_SESSION['old_ticket']);
			echo "true";
		}else{
			echo "false";
		}
	}else{
		echo "false";
	}
?>
