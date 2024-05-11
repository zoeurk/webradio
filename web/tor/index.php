<!doctype html>
	<?php
			$content = file_get_contents('/var/opt/tor/service/hostname');
			$onion = str_replace(PHP_EOL, '', $content);
			header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
			header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');
			header("Location:http://" . $onion, true, 301);
			exit;
	?>
<html lang="fr">
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="shortcut icon" href="/images/mush.ico" sizes="32x32"/>
		<title>Zoeurk JukeBox: Tor Access</title>
	</head>
	<body>
		Info: Access to this site by tor (code html: 301)
	</body>
</html>

