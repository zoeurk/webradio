var myModal = new bootstrap.Modal(document.getElementById('warning'), {});
var myControles = new bootstrap.Modal(document.getElementById('controles'), {});
var check = new bootstrap.Dropdown(document.getElementById('options'), {});
var mySearch = new bootstrap.Modal(document.getElementById('modal_recherche'), {});

var isplaying = false;
var infoset = true;
function datasend(){
	if(data != false){
		clearTimeout(data);
		data = false;
	}
	DataSend.hide();
}
function songcurrentplaying(){
	datasend();
	song.init = 0;
	song.currentplaying(true);
}
function les_infos(){
	var el = document.getElementsByClassName('more_info');
	var dis = infoset == false ? "none" : 'block';
	infoset = !infoset;
	for(let i = 0; i < el.length; i++){
		el[i].style.display = dis;
	}
}
function menulst(itemclk, item){
	var doc = document.getElementById(itemclk);
	if(chanson.on == null){
		document.getElementById(itemclk).classList.toggle("active");
		document.getElementById('search-menu').classList.toggle("active");
		document.getElementById('search-menu').classList.toggle("d-none");
		switch(itemclk){
			case 'playlist-menu':
				chanson.work = chanson.playlist;
				//console.log(chanson.playlist);
				chanson.on = 'playlist';
				break;
			case 'library-menu':
				chanson.work = chanson.resultat;
				chanson.on = 'library';
				break;
		}
		chanson.change_to('all', null, null);
	}else{
		if(doc.className != "page-link active"){
			doc.classList.toggle("active");
			document.getElementById(item).classList.toggle("active");
			switch(itemclk){
				case 'playlist-menu':
					chanson.work = chanson.playlist;
					//console.log(chanson.playlist);
					chanson.on = 'playlist';
					break;
				case 'library-menu':
					chanson.work = chanson.resultat;
					chanson.on = 'library';
					break;
			}
			chanson.change_to('all', null, null);
		}
	}
}
function stopping(){
	document.getElementById('play').style.display = 'none';
	document.getElementById('play-').style.display = 'none';
	document.getElementById('pause').style.display = 'none';
	document.getElementById('pause-').style.display = 'none';
	document.getElementById('loading').style.display = 'none';
	document.getElementById('loading-').style.display = 'none';
}
function paused(){
	document.getElementById('play').style.display = 'block';
	document.getElementById('play-').style.display = 'block';
	document.getElementById('pause').style.display = 'none';
	document.getElementById('pause-').style.display = 'none';
	document.getElementById('loading').style.display = 'none';
	document.getElementById('loading-').style.display = 'none';
}
function isstalled(){
	document.getElementById('play').style.display = 'none';
	document.getElementById('play-').style.display = 'none';
	document.getElementById('pause').style.display = 'none';
	document.getElementById('pause-').style.display = 'none';
	document.getElementById('loading').style.display = 'block';
	document.getElementById('loading-').style.display = 'block';
}
function playing(){
	document.getElementById('play').style.display = 'none';
	document.getElementById('play-').style.display = 'none';
	document.getElementById('pause').style.display = 'block';
	document.getElementById('pause-').style.display = 'block';
	document.getElementById('loading').style.display = 'none';
	document.getElementById('loading-').style.display = 'none';
}
function login(response){
	document.getElementById('post_login').elements["username"].value = '';
	document.getElementById('post_login').elements["password"].value = '';
	var el = document.getElementsByClassName('id');
	var logout = document.getElementById('logoutaccueil');
	var nav = document.getElementsByClassName('nav-link');
	var active = document.getElementsByClassName('nav-link active');
	document.getElementById('audio_src').autoplay = true;
	if(logout.innerHTML != "Logout"){
		logout.innerHTML = "Logout";
		for(let i = 0;  i < el.length; i++){
			el[i].setAttribute('value', response.id);
		}
		ticket.new_tkt(response.ticket);
		chanson.resultat = response.msg;
		if(response.playlist[0] == 'null'){
			chanson.playlist = null;
			chanson.set_on = true;
			chanson.on = "all";
		}else{
			chanson.set_on = true;
			chanson.on = "playlist";
			chanson.playlist = response.playlist;
		}
		chanson.work = chanson.playlist;
		chanson.change_to('all', null, null);
		if(ticket.TIMEOUT != false)
			clearTimeout(ticket.TIMEOUT);
		ticket.TIMEOUT = setTimeout(() => { ticket.timeout_tkt(); }, ticket.tkt_time);
		document.getElementById('home_playlist').classList.toggle('d-none');
		document.getElementById('title').classList.toggle('d-none');
		document.getElementById('titre_actuel').classList.toggle('d-none');
		document.getElementById('recherche').classList.toggle('d-none');
		document.getElementById('options').classList.toggle('d-none');
		document.getElementById('prev').classList.toggle('d-none');
		document.getElementById('next').classList.toggle('d-none');
		document.getElementById('menu').classList.toggle('d-none');
		myControles.hide();
		for(let i = 0; i < 2; i++){
			nav[i].classList.toggle('active');
			nav[i].classList.toggle('link-primary');
			nav[i].classList.toggle('link-dark');
		}
	}
}

