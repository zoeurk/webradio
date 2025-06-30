#!/usr/bin/php-cgi
<?php
/*set_include_path(get_include_path() . PATH_SEPARATOR . '/www/html/');*/
	require_once("/www/private/library/tor.php");
	header('Cache-Control: no-store, post-check=0, pre-check=0');
	header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');
	$network = new tornet();
	$network->read_req();
?>
<!doctype html>
<html lang="fr">
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="shortcut icon" href="../public/images/mush.ico" sizes="32x32"/>
		<title>Zoeurk JukeBox: Tor Access</title>
	</head>
	<body style="background-color:lightblue;">
		<center>
			<p>Info: Access to my audio stream</p>
			<?php
				if($network->toronion != "Services"){
					echo "<h5>Access by <b>Tor</b></h5><h6>Exit node: <b style='color:green'>" . $_SERVER['REMOTE_ADDR'] . "</b><br>Country: <b style='color:green'>" . $network->json->relays[0]->country_name . "</b></h6>";
				}else{
					echo "<h5>Public Access (You should use <a href='https://www.torproject.org/' target='_blank'>TOR</a> or somthing based on)</h5>";
				}
			?>
			<p>Click on this <a href="http://<?php echo ($network->toronion == "Services") ? $_SERVER['SERVER_NAME'] : $network->toronion;?>:8001/stream">Link</a> to continue</p>
			<p>You can bookmark this auto-redirected <a href="./streams.php">link</a>
	</center>
	</body>
</html>

