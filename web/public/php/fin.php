<?php
	set_include_path(get_include_path() . PATH_SEPARATOR . $_SERVER['DOCUMENT_ROOT']);
	require('private/library/session.php');
	if(isset($_POST['logout_id']))
		$req_id = $_POST['logout_id'];
	else
		exit;
	if(isset($_POST['logout_ticket']))
		$req_ticket = $_POST['logout_ticket'];
	else
		exit;
	$sess = new session();
	$sess->debut(false);
	$sess->courrante($req_id, $req_ticket);
	if(isset($_SESSION['id']) && isset($_SESSION['new']))
		$sess->fin();
?>
