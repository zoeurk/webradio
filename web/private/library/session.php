<?php
	session_set_cookie_params([
		'samesite' => 'Lax'
	]);
	class session{
		function debut($get){
			session_start();
			$sess = session_id();
			$_SESSION['id'] = $sess;
			if($get == true){
        			$ticket = $sess.microtime().rand(0,9999999999);
				if(isset($_SESSION['ticket']))
					$_SESSION['old_ticket'] == $_SESSION['ticket'];
				$_SESSION["ticket"] = hash('sha512',$ticket);
			}
		}
		function courrante($id, $ticket){
			$sess = session_id($id);
			if(!isset($_SESSION["id"])){
				if($sess == true && $sess != ""){
					session_destroy();
				}
				$_SESSION = array();
			}else{
				$sess = $_SESSION['id'];
				if(!isset($id) || $_SESSION['id'] != $id){
					if($sess == true && $sess != ""){
						session_destroy();
					}
					if($sess != ""){
						session_destroy();
					}
					$_SESSION = array();
				}else{
					if(!isset($_SESSION['old_ticket']))
						$_SESSION['old_ticket'] = null;
					if($ticket == $_SESSION["ticket"] ||
						(isset($_SESSION['old_ticket']) && $ticket == $_SESSION['old_ticket'])){
						if($ticket == $_SESSION['ticket']){
							$_SESSION['old_ticket'] = $_SESSION['ticket'];
        						$ticket = $sess.microtime().rand(0,9999999999);
							$_SESSION["ticket"] = hash('sha512',$ticket);
							$_SESSION['new'] = true;
						}else{
							if($_SESSION['old_ticket'] && $_SESSION['old_ticket'] == $ticket)
								$_SESSION['new'] = false;
							else
								if(isset($_SESSION['new']))
									unset($_SESSION['new']);
						}
					}
				}
			}
		}
		function fin(){
			$_SESSION = array();
			session_destroy();
		}
	}
?>
