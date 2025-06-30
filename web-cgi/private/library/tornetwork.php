<?php
	require_once("/www/private/library/tor.php");
	$network = new tornet();
	$network->read_req();
?>
<html lang="fr">
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="shortcut icon" href="/www/html/public/images/mush.ico" sizes="32x32"/>
		<title>Zoeurk JukeBox</title>
	</head>
	<body>
		<?php
			if($network->toronion != "Services"){
				echo "<h3>Access by Tor</h3>";
				echo "<h4>It looks like what you are using Tor</h4>Your ip is: <b style='color:green'>" . $network->ip[0] . "</b><br>And your country is: <b style='color:green'>" . $network->json->relays[0]->country_name . "</b><br>You while be redirected in few seconds to:<i style='color:green'>" . $network->toronion . "</i><br>If you are note redirected try <a href='http://zoeurk.freeddns.org/tor_onion_router'>ZoeurKJukeBox</a>";
			}
		?>
	</body>
	<script type="text/javascript">
		var url = <?php echo '"' . $network->toronion . '"';?>;
		if(url != "Services"){
			setTimeout(function(){window.location.replace("http://" + url);}, 2250);
		}
	</script>
</html>
<?php
	if($network->toronion != "Services"){
		exit;
	}
?>
