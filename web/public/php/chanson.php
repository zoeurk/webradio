<?php
	require("../../private/library/chanson.php");
	require("../../private/library/session.php");
	function loggeduser($id, $ticket){
		if($id != null)
			$req_id = $id;
		else
			return -1;
		if($ticket != null)
			$req_ticket = $ticket;
		else
			return -1;
		$sess = new session();
		$sess->courrante($req_id, $req_ticket);
		return 0;
	}
	function session($ticket){
		$sess = new session();
		$sess->debut(false);
		if($ticket == true){
			if(isset($_SESSION['ticket'])){
				if((!isset($_POST['id']) || !isset($_POST['ticket'])) || loggeduser($_POST['id'], $_POST['ticket']) < 0){
					session_destroy();
					$_SESSION = array();
					session_id();
					session_start();
					return -1;
				}
				return 0;
			}
		}
	}
	$url = explode("?", $_SERVER['REQUEST_URI']);
	switch($url[1]){
		case "current":
			$chanson = new chanson(false, false);
			$val = $chanson->current("status");
			$val['Date'] = gmdate(DATE_RFC2822);
			echo json_encode($val, null);
			break;
		case "next":
			$chanson = new chanson(false, false);
			$val = $chanson->nextsong("queue");
			$val['Date'] = gmdate(DATE_RFC2822);
			echo json_encode($val);
			break;
		case "go_next":
			if(session(true) == 0 && isset($_SESSION['ticket'])){
				$chanson = new chanson(true, false);
				$val = $chanson->nextsong("next");
				$val[0]->info->id = $_SESSION['id'];
				$val[0]->info->ticket = $_SESSION['ticket'];
				$val['Date'] = gmdate(DATE_RFC2822);
				echo json_encode($val);
			}
			break;
		case "go_prev":
			if(session(true) == 0 && isset($_SESSION['ticket'])){
				$chanson = new chanson(true, false);
				$val = $chanson->current("prev");
				$val[1]->info->next[0]->info->id = $_SESSION['id'];
				$val[1]->info->next[0]->info->ticket = $_SESSION['ticket'];
				$val['Date'] = gmdate(DATE_RFC2822);
				echo json_encode($val);
			}
			break;
		case "play_this":
			if(session(true) == 0 && isset($_SESSION['ticket'])){
				$chanson = new chanson(true, false);
				$chanson->play_this($_POST['artist'], $_POST['date'], $_POST['album'], $_POST['track'], $_POST['title']);
				$val = $chanson->current("status");
				$val[1]->info->next[0]->info->id = $_SESSION['id'];
				$val[1]->info->next[0]->info->ticket = $_SESSION['ticket'];
				$val['Date'] = gmdate(DATE_RFC2822);
				echo json_encode($val);
			}
			break;
		case "ticket":
			if(session(true) == 0 && isset($_SESSION['ticket'])){
				$val = array('id' => 0, 'ticket' => 0);
				$val['id'] = $_SESSION['id'];
				$val['ticket'] = $_SESSION['ticket'];
				echo json_encode($val);
			}
			break;
		case "REMOVE":
			if(session(true) == 0 && isset($_SESSION['ticket'])){
				$chanson = new chanson(true, false);
				$chanson->remove($_POST['artist'], $_POST['date'], $_POST['album'], $_POST['track'], $_POST['title']);
				$chanson->createplaylist();
				$playlist = $chanson->getplaylist();
				$val = $chanson->current("status");
				$val[1]->info->next[0]->info->id = $_SESSION['id'];
				$val[1]->info->next[0]->info->ticket = $_SESSION['ticket'];
				$val['playlist'] = json_decode($playlist);
				$val['Date'] = gmdate(DATE_RFC2822);
				echo json_encode($val);
			}
			break;
		case "REPCART":
			if(session(true) == 0 && isset($_SESSION['ticket'])){
				$chanson = new chanson(true, ($_POST['shuffle'] == "on") ? true : false);
				$chanson->curart();
				$playlist = $chanson->getplaylist();
				$val = $chanson->current("status");
				$val[1]->info->next[0]->info->id = $_SESSION['id'];
				$val[1]->info->next[0]->info->ticket = $_SESSION['ticket'];
				$val['playlist'] = json_decode($playlist);
				$val['Date'] = gmdate(DATE_RFC2822);
				echo json_encode($val);
			}
			break;
		case "REPLACE":
			if(session(true) == 0 && isset($_SESSION['ticket'])){
				$chanson = new chanson(true, ($_POST['shuffle'] == "on") ? true : false);
				if($_POST['artist'] != 'all'){
					$chanson->replace($_POST['artist'], $_POST['date'], $_POST['album'], $_POST['track'], $_POST['title']);
					$chanson->createplaylist();
					$playlist = $chanson->getplaylist();
				}else{
					$chanson->tolibrary();
					$playlist = "['null']";
				}
				$val = $chanson->current("status");
				$val[1]->info->next[0]->info->id = $_SESSION['id'];
				$val[1]->info->next[0]->info->ticket = $_SESSION['ticket'];
				$val['playlist'] = json_decode($playlist);
				$val['Date'] = gmdate(DATE_RFC2822);
				echo json_encode($val);
			}
			break;
		case "APPEND":
			if(session(true) == 0 && isset($_SESSION['ticket'])){
				$chanson = new chanson(true, ($_POST['shuffle'] == "on") ? true : false);
				$chanson->remove($_POST['artist'], $_POST['date'], $_POST['album'], $_POST['track'], $_POST['title']);
				$chanson->append($_POST['artist'], $_POST['date'], $_POST['album'], $_POST['track'], $_POST['title']);
				$chanson->createplaylist();
				$playlist = $chanson->getplaylist();
				$val = $chanson->current("status");
				$val[1]->info->next[0]->info->id = $_SESSION['id'];
				$val[1]->info->next[0]->info->ticket = $_SESSION['ticket'];
				$val['playlist'] = json_decode($playlist);
				$val['Date'] = gmdate(DATE_RFC2822);
				echo json_encode($val);
			}
			break;
		case "PLAY":
			if(session(true) == 0 && isset($_SESSION['ticket'])){
				$chanson = new chanson(true, ($_POST['shuffle'] == "on") ? true : false);
				$chanson->addplay($_POST['artist'], $_POST['date'], $_POST['album'], $_POST['track'], $_POST['title']);
				$chanson->createplaylist();
				$playlist = $chanson->getplaylist();
				$val = $chanson->current("status");
				$val[1]->info->next[0]->info->id = $_SESSION['id'];
				$val[1]->info->next[0]->info->ticket = $_SESSION['ticket'];
				$val['playlist'] = json_decode($playlist);
				$val['Date'] = gmdate(DATE_RFC2822);
				echo json_encode($val);
			}
			break;
		case "options":
			if(session(true) == 0 && isset($_SESSION['ticket'])){
				if(isset($_POST['shuffle'])){
					$chanson = new chanson(true, ($_POST['shuffle'] == "on") ? true : false);
					$chanson->random($_POST['shuffle']);
					$val = $chanson->current("status");
					$val[1]->info->next[0]->info->id = $_SESSION['id'];
					$val[1]->info->next[0]->info->ticket = $_SESSION['ticket'];
				}elseif(isset($_POST['loop'])){
					$chanson = new chanson(true, false);
					$val = array('id' => 0, 'ticket' => 0);
					$val['id'] = $_SESSION['id'];
					$val['ticket'] = $_SESSION['ticket'];
					$chanson->loop($_POST['loop']);
				}
				$val['Date'] = gmdate(DATE_RFC2822);
				echo json_encode($val);
			}
			break;
		
	}
?>