/*********************************/
function radio(chkid, chk){
	song.checkbox(chkid, document.getElementById(chkid).checked);
	check.hide();
}
function navitem(item){
	var req = new XMLHttpRequest();
	var nav = document.getElementsByClassName('nav-link');
	var active = document.getElementsByClassName('nav-link active');
	if(active[0] != nav[item]){
		for(let i = 0; i < 2; i++){
			if(item == 0){
				if(i == 0){
					document.getElementById('title').classList.toggle('d-none');
					document.getElementById('titre_actuel').classList.toggle('d-none');
					document.getElementById('home_playlist').classList.toggle('d-none');
					document.getElementById('options').classList.toggle('d-none');
					document.getElementById('recherche').classList.toggle('d-none');
					document.getElementById('prev').classList.toggle('d-none');
					document.getElementById('next').classList.toggle('d-none');
					document.getElementById('menu').classList.toggle('d-none');
					var Data = new FormData();
					var v_id = document.getElementById('id').getAttribute('value');
					var v_ticket = document.getElementById('ticket').getAttribute('value');
					Data.append('logout_id', v_id);
					Data.append('logout_ticket', v_ticket);
					req.onreadystatechange = function() {
						var accueil = document.getElementById('logoutaccueil');
						loaded = false;
						if(ticket.TIMEOUT != false)
							clearTimeout(ticket.TIMEOUT);
						ticket.TIMEOUT = false;
						accueil.innerHTML = "Accueil";
						if(infoset == true){
							les_infos();
						}
					}
					req.open("POST", proto + "://" + host + "/public/php/fin.php");
					req.send(Data);
				}
				nav[i].classList.toggle('active');
				nav[i].classList.toggle('link-primary');
				nav[i].classList.toggle('link-dark');
			}else{
				if(document.getElementById('logoutaccueil').innerHTML == "Accueil"){
					myControles.show();
				}
			}
		}
	}
}
/*********************************/
function playpause(stat, lestatus){
	if(stat != 'stalled'){
		if(lestatus == false){
			track.removeAttribute('src');
			delete("http://" + host + ":8000/stream");
			track.preload = "none";
			track.src = "http://" + host + ":8000/stream";
			track.currentTime = 0;
			track.load();
			track.play();
			lestatus = true;
			isplaying = true;
		}else{
			track.pause();
			track.removeAttribute('src');
			track.preload = "none";
			//track.currentTime = 0;
			delete("http://" + host + ":8000/stream");
			lestatus = false;
			isplaying = false;
			if(song.interval != false){
				clearInterval(song.interval);
			}
			if(chanson.interval != false){
				clearInterval(current.interval);
			}
			/*if(Interval.interval != false){
				clearInterval(Interval.interval);
			}*/
			if(document.getElementById('reqDuration').className.includes("text-warning") == true){
				document.getElementById('reqDuration').innerHTML = "Request: UNO";
				document.getElementById('reqResponse').innerHTML = "Response: UNO";
				document.getElementById('reqCount').innerHTML = "Req Count: UNO";
				document.getElementById('reqDuration').classList.toggle("text-success");
				document.getElementById('reqDuration').classList.toggle("text-warning");
			}
			if(document.getElementById('reqResponse').className.includes("text-warning") == true){
				document.getElementById('reqResponse').classList.toggle("text-success");
				document.getElementById('reqResponse').classList.toggle("text-warning");
			}
		}
	}else{
		if(isplaying == false){
			delete("http://" + host + ":8000/stream");
			track.preload = "none";
			track.src = "http://" + host + ":8000/stream";
			//track.currentTime = 0;
			track.load();
			track.play();
			lestatus = true;
			isplaying = true;
			song.currentplay(false);
		}else{
			track.pause();
			track.removeAttribute('src');
			track.preload = "none";
			//track.currentTime = 0;
			delete("http://" + host + ":8000/stream");
			lestatus = false;
			isplaying = false;
			if(song.interval != false){
				clearInterval(song.interval);
			}
			if(chanson.interval != false){
				clearInterval(current.interval);
			}
			/*if(Interval.interval != false){
				clearInterval(Interval.interval);
			}*/
			if(document.getElementById('reqDuration').className.includes("text-warning") == true){
				document.getElementById('reqDuration').innerHTML = "Request: UNO";
				document.getElementById('reqResponse').innerHTML = "Response: UNO";
				document.getElementById('reqCount').innerHTML = "Req Count: UNO";
				document.getElementById('reqDuration').classList.toggle("text-success");
				document.getElementById('reqDuration').classList.toggle("text-warning");
			}
			if(document.getElementById('reqResponse').className.includes("text-warning") == true){
				document.getElementById('reqResponse').classList.toggle("text-success");
				document.getElementById('reqResponse').classList.toggle("text-warning");
			}
		}
	}
}
function invalid(){
	myControles.hide();
	myModal.show();
}
document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('post_login').addEventListener('submit', (e) => {
		e.preventDefault();
		let form = e.target;
		fetch(form.action, { method: form.method, body: new FormData(form) })
			.then(response => response.json())
			.then(response => login(response))
			.catch((e) => invalid())
	});
	document.getElementById('form_recherche').addEventListener('submit', (e) => {
		e.preventDefault();
		recherche();
		mySearch.hide();
	});
});
function recherche(){
	var title = document.getElementById('title_search').value;
	document.getElementById('title_search').value = "";
	if(title.length == 0){
		switch(document.getElementById('Server').checked){
			case true:
				chanson.request("REPCART", document.getElementById('autheur').innerHTML, null, null, null, null);
				break;
			case false:
				chanson.request("REPLACE", document.getElementById('autheur').innerHTML, null, null, null, null);
				break;
		}
		if(document.getElementById('search-menu').className.includes('d-none') == false){
			document.getElementById('search-menu').classList.toggle("active");
			document.getElementById('search-menu').classList.toggle("d-none");
			if(document.getElementById('library-menu').className.includes('d-active') == true){
				document.getElementById('playlist-menu').classList.toggle("active");
				document.getElementById('library-menu').classList.toggle("active");
			}else{
				if(document.getElementById('playlist-menu').className.includes('d-active') == false){
					document.getElementById('playlist-menu').classList.toggle("active");
				}
			}
		}
	}else{
		chanson.find_that(title);
	}
}
track.addEventListener("ended", (event) => {
	paused();
	if(isplaying == true){
		delete(port + "://" + host + ":" + port +"/stream");
		track.preload = "none";
		track.src = "http://" + host + ":8000/stream";
		document.getElementById('play').style.display = 'none';
		document.getElementById('play-').style.display = 'none';
		document.getElementById('pause').style.display = 'none';
		document.getElementById('pause-').style.display = 'none';
		document.getElementById('loading').style.display = 'block';
		document.getElementById('loading-').style.display = 'block';
		song.init = 0;
		song.currentplaying(false);
		track.load();
		track.play();
		playing();
	}
});
function stal(){
	isstalled();
	if(isplaying == true){
		song.init = 0;
		song.currentplaying(false);
		track.play();
		playing();
	}
}
track.addEventListener("pause", (event) => {
	track.removeEventListener("stalled",stal());
	track.pause();
	track.removeAttribute('src');
	track.preload = "none";
	//track.currentTime = 0;
	delete("http://" + host + ":8000/stream");
	lestatus = false;
	isplaying = false;
	if(song.interval != false){
		clearInterval(song.interval);
	}
	if(chanson.interval != false){
		clearInterval(current.interval);
	}
	paused();
});
track.onplaying = function(){
	playing();
}
track.addEventListener("play", (event) => {
	track.addEventListener("stalled", stal());
	playing();
});
les_infos();
song.currentplaying(false);
