<?php
			if($_SERVER['SERVER_NAME'] == "*.onion"){
				$content = file_get_contents('/var/opt/tor/service/hostname');
				$onion = str_replace(PHP_EOL, '', $content);
				$_SERVER['HOSTNAME'] = $onion;
			}else{
				$_SERVER['HOSTNAME'] = $_SERVER['SERVER_NAME'];
			}
?>

