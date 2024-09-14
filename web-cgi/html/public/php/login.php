#!/usr/bin/php-cgi
<?php
	set_include_path(get_include_path() . PATH_SEPARATOR . '/www/html');
	require_once("/www/private/library/hostname.php");
	require('/www/private/library/session.php');
	require('/www/private/library/request.php');
	require('/www/private/library/chanson.php');
	//$success = array("url" => 1, "id" => "0", "ticket" => "0", "msg" => "Login success");
	$success = array("id" => "0", "ticket" => "0", "msg" => "Login success");
	if(isset($_POST['username']) && isset($_POST['password'])){
		$json = file_get_contents('/www/private/config/config.json');
		$conf = json_decode($json);
		if($conf->web->user == $_POST['username'] && $conf->web->password == $_POST['password']){
			check();
			if(isset($_SESSION['CERTIFIED'])){
				switch($_SESSION['CERTIFIED']){
					case false:
						$sess = new session();
						$sess->debut(true);
						$all = new chanson(true, false);
						$success["msg"] = json_decode($all->getlib());
						$playlist = $all->getplaylist();
						$success["playlist"]	= ($playlist == null)
									? json_decode('[ "null" ]')
									: json_decode($playlist);
						$success["ticket"] = $_SESSION["ticket"];
						$success["id"] = $_SESSION["id"];
						$_SESSION['RESPONSE'] = $success;
						echo json_encode($_SESSION['RESPONSE']);
						break;
					case true:
						$_SESSION['RESPONSE']['id'] = $_SESSION['id'];
						$_SESSION['RESPONSE']['ticket'] = $_SESSION['ticket'];
						echo json_encode($_SESSION['RESPONSE']);
						break;
				}
			}
		}
	}
	
?>
