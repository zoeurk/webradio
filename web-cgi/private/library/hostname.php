<?php
	require("/www/private/library/tor.php");
	$network = new tornet();
	if($_SERVER['SERVER_NAME'] == "*.onion"){
		/*$content = file_get_contents('/var/opt/tor/service/hostname');
		$onion = str_replace(PHP_EOL, '', $content);*/
		$_SERVER['HOSTNAME'] = $network->toronion;
	}else{
		$_SERVER['HOSTNAME'] = $_SERVER['SERVER_NAME'];
	}
?>
