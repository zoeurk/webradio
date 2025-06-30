#!/usr/bin/php-cgi
<?php
/*set_include_path(get_include_path() . PATH_SEPARATOR . '/www/html/');*/
	require_once("/www/private/library/tor.php");
	header('Cache-Control: no-store, post-check=0, pre-check=0');
	header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');
	$network = new tornet();
	$network->read_req();
	if($network->toronion != "Services"){
		header("Location:http://" . $network->toronion . ":8001/stream", true, 301);
	}else{
		header("Location:http://" . $_SERVER['SERVER_NAME'] . ":8001/stream", true, 301);
	}
?>
<!doctype html>
<html lang="fr">
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="shortcut icon" href="../public/images/mush.ico" sizes="32x32"/>
		<title>Zoeurk JukeBox: Tor Access</title>
	</head>
	<body>
		<p>Info: Access to my audio stream (Redirection)</p>
	</body>
</html>

