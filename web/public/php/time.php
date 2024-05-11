<?php
			$timed = array();
			$times[0] = $_SERVER['REQUEST_TIME'];
			$times[1] = time();
			$times[0] = date("H:i:s", $times[0]);
			$times[1] = date("H:i:s", $times[1]);
			$origin = new DateTimeImmutable($times[0]);
			$target = new DateTimeImmutable($times[1]);
			$times[2] = $origin->diff($target);
			$times[2] = $times[2]->format('%H:%i:%s');
			//echo $times[1] . "-" . $times[0] . "=" . $times[2];
?>
<html lang="fr">
	<head>
		<title>test:date</title>
	</head>
	<body>
		<h1><?php echo $times[1] . "-" . $times[0] . "=" . $times[2] . "(" . date(DATE_RFC2822) . ")"; ?></h1>
		<h1 id='date'></h1>
	</body>
	<script type="text/javascript">
		var d = new Date();
		document.getElementById('date').innerHTML = "Date: " + d.toString();
		//console.log(d.toString());
	</script>
</html>
