<!doctype html>
<?php
require_once("private/library/hostname.php");
	$proto = 'http';
	$port = '8000';
?>
<html lang="fr">
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet"
			integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous" />
		<!--link href="./public/ressources/bootstrap.min.css" rel="stylesheet"/-->
		<link rel="manifest" href="./manifest.json">
		<link rel="stylesheet" href="./public/ressources/style.css" />
		<link rel="shortcut icon" href="./public/images/mush.ico" sizes="32x32"/>
		<meta http-equiv="Cache-Control" content="max-age=60, no-store" />
		<meta http-equiv="Age" content="90" />
		<meta http-equiv="Expires" content="Thu, 1 January 1970 00:00:00 GMT" />
		<title>Zoeurk JukeBox</title>
	</head>
	<body>
		<form id="config" method='' action='' style="display:none;">
			<input id='host' name='config_host' value="<?php echo $_SERVER['HOSTNAME']; ?>">
			<input id='proto' name='config_proto'
				value="<?php echo $proto ?>">
			<input id='port' name='config_port' value="<?php echo $port; ?>">
			<input name="config_id" class='id' id="id" >
			<input name="config_ticket" class='ticket' id="ticket">
		</form>
		<div class="modal fade" id="warning">
			<div class="modal-dialog modal-dialog-centered">
				<div class="modal-content panel-warning">
					<div class="modal-header bg-warning">
						<b><h5 class="modal-title text-dark">Login Invalid</h5></b>
						<button type="button" class="btn-close text-dark" data-bs-dismiss="modal" aria-label="Close">
						</button>
					</div>
					<div class="modal-footer bg-warning">
						<button type="button" data-bs-dismiss="modal" class="btn btn-warning text-dark">Ok</button>
						<button type="button" id="datanotsend" data-bs-dismiss="modal"
							class="btn btn-warning text-dark"
						>fermer</button>
					</div>
				</div>
			</div>
		</div>
		<div class="modal fade" id="DataSend">
			<div class="modal-dialog">
				<div class="modal-content panel-success">
					<div class="modal-header bg-success">
						<b><h5 class="modal-title">Data Send ;-)</h5></b>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
						</button>
					</div>
					<div class="modal-footer bg-success">
						<button type="button" onclick="datasend();" class="btn btn-success">Ok</button>
						<button type="button" onclick="datasend()";
							class="btn btn-success"
						>fermer</button>
					</div>
				</div>
			</div>
		</div>
		<div class="modal fade" id="DataRecv">
			<div class="modal-dialog">
				<div class="modal-content panel-success">
					<div class="modal-header bg-success">
						<b><h5 class="modal-title">Data Received ;-)</h5></b>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
						</button>
					</div>
					<div class="modal-footer bg-success">
						<button type="button"  data-bs-dismiss="modal" class="btn btn-success">Ok</button>
						<button type="button"  data-bs-dismiss="modal";
							class="btn btn-success"
						>fermer</button>
					</div>
				</div>
			</div>
		</div>
		<div class="modal fade" id="controles">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Login:</h5>
						<b><span id="response_login" class="text-danger" style="display:none;">response</span></b>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
							onclick="navitem(0)">
						</button>
					</div>
					<form method="post" id='post_login' action="public/php/login.php" autocomplete='on'>
						<div class="mb-3">
							<label for="username" class="form-label" style="padding-left:5%;">Utilisateur:</label>
							<input type="text" class="form-control" name="username" id="username"
								autocomplete='username' required/>
						</div>
						<div class="mb-3">
							<label for="password" class="form-label" style="padding-left:5%;">Mot de passe:</label>
							<input type="password" class="form-control" name="password" id="password"
								autocomplete='current-password' required/>
						</div>
						<div class="modal-footer">
							<button type="submit"
								class="btn btn-primary"
							>Soumettre</button>
							<button type="button"
								data-bs-dismiss="modal"
								class="btn btn-primary"
								id='fermer' onclick="navitem(0)"
							>Fermer</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		<div class="modal fade" id="modal_recherche">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Recherche:</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<form method="post" id='form_recherche' action="">
						<div class="form-group row">
							<label for="title_search" class="form-label col-sm-2 col-form-label"
								style="padding-left:5%;"
							>titre:</label>
							<div class="col-sm-10">
								<input type="titre" class="form-control" name="titre" id="title_search"/>
 <input class="form-check-input" type="checkbox" value="" id="Server">
  <label class="form-check-label" for="Server">
    Server Request
 </label>
							</div>
						</div>
						<div class="modal-footer">
							<button type="button" 
								data-bs-dismiss="modal"
								class="btn btn-primary"
								onclick="recherche()"
								id="soumettre"
							>Soumettre</button>
							<button type="button" data-bs-dismiss="modal" class="btn btn-primary">Fermer</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		<div class="d-flex justify-content-around" id="title">
			<b id="zoeurk"><u>ZoeurK JukeBox</u></b>
		</div>
		<nav class="navbar navbar-expand-sm navbar-light" style="background-color:lightblue;border-color:lightblue;">
			<div class="container-fluid">
				<span class="navbar-brand"><b>Radio</b></span>
				<button class="navbar-toggler"
					style="color:lightblue;"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#navbarsRadio"
					aria-controls="navbarsRadio"
					aria-expanded="false">
					<span class="navbar-toggler-icon"></span>
				</button>
				<div class="collapse navbar-collapse" id="navbarsRadio">
					<ul class="navbar-nav me-auto mb-2 mb-sm-0">
						<li class="nav-item">
							<a class="nav-link link-primary active"
								id="logoutaccueil"
								data-bs-toggle="collapse"
								data-bs-target="#navbarsRadio"
								onclick="navitem(0)"
								href="javascript:void(0);"
							>Accueil</a>
						</li>
						<li class="nav-item">
							<a class="nav-link link-dark"
								id="controles-item"
								data-bs-toggle="collapse"
								data-bs-target="#navbarsRadio"
								onclick="navitem(1)"
								href="javascript:void(0);"
							>Controles</a>
						</li>
						<li class="nav-item">
							<!--dropdown-toggle-->
							<div class="dropdown show">
								<a class="nav-link link-dark d-none"
									data-bs-toggle="dropdown"
									aria-expanded="false"
									data-bs-auto-close="true"
									id="options"
									href="javascript:void(0);"
								>Options</a>
									<ul class="dropdown-menu" style='background-color:lightblue;'>
										<li><a class="dopdown-item" 
											href='javascript:void(0);'
										>
											<div class="d-flex flex-row bd-highlight mb-3">
												<div class="form-check form-check-inline">
													<input class="form-check-input"
														data-bs-toggle="collapse"
														data-bs-target="#navbarsRadio"
														type="checkbox"
														name="ConfigRadio"
														onclick="radio('loop', 1)"
														id="loop"
														value="loop"
													>
													<label class="form-check-label"
														for="loop"
													>loop</label>
												</div>
												<div class="form-check form-check-inline">
													<input class="form-check-input"
														data-bs-toggle="collapse"
														data-bs-target="#navbarsRadio"
														type="checkbox"
														name="ConfigRadio"
														onclick="radio('shuffle',2)"
														id="shuffle"
														value="shuffle"
													>
													<label class="form-check-label"
														for="shuffle"
													>shuffle</label>
												</div>
											</div>
							    			</a>
									</li>
								</ul>
							</div>
						</li>
						<li class="nav-item">
							<a class="nav-link link-dark d-none"
								data-bs-toggle="collapse"
								data-bs-target="#navbarsRadio"
								id="recherche"
								onclick="mySearch.show()"
								href="javascript:void(0);"
							>Recherche</a>
						</li>
					</ul>
				</div>
			</div>
		</nav>
		<div class="d-flex align-items-end flex-column mb-1 me-4" id="inforeq">
			<div class="text-success" id='reqDuration'>Duration:</div>
			<div class="text-success" id='reqResponse'>Response:</div>
			<div class="text-success" id='reqCount'>count:</div>
		</div>
		<div class="d-flex flex-row" id="titre_actuel">
			<div class="p-2"><b><u>titre actuel:</u></b></div>
		</div>
		<div class="justify-content-center">
			<a class="d-flex justify-content-center autheur_info" href="javascript:void(0);"
				id='les_infos_click' onclick="les_infos()">
			 <ul class="d-flex justify-content-center">
			  <li class="d-flex justify-content-center ms-0"><b>Artiste:</b></li>
			  <li>
				<div class="d-flex justify-content-center">
					<div id="autheur" class="brown"></div>
					<div class="triangle-down"></div>
				</div>
			  </li>
			 </ul>
			</a>
			<div class="more_info" id="album_info" style="display:none;">
			 <ul class="d-flex justify-content-center">
			  <li class="d-flex justify-content-center m-0"><b>Album:</b></li>
			  <li id="album" class="d-flex justify-content-center brown"></li>
			 </ul>
			</div>
			<div class="more_info" id="titre_info" style="display:none;">
			 <ul class="d-flex justify-content-center">
			  <li class="d-flex justify-content-center m-0"><b>titre:</b></li>
			  <li id="titre" class="d-flex justify-content-center brown"></li>
			 </ul>
			</div>
		</div>
		<div class="d-flex justify-content-center">
			<div class="d-flex flex-row bd-highlight mb-3">
				<div class="d-flex flex-column bd-highlight mb-2 p-2 d-none" id="next">
					<a class="text-decoration-none bd-highlight"
						style="color:black;display:block;"
						onclick="song.prev()"
						href="javascript:void(0);">
						<img src='public/images/prev-24x24.png'>
						<figcaption>prev</figcaption>
					</a>
				</div>
				<div class="d-flex flex-column bd-highlight mb-2 p-2">
					<a class="text-decoration-none bd-highlight" id="loading"
						style="color:black;display:none;"
						onclick="playpause('stalled', null)"
						href="javascript:void(0);">
						<img id='loading-' style="color:black;display:none;" src='public/images/loading-24x24.png'>
						<figcaption>loading</figcaption>
					</a>
					<a class="text-decoration-none bd-highlight" id="play"
						style="color:black;display:block;"
						onclick="playpause('play', false)"
						href="javascript:void(0);">
						<img id='play-' style="color:black;display:block;" src='public/images/pause-24x24.png'>
						<figcaption>pause</figcaption>
					</a>
					<a class="text-decoration-none bd-highlight" id="pause"
						onclick="playpause('pause', true)"
						style="color:black;display:none;"
						href="javascript:void(0);">
						<img id='pause-' style="color:black;display:block;" src='public/images/play-24x24.png'>
						<figcaption>play</figcaption>
					</a>
					<a class="text-decoration-none bd-highlight" id="loading"
						style="color:black;display:none;"
						onclick="playpause('play', false)"
						href="javascript:void(0);">
						<img id='loading-' style="color:black;display:none;" src='public/images/loading-24x24.png'>
						<figcaption>stalled</figcaption>
					</a>
				</div>
				<div class="d-flex flex-column bd-highlight mb-2 p-2 d-none" id="prev">
					<a class="text-decoration-none bd-highlight"
						style="color:black;display:block;"
						onclick="song.next()"
						href="javascript:void(0);">
						<img src='public/images/next-24x24.png'>
						<figcaption>next</figcaption>
					</a>
				</div>
				<div class="d-flex flex-column bd-highlight mb-2 p-2">
					<a class="text-decoration-none bd-highlight"
						style="color:black;display:block;"
						onclick="songcurrentplaying()"
						href="javascript:void(0);">
						<img src='public/images/reload-24x24.png'>
						<figcaption>reload</figcaption>
					</a>
				</div>
			</div>
		</div>
		<div class="d-flex flex-column bd-highlight mb-1">
			<audio id="track">
				<source preload="false"
					id="audio_src"
					src="<?php echo $proto . '://' . $_SERVER['HOSTNAME'] . ':' . $port . '/stream'; ?>"
					type="audio/ogg"
				/>
			</audio>
		</div>
		<nav class="d-none" id="menu" aria-label="pagination">
			<ul class="pagination justify-content-center">
				<li class="page-item">
					<a class="page-link active" id="playlist-menu" onclick="menulst('playlist-menu', 'library-menu')" href="javascript:void(0)">Playlist</a>
				</li>
				<li class="page-item">
					 <a class="page-link" id="library-menu" onclick="menulst('library-menu', 'playlist-menu')" href="javascript:void(0)">Library</a>
				</li>
				<li class="page-item">
					 <a class="page-link d-none" id="search-menu" onclick="menulst('search-menu', null)" href="javascript:void(0)">Search</a>
				</li>
			</ul>
		</nav>
		<div id='home_playlist' class='d-none'>
			<div class="d-flex flex-column" id="home">
				<button	type='button'
					class="btn btn-primary"
					id="end"
					ondblclick="chanson.change_to('all', null, null)">Home<button/>
			</div>
			<div class="d-flex flex-column">
				<div class="container" id="playlist">
				</div>
			</div>
		</div>
		<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js"
			integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm" crossorigin="anonymous">
		<!--script src="./public/ressources/bootstrap.bundle.min.js"-->
		</script>
		<script type="text/javascript" src="./public/ressources/object.js">
		</script>
		<script type="text/javascript" src="./public/ressources/main.js">
		</script>
	</body>
</html>
