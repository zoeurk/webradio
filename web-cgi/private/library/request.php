<?php
	function check(){
		$all = true;
		$result = true;
		$set = false;
		if(isset($remote_ip)){
			if($_SERVER['ip'] != $_SERVER['REMOTE_ADDR']){
				$result = false;
				$all = false;
			}else{
				$set = true;
			}
		}else{
			$_SERVER['ip'] = $_SERVER['REMOTE_ADDR'];
		}
		if(isset($_SERVER['host'])){
			if($_SERVER['host'] != $_SERVER['REMOTE_HOST']){
				if($_SERVER['host'] == 'undefined' && isset($_SERVER['REMOTE_HOST'])){
					$result = false;
					$all = false;
				}else
					$set = true;
			}
		}else{
			if(isset($_SERVER['REMOTE_HOST'])){
				$_SERVER['host'] = $_SERVER['REMOTE_HOST'];
			}else{
				$_SERVER['host'] = 'undefined';
			}
		}
		if(isset($_SERVER['useragent'])){
			if($_SERVER['useragent'] != $_SERVER['REMOTE_HOST']){
				$result = false;
				$all = false;
			}else{
				$set = true;
			}
		}else{
			$_SERVER['useragent'] = $_SERVER['HTTP_USER_AGENT'];
		}
		if($result == true && $all == true){
			$_SESSION['CERTIFIED'] = $set;
		}else{
			unset($_SESSION['CERTIFIED']);
		}
	}
?>
