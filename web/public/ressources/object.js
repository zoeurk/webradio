const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTrigger => new bootstrap.Tooltip(tooltipTrigger));
const DataSend = new bootstrap.Modal(document.getElementById('DataSend'), {});
const DataRecv = new bootstrap.Modal(document.getElementById('DataRecv'), {});

const proto = document.getElementById('proto').getAttribute('value');
const host = document.getElementById('host').getAttribute('value');
const port = document.getElementById('port').getAttribute('value');
const track = document.getElementById('track');

const maxc = 3
const timeset = 15000;
var data = false;
var hide = false;
var count = 0;
function DataReceived(){
	if(hide != false){
		DataRecv.hide();
		clearTimeout(hide);
		DataRecv.show();
		hide = false;
	}else{
		DataRecv.show();
	}
	hide = setTimeout(() => {
		DataRecv.hide();
		hide = false;
	}, 1250)
}
var ticket = {
	protocole: proto,
	hostname: host,
	id: null,
	ticket: null,
	tkt_time: 900000,
	TICKET_TIMEOUT: false,
	interval: false,
	cur_tkt: function(){
		this.id = document.getElementById('id').getAttribute('value');
		this.ticket = document.getElementById('ticket').getAttribute('value');
	},
	new_tkt: function(ticket){
		let el = document.getElementsByClassName('ticket');
		for(let i = 0;  i < el.length; i++){
			el[i].setAttribute('value', ticket);
		}
	},
	delete_tkt: function(){
		var end = new XMLHttpRequest();
		var interval = false;
		this.cur_tkt()
		end.onreadystatechange = function(){
			if(this.readyState == 4 && this.status == 200){
				if(interval != false){
					clearInterval(interval);
					interval = false;
				}
			}
		}
		end.open("GET", this.protocole + "://" + this.hostname + "/public/php/ticket.php?id=" + this.id + "&ticket=" + this.ticket);
		end.send();
		interval = setInterval(() => {
			end.open("GET",
				this.protocole + "://" + this.hostname + "/public/php/ticket.php?id=" + this.id + "&ticket=" + this.ticket);
			end.send();
		}, timeset);
	},
	timeout_tkt: function (){
		var request = new XMLHttpRequest();
		var Data = new FormData();
		this.cur_tkt();
		var requrl = this.protocole + "://" + this.hostname + "/public/php/chanson.php?ticket";
		Data.append('id', this.id);
		Data.append('ticket', this.ticket);
		var tkt = this;
		request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				console.log(this.responseText);
				var login = JSON.parse(this.responseText);
				if(tkt.interval != false){
					clearInterval(tkt.interval);
					tkt.intetval = false;
				}
				tkt.delete_tkt();
				tkt.new_tkt(login.ticket);
				if(tkt.TIMEOUT != false)
					clearTimeout(ticket.TIMEOUT);
				tkt.TIMEOUT = setTimeout(() => { tkt.timeout_tkt(); }, tkt.tkt_time);
			}
		};
		request.open("POST", requrl);
		request.send(Data);
		this.interval = setInterval(() => {
			request.open("POST", requrl);
			request.send(Data);
		}, timeset);
	}
};
var song = {
	protocole: proto,
	hostname: host,
	myjson: null,
	init: 0,
	artist: null,
	album: null,
	titre: null,
	time: null,
	random: null,
	repeat: null,
	Data: new FormData(),
	nextsong: "/public/php/chanson.php?go_next",
	prevsong: "/public/php/chanson.php?go_prev",
	current_song: "/public/php/chanson.php?current",
	next_song: "/public/php/chanson.php?next",
	options: "/public/php/chanson.php?options",
	requrl: null,
	TIMEOUT: false,
	interval: false,
	reqDuration: document.getElementById('reqDuration'),
	reqResponse: document.getElementById('reqResponse'),
	reqCount: document.getElementById('reqCount'),
	checkbox: function(type, value){
		ticket.cur_tkt();
		if(this.interval != false){
			return false;
			//clearInterval(this.interval);
			//this.interval = false;
		}
		var request = new XMLHttpRequest();
		var currentplay = this;
		this.Data.append('id', ticket.id);
		this.Data.append('ticket', ticket.ticket);
		this.Data.append(type, (value == false) ? "off" : "on");
		this.requrl = this.protocole + "://" + this.hostname + this.options;
		var set = false;
		var reqtime = Date().now;
		var req = this;
		req.reqDuration.classList.toggle("text-success");
		req.reqDuration.classList.toggle("text-warning");
		request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				console.log(this.responseText);
				if(set == false){
					set = true;
				}else{
					return false;
				}
				if(currentplay.interval != false){
					clearInterval(currentplay.interval);
					currentplay.interval = false;
				}
				currentplay.myjson = JSON.parse(this.responseText);
				//if(count != 0){
					if(req.reqDuration.className.includes("text-warning") == true){
						req.reqDuration.classList.toggle("text-success");
						req.reqDuration.classList.toggle("text-warning");
					}
					let t = Date.now() - reqtime;
					req.reqDuration.innerHTML = "Duration: " + t + " ms";
					req.reqCount.innerHTML = "Req Count: " + count;
					count = 0;
				//}
				DataReceived();
				if(type == "shuffle"){
					currentplay.init = 1;
					document.getElementById("autheur").innerHTML = currentplay.myjson[0].chanson.artist;
					document.getElementById("album").innerHTML = currentplay.myjson[0].chanson.album;
					document.getElementById("titre").innerHTML = currentplay.myjson[0].chanson.title;
					var newtkt = currentplay.myjson[1].info.next[0].info.ticket
				}else{
					newtkt = newtkt.ticket;
				}
				ticket.delete_tkt();
				ticket.new_tkt(newtkt);
				if(ticket.TIMEOUT != false)
					clearTimeout(ticket.TIMEOUT);
				ticket.TIMEOUT = setTimeout(() => { ticket.timeout_tkt(); }, ticket.tkt_time);
			}
		};
		count = 1;
		this.reqCount.innerHTML = "Req Count: " + count;
		request.open("POST", this.requrl);
		request.send(this.Data);
		this.interval = setInterval(() => {
			count++;
			this.reqCount.innerHTML = "Req Count: " + count;
			request.open("POST", this.requrl);
			request.send(this.Data);
			if(count == maxc){
				req.reqDuration.innerHTML = "Request: NaN";
				req.reqResponse.innerHTML = "Response: NaN";
				req.reqCount.innerHTML = "Req Count: inf";
				req.reqDuration.classList.toggle("text-success");
				req.reqDuration.classList.toggle("text-warning");
				clearInterval(this.interval);
				this.interval = false;
				count = 0;
			}
		}, timeset);
	},
	currentplaying: function(anim){
		if(this.interval != false || (data != false && anim == true)){
			//if(this.interval != false){
				//this.reqDuration.classList.toggle("text-success");
				//this.reqDuration.classList.toggle("text-warning");
				//this.reqResponse.classList.toggle("text-success");
				//this.reqResponse.classList.toggle("text-warning");
				//clearInterval(this.interval);
				//this.interval = false;
				return false;
			//}
			//if(data != false){
				//clearInterval(data);
				//data = false;
			//	return false;
			//}
		}
		switch(this.init){
			case 0:
				this.requrl = this.protocole + "://" + this.hostname + this.current_song;
				this.init = 1;
				this.time = 0;
				break;
			case 1:
				this.artist = this.myjson[1].info.next[0].chanson.artist;
				this.album = this.myjson[1].info.next[0].chanson.album;
				this.titre = this.myjson[1].info.next[0].chanson.title;
				this.time = this.myjson[1].info.next[0].chanson.time;
				this.requrl = this.protocole + "://" + this.hostname + this.next_song;
				this.init = 2;
				break;
			default:
				this.artist = this.myjson[0].chanson.artist;
				this.album = this.myjson[0].chanson.album;
				this.titre = this.myjson[0].chanson.title;
				this.time = this.myjson[0].chanson.time;
				this.requrl = this.protocole + "://" + this.hostname + this.next_song;
				break;
		}
		var currentplay = this;
		var request = new XMLHttpRequest();
		var set = false;
		var reqtime = Date.now();
		var req = this;
		req.reqDuration.classList.toggle("text-success");
		req.reqDuration.classList.toggle("text-warning");
		req.reqResponse.classList.toggle("text-success");
		req.reqResponse.classList.toggle("text-warning");
		request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				if(set == false){
					set = true;
				}else{
					return false;
				}
				console.log(this.responseText);
				if(currentplay.interval != false){
					clearTimeout(currentplay.interval);
					currentplay.interval = false;
				}
				clearInterval(req.interval);
				currentplay.myjson = JSON.parse(this.responseText);
				//if(count != 0){
					if(req.reqDuration.className.includes("text-warning") == true){
						req.reqDuration.classList.toggle("text-success");
						req.reqDuration.classList.toggle("text-warning");
						req.reqResponse.classList.toggle("text-success");
						req.reqResponse.classList.toggle("text-warning");
					}
					var n = Date.now();
					var d = currentplay.myjson["Date"].replace(/^[A-Za-z]{3}, /, '');
					d = Date.parse(d);
					let t = n - reqtime;
					//let _d = (n - d)/1000;
					if(n < d){
						var _d = (d - n)/1000;
					}else{
						var _d = (n - d)/1000;
					}
					/*if(_d < 0){
						_d = (d - n)/1000;
					}*/
					req.reqDuration.innerHTML = "Request: " + t + " ms";
					req.reqResponse.innerHTML = "Response: " + _d.toFixed(2) + " s";
					req.reqCount.innerHTML = "Req Count: " + count;
					count = 0;
				/*}else{
					var n = 0;
					var d = 0;
				}*/
				if(anim == true){
					DataReceived();
				}
				if(currentplay.myjson[1] != undefined){
					document.getElementById("autheur").innerHTML = currentplay.myjson[0].chanson.artist;
					document.getElementById("album").innerHTML = currentplay.myjson[0].chanson.album;
					document.getElementById("titre").innerHTML = currentplay.myjson[0].chanson.title;
					currentplay.time = currentplay.myjson[1].info.restant;
					currentplay.repeat = currentplay.myjson[1].info.repeat;
					currentplay.random = currentplay.myjson[1].info.random;
					if(currentplay.repeat == "on"){
						document.getElementById('loop').checked = true;
					}
					if(currentplay.random == "on"){
						document.getElementById('shuffle').checked = true;
					}
				}else{
					if(currentplay.myjson[0].info.time == 0){
						document.getElementById("autheur").innerHTML = currentplay.artist;
						document.getElementById("album").innerHTML = currentplay.album;
						document.getElementById("titre").innerHTML = currentplay.titre;
					}else{
						currentplay.time = currentplay.myjson[0].info.time;
					}
				}
				if(currentplay.TIMEOUT != false)
					clearTimeout(currentplay.TIMEOUT);
				if(_d < currentplay.time){
					currentplay.TIMEOUT = setTimeout(() => { currentplay.currentplaying(false); }, currentplay.time - _d);
				}else{
					/*if(d - n >= currentplay.time){
						currentplay.TIMEOUT = setTimeout(() => { currentplay.currentplaying(false); }, currentplay.time - (d - n));
					}else{*/
						currentplay.init = 0;
						currentplay.currentplaying(false);
					//}
				}
			}
		};
		count = 1;
		this.reqCount.innerHTML = "Req Count: " + count;
		request.open("GET", this.requrl, true);
		request.send();
		this.interval = setInterval(() => {
			count++;
			this.reqCount.innerHTML = "Req Count: " + count;
			request.open("GET", this.requrl, true);
			request.send();
			if(count == maxc){
				req.reqDuration.innerHTML = "Request: NaN";
				req.reqResponse.innerHTML = "Response: NaN";
				req.reqCount.innerHTML = "Req Count: inf";
				req.reqDuration.classList.toggle("text-success");
				req.reqDuration.classList.toggle("text-warning");
				req.reqResponse.classList.toggle("text-success");
				req.reqResponse.classList.toggle("text-warning");
				clearInterval(this.interval);
				this.interval = false;
				count = 0;
			}
		}, timeset);
		if(anim == true){
			DataSend.show();
			data = setTimeout(() => {
				DataSend.hide();
				data = false
			}, 1725);
		}
	},
	next: function(){
		if(this.interval != false){
			return false;
		}
			/*if(this.interval != false){
				this.reqDuration.classList.toggle("text-success");
				this.reqDuration.classList.toggle("text-warning");
				this.reqResponse.classList.toggle("text-success");
				this.reqResponse.classList.toggle("text-warning");
				clearInterval(this.interval);
				this.interval = false;
				//return false;
			}*/
			/*if(data != false){
				clearInterval(data);
				data = false;
			}*/
		ticket.cur_tkt();
		this.Data.append('id', ticket.id);
		this.Data.append('ticket', ticket.ticket);
		switch(this.init){
			//case 0: unseen;
			case 1:
				this.artist = this.myjson[1].info.next[0].chanson.artist;
				this.album = this.myjson[1].info.next[0].chanson.album;
				this.titre = this.myjson[1].info.next[0].chanson.title;
				this.time = this.myjson[1].info.next[0].chanson.time;
				this.init = 2;
				break;
			default:
				this.artist = this.myjson[0].chanson.artist;
				this.album = this.myjson[0].chanson.album;
				this.titre = this.myjson[0].chanson.title;
				this.time = this.myjson[0].chanson.time;
		}
		this.requrl = this.protocole + "://" + this.hostname + this.nextsong;
		var current = this;
		var request = new XMLHttpRequest();
		var Interval = this.interval;
		var set = false;
		var reqtime = Date.now();
		var req = this;
		req.reqDuration.classList.toggle("text-success");
		req.reqDuration.classList.toggle("text-warning");
		req.reqResponse.classList.toggle("text-success");
		req.reqResponse.classList.toggle("text-warning");
		request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				if(set == false){
					set = true;
				}else{
					return false;
				}
				console.log(this.responseText);
				current.myjson = JSON.parse(this.responseText);
				//if(count != 0){
					if(req.reqDuration.className.includes("text-warning") == true){
						req.reqDuration.classList.toggle("text-success");
						req.reqDuration.classList.toggle("text-warning");
						req.reqResponse.classList.toggle("text-success");
						req.reqResponse.classList.toggle("text-warning");
					}
					let n = Date.now();
					let t = n - reqtime;
					let d = current.myjson["Date"].replace(/^[A-Za-z]{3}, /, '');
					d = Date.parse(d);
					if(n < d){
						var _d = (d - n)/1000;
					}else{
						var _d = (n - d)/1000;
					}
					req.reqDuration.innerHTML = "Request: " + t + " ms";
					req.reqResponse.innerHTML = "Response: " + _d.toFixed(2) + " s";
					req.reqCount.innerHTML = "Req Count: " + count;
					count = 0;
				//}
				if(current.interval != false){
					clearTimeout(current.interval);
					current.interval = false;
				}
				if(ticket.TIMEOUT != false)
					clearTimeout(ticket.TIMEOUT);
				ticket.TIMEOUT = setTimeout(() => { ticket.timeout_tkt(); }, ticket.tkt_time);
				if(current.TIMEOUT != false)
					clearTimeout(current.TIMEOUT);
				if(_d < current.time){
					current.TIMEOUT = setTimeout(() => { current.currentplaying(false); }, current.time - _d);
				}else{
					/*if(d - n >= current.time){
						current.TIMEOUT = setTimeout(() => { current.currentplaying(false); }, current.time - (d - n));
					}else{*/
						current.init = 0;
						current.currentplaying(false);
					//}
				}
				//current.TIMEOUT = setTimeout(() => { current.currentplaying(false); }, current.time);
				document.getElementById("autheur").innerHTML = current.artist;
				document.getElementById("album").innerHTML = current.album;
				document.getElementById("titre").innerHTML = current.titre;
				ticket.delete_tkt();
				ticket.new_tkt(current.myjson[0].info.ticket);
			}
		};
		count = 1;
		this.reqCount.innerHTML = "Req Count: " + count;
		request.open("POST", this.requrl);
		request.send(this.Data);
		this.interval = setInterval(() => {
			count++;
			this.reqCount.innerHTML = "Req Count: " + count;
			request.open("POST", this.requrl);
			request.send(this.Data);
			if(count == maxc){
				req.reqDuration.innerHTML = "Request: NaN";
				req.reqResponse.innerHTML = "Response: NaN";
				req.reqCount.innerHTML = "Req Count: inf";
				req.reqDuration.classList.toggle("text-success");
				req.reqDuration.classList.toggle("text-warning");
				req.reqResponse.classList.toggle("text-success");
				req.reqResponse.classList.toggle("text-warning");
				clearInterval(this.interval);
				this.interval = false;
				count = 0;
			}
		}, timeset);
	},
	prev: function(){
		if(this.interval != false){
			return false;
		}
			/*if(this.interval != false){
				this.reqDuration.classList.toggle("text-success");
				this.reqDuration.classList.toggle("text-warning");
				this.reqResponse.classList.toggle("text-success");
				this.reqResponse.classList.toggle("text-warning");
				clearInterval(this.interval);
				this.interval = false;
				//return false;
			}*/
			/*if(data != false){
				clearInterval(data);
				data = false;
			}*/
		ticket.cur_tkt();
		this.Data.append('id', ticket.id);
		this.Data.append('ticket', ticket.ticket);
		this.init = 1;
		this.requrl = this.protocole + "://" + this.hostname + this.prevsong;
		var current = this;
		var request = new XMLHttpRequest();
		var set = false;
		var reqtime = Date.now();
		var req = this;
		req.reqDuration.classList.toggle("text-success");
		req.reqDuration.classList.toggle("text-warning");
		req.reqResponse.classList.toggle("text-success");
		req.reqResponse.classList.toggle("text-warning");
		request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				if(set == false){
					set = true;
				}else{
					return false;
				}
				console.log(this.responseText);
				if(current.interval != false){
					clearInterval(current.interval);
					current.interval = false;
				}
				current.myjson = JSON.parse(this.responseText);
				//if(count != 0){
					if(req.reqDuration.className.includes("text-warning") == true){	
						req.reqDuration.classList.toggle("text-success");
						req.reqDuration.classList.toggle("text-warning");
						req.reqResponse.classList.toggle("text-success");
						req.reqResponse.classList.toggle("text-warning");
					}
					let n = Date.now();
					let t = n - reqtime;
					let d = current.myjson["Date"].replace(/^[A-Za-z]{3}, /, '');
					d = Date.parse(d);
					if(n < d){
						var _d = (d - n)/1000;
					}else{
						var _d = (n - d)/1000;
					}
					//let _d = (n - d)/1000;
					/*if(_d < 0){
						_d = (d - n)/1000;
					}*/
					req.reqDuration.innerHTML = "Request: " + t + " ms";
					req.reqResponse.innerHTML = "Response: " + _d.toFixed(2) + " s";
					req.reqCount.innerHTML = "Req Count: " + count;
					count = 0;
				//}
				current.time = current.myjson[1].info.restant;
				document.getElementById("autheur").innerHTML = current.myjson[0].chanson.artist;
				document.getElementById("album").innerHTML = current.myjson[0].chanson.album;
				document.getElementById("titre").innerHTML = current.myjson[0].chanson.title;
				ticket.delete_tkt();
				ticket.new_tkt(current.myjson[1].info.next[0].info.ticket);
				if(ticket.TIMEOUT != false)
					clearTimeout(ticket.TIMEOUT);
				ticket.TIMEOUT = setTimeout(() => { ticket.timeout_tkt(); }, ticket.tkt_time);
				if(current.TIMEOUT != false)
					clearTimeout(current.TIMEOUT);
				if(current.time > _d){
					current.TIMEOUT = setTimeout(() => { current.currentplaying(false); }, current.time - _d);
				}else{
					/*if(d - n >= current.time){
						current.TIMEOUT = setTimeout(() => { current.currentplaying(false); }, current.time - (d - n));
					}else{*/
						current.init = 0;
						current.currentplaying(false);
					//}
				}
				//current.TIMEOUT = setTimeout(() => { current.currentplaying(false); }, current.myjson[1].info.restant);
			}
		};
		count = 1;
		this.reqCount.innerHTML = "Req Count: " + count;
		request.open("POST", this.requrl);
		request.send(this.Data);
		this.interval = setInterval(() => {
			count++;
			this.reqCount.innerHTML = "Req Count: " + count;
			request.open("POST", this.requrl);
			request.send(this.Data);
			if(count == maxc){
				req.reqDuration.innerHTML = "Request: NaN";
				req.reqResponse.innerHTML = "Response: NaN";
				req.reqCount.innerHTML = "Req Count: inf";
				req.reqDuration.classList.toggle("text-success");
				req.reqDuration.classList.toggle("text-warning");
				req.reqResponse.classList.toggle("text-success");
				req.reqResponse.classList.toggle("text-warning");
				clearInterval(this.interval);
				this.interval = false;
				count = 0;
			}
		}, timeset);
	}
};
var chanson = {
	protocole: proto,
	hostname: host,
	artist: null,
	date: null,
	album: null,
	track: null,
	title: null,
	last_el: document.getElementById('end'),
	resultat: null,
	playlist: null,
	work: null,
	on: null,
	set_on: true,
	album_result: null,
	time: 250,
	tooltip: [],
	name: [],
	ntooltip: 0,
	interval: false,
	reqDuration: document.getElementById('reqDuration'),
	reqResponse: document.getElementById('reqResponse'),
	reqCount: document.getElementById('reqCount'),
	deletechild: function(){
		var e = document.getElementById('playlist');
		var child = e.lastElementChild;
		while(child){
			e.removeChild(child);
			child = e.lastElementChild;
		}
	},
	play_this: function(artist, date, album, track, title){
		if(this.interval != false || data != false){
			return false;
		}
			/*if(this.interval != false){
				this.reqDuration.classList.toggle("text-success");
				this.reqDuration.classList.toggle("text-warning");
				this.reqResponse.classList.toggle("text-success");
				this.reqResponse.classList.toggle("text-warning");
				clearInterval(this.interval);
				this.interval = false;
				//return false;
			}
			if(data != false){
				clearInterval(data);
				data = false;
			}*/
		var reqtime = Date.now();
		var myreq = new XMLHttpRequest();
		var Data = new FormData();
		var requrl = proto + "://" + host + "/public/php/chanson.php?play_this";
		var Interval = this;
		ticket.cur_tkt();
		Data.append('id', ticket.id);
		Data.append('ticket', ticket.ticket);
		Data.append('artist', artist);
		Data.append('date', date);
		Data.append('album', album);
		Data.append('track', track);
		Data.append('title', title);
		var set = false;
		var req = this;
		req.reqDuration.classList.toggle("text-success");
		req.reqDuration.classList.toggle("text-warning");
		req.reqResponse.classList.toggle("text-success");
		req.reqResponse.classList.toggle("text-warning");
		myreq.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				if(set == false){
					set = true;
				}else{
					return false;
				}
				console.log(this.responseText);
				if(Interval.interval != false){
					clearInterval(Interval.interval);
					Interval.interval = false;
				}
				song.myjson = JSON.parse(this.responseText);
				//if(count != 0){
					if(req.reqDuration.className.includes("text-warning") == true){
						req.reqDuration.classList.toggle("text-success");
						req.reqDuration.classList.toggle("text-warning");
						req.reqResponse.classList.toggle("text-success");
						req.reqResponse.classList.toggle("text-warning");
					}
					//let t = Date.now() - reqtime;
					let n = Date.now();
					let t = n - reqtime;
					let d = song.myjson["Date"].replace(/^[A-Za-z]{3}, /, '');
					d = Date.parse(d);
					if(n < d){
						var _d = (d - n)/1000;
					}else{
						var _d = (n - d)/1000;
					}
					//let _d = (n - d)/1000;
					/*if(_d < 0){
						_d = (d - n)/1000;
					}*/
					req.reqDuration.innerHTML = "Request: " + t + " ms";
					req.reqResponse.innerHTML = "Response: " + _d.toFixed(2) + " s";
					req.reqCount.innerHTML = "Req Count: " + count;
					count = 0;
				//}
				DataReceived();
				song.init = 1;
				ticket.delete_tkt();
				ticket.new_tkt(song.myjson[1].info.next[0].info.ticket);
				document.getElementById("autheur").innerHTML = song.myjson[0].chanson.artist;
				document.getElementById("album").innerHTML = song.myjson[0].chanson.album;
				document.getElementById("titre").innerHTML = song.myjson[0].chanson.title;
				time = song.myjson[1].info.restant;
				if(song.TIMEOUT != false)
					clearTimeout(song.TIMEOUT);
				/*if(current.TIMEOUT != false)
					clearTimeout(current.TIMEOUT);*/
				if(time > _d){
					song.TIMEOUT = setTimeout(() => { song.currentplaying(false); }, time - _d);
				}else{
					/*if(d - n >= time){
						song.TIMEOUT = setTimeout(() => { song.currentplaying(false); }, time - (d - n));
					}else{*/
						song.init = 0;
						song.currentplaying(false);
					//}
				}
				//song.TIMEOUT = setTimeout(() => { song.currentplaying(false); }, time);
				if(ticket.TIMEOUT != false)
					clearTimeout(ticket.TIMEOUT);
				ticket.TIMEOUT = setTimeout(() => { ticket.timeout_tkt(); }, ticket.tkt_time);
			}
		};
		count = 1;
		this.reqCount.innerHTML = "Req Count: " + count;
		myreq.open("POST", requrl);
		myreq.send(Data);
		this.interval = setInterval(() => {
			count++;
			this.reqCount.innerHTML = "Req Count: " + count;
			myreq.requrl.open("POST", requrl);
			myreq.requrl.send(Data);
			if(count == maxc){
				req.reqDuration.innerHTML = "Request: NaN";
				req.reqResponse.innerHTML = "Response: NaN";
				req.reqCount.innerHTML = "Req Count: inf";
				req.reqDuration.classList.toggle("text-success");
				req.reqDuration.classList.toggle("text-warning");
				req.reqResponse.classList.toggle("text-success");
				req.reqResponse.classList.toggle("text-warning");
				clearInterval(this.interval);
				this.interval = false;
				count = 0;
			}
		}, timeset);
		DataSend.show();
		data = setTimeout(() => {
			DataSend.hide();
			data = false
		}, 1725);

	},
	change_to: function(type, date, element){
		var e = document.getElementById('home');
		var child = e.lastElementChild;
		var doc = document.getElementById('playlist');
		var master;
		var sub;
		switch(type){
			case 'all':
				this.deletechild();
				while(child != this.last_el){
					e.removeChild(child);
					child = e.lastElementChild;
				}
				if(this.on != "playlist" && document.getElementById('end').getAttribute('onclick') == null){
					child.setAttribute('onmouseover',"return false");
					child.setAttribute('onselectstart',"return false");
					child.setAttribute('onCopy', "return false");
					if(this.on == "library"){
						child.setAttribute('data-bs-toggle',"tooltip");
						child.setAttribute('data-bs-placement',"top");
						child.setAttribute('data-bs-html',"true");
						child.setAttribute('data-bs-trigger',"manual");
						child.setAttribute('onclick','chanson.tooltip_init("end", null, null, "all", "all", true)');
					}
				}else{
					if(this.on == "playlist"){
						child.removeAttribute('data-bs-toggle');
						child.removeAttribute('data-bs-placement');
						child.removeAttribute('data-bs-html');
						child.removeAttribute('data-bs-trigger');
						child.removeAttribute('onclick');
					}
				}
				if(this.work == null){
					master = document.createElement('div');
					master.setAttribute('class', 'row justify-content-center');
					doc.appendChild(master);
					sub = document.createElement('div');
					sub.setAttribute('class','col');
					sub.setAttribute('onselectstart',"return false");
					sub.setAttribute('onCopy', "return false");
					sub.innerHTML = "<p class='text-center mb-1'>Playlist Vide</p>"
					master.appendChild(sub);
					return false;
				}
				for(let i = 0; i < this.work.length; i+=2){
					master = document.createElement('div');
					master.setAttribute('class', 'row justify-content-center');
					doc.appendChild(master);
					for(let j = i; j < i+2; j++){
						sub = document.createElement('div');
						sub.setAttribute('class','col border');
						if(j < this.work.length){
							//sub.setAttribute('class', 'col-4 border m-0 p-0');
							sub.setAttribute('id',"id-" + this.work[j].artist);
							sub.setAttribute('ondblclick',
									'chanson.change_to("artist", null, "' + 
										this.work[j].artist + 
										'")'
							);
							sub.setAttribute('onselectstart',"return false");
							sub.setAttribute('onCopy', "return false");
							if(this.on == "library" || this.on == "playlist"){
								sub.setAttribute('data-bs-toggle',"tooltip");
								sub.setAttribute('data-bs-placement',"top");
								sub.setAttribute('data-bs-html',"true");
								sub.setAttribute('data-bs-trigger',"manual");
								sub.setAttribute('onclick',
										'chanson.tooltip_init("id-' +
											this.work[j].artist + 
											'","' + this.work[j].artist + '", null, "id-' + 
											this.work[j].artist + 
											'", "artist", true)'
								);
							}
							sub.innerHTML = "<p class='text-center mb-1'>" + this.work[j].artist + "</p>";
						}
						master.appendChild(sub);
					}
				}
				this.artist = null;
				this.album = null;
				this.date = null;
				this.track = null;
				this.title = null;
				break;
			case 'artist':
				this.deletechild();
				while(child != this.last_el){
					e.removeChild(child);
					child = e.lastElementChild;
				}
				e = document.getElementById('home');
				master = document.createElement('button');
				master.setAttribute('type',"button");
				master.setAttribute('class',"btn btn-primary");
				master.setAttribute('ondblclick', 'chanson.change_to("artist", null, "' + element + '")');
				master.setAttribute('onselectstart',"return false");
				master.setAttribute('onCopy', "return false");
				master.setAttribute('id', element);
				if(this.on == "library"){
					master.setAttribute('data-bs-toggle',"tooltip");
					master.setAttribute('data-bs-placement',"top");
					master.setAttribute('data-bs-html',"true");
					master.setAttribute('data-bs-trigger',"manual");
					master.setAttribute('onclick','chanson.tooltip_init("' +
									element + '","' + 
									element + '", null, "artist", "artist", true)'
					);
				}
				master.innerHTML = element;
				this.artist = element;
				e.appendChild(master);
				for(let i = 0; i < this.work.length; i++){
					if(this.work[i].artist == element){
						this.album_result = this.work[i][element];
						for(let j = 0; j < this.work[i][element].length; j++){
							master = document.createElement('div');
							master.setAttribute('class', 'row align-items-start justify-content-center');
							doc.appendChild(master);
							sub = document.createElement('div');
							sub.setAttribute('class','col');
							sub.setAttribute('id','id-' +
										this.work[i][element][j]["date"] + 
										'-' + 
										this.work[i][element][j]["album"]
							);
							sub.setAttribute('ondblclick',
									'chanson.change_to("album", "' +
										this.work[i][element][j]["date"] + 
										'","' + 
										this.work[i][element][j]["album"] +
										'")'
							);
							sub.setAttribute('onselectstart',"return false");
							sub.setAttribute('onCopy', "return false");
							if(this.on == "library" || this.on == "playlist"){
								sub.setAttribute('data-bs-toggle',"tooltip");
								sub.setAttribute('data-bs-placement',"top");
								sub.setAttribute('data-bs-html',"true");
								sub.setAttribute('data-bs-trigger',"manual");
								sub.setAttribute('onclick',
											'chanson.tooltip_init("id-' +
											this.work[i][element][j]["date"] + 
											'-' + 
											this.work[i][element][j]["album"] + 
											'","' + 
											this.work[i][element][j]["album"] + 
											'","' + 
											this.work[i][element][j]["date"] + 
											'", "id-' + 
											this.work[i][element][j]["date"] + 
											"-" + 
											this.work[i][element][j]["album"] + 
											'", "album", true)'
								);
							}
							sub.innerHTML = "<p class='text-center mb-2'>" +
										this.work[i][element][j]["date"] +
										" - " + 
										this.work[i][element][j]["album"] +
										"</p>";
							master.appendChild(sub);
						}
					}
				}
				this.album = null;
				this.date = null;
				this.track = null;
				this.title = null;
				break;
			case 'album':
				var home = document.createElement('button');
				home.setAttribute('type',"button");
				home.setAttribute('class',"btn btn-primary");
				home.setAttribute('onselectstart',"return false");
				home.setAttribute('onCopy', "return false");
				home.setAttribute('data-bs-toggle',"tooltip");
				home.setAttribute('data-bs-placement',"top");
				home.setAttribute('data-bs-html',"true");
				home.setAttribute('data-bs-trigger',"manual");
				this.deletechild();
				e = document.getElementById('home');
				e.appendChild(home);
				for(let i = 0; i < this.album_result.length; i++){
					if(this.album_result[i].album == element && date == this.album_result[i]["date"]){
						this.date = this.album_result[i]["date"];
						this.album = element;
						home.setAttribute('id', "album-" + this.date + "-" + element);
						if(this.on == "library"){
							home.setAttribute('onclick','chanson.tooltip_init("album-' +
														this.date +
														"-" +
														element +
														'", "' +
														element + 
														'","' + 
														this.date + 
														'", "album", "album", true)'
							);
						}
						home.innerHTML = this.date + " - " + element;
						for(let j = 0; j < this.album_result[i][element].length; j++){
							master = document.createElement('div');
								master.setAttribute('class', 'row align-items-start justify-content-center');
							doc.appendChild(master);
							sub = document.createElement('div');
							sub.setAttribute('id','id-' + 
										this.album_result[i][element][j]["track"] + 
										'-' + 
										this.album_result[i][element][j]["title"]
							);
							sub.setAttribute('onselectstart',"return false");
							sub.setAttribute('onCopy', "return false");
							sub.setAttribute('data-bs-toggle',"tooltip");
							sub.setAttribute('data-bs-placement',"top");
							sub.setAttribute('data-bs-html',"true");
							sub.setAttribute('data-bs-trigger',"manual");
							sub.setAttribute('onclick','chanson.tooltip_init("id-' + 
												this.album_result[i][element][j]["track"] + 
												'-' +
												this.album_result[i][element][j]["title"] + 
												'","' +
												this.album_result[i][element][j]["title"] + 
												'","' +
												this.album_result[i][element][j]["track"] + 
												'","id-' + 
												this.album_result[i][element][j]["track"] + 
												'-' + 
												this.album_result[i][element][j]["title"] +
												'", "title", true)'
							);
							sub.setAttribute('ondblclick',
									'chanson.change_to("title","' +
												this.album_result[i][element][j]["track"] + 
												'","' +
												this.album_result[i][element][j]["title"] + 
												'")'
							);
							sub.setAttribute('onselectstart',"return false");
							sub.setAttribute('onCopy', "return false");
							sub.innerHTML = "<p class='text-center mb-2'>" +
										this.album_result[i][element][j]["track"] + 
										" - " + 
										this.album_result[i][element][j]["title"] + 
										"</p>";
							master.appendChild(sub);
						}
					}
				}
				this.track = null;
				this.title = null;
				break;
			case "title":
				var artist = this.artist;
				var id = child.innerHTML.indexOf(" - ");
				var track_set = date;
				var title_set = element;
				var date_set = this.date;
				var album_set = this.album;
				var requrl = proto + "://" + host + "/public/php/chanson.php?play_this";
				this.play_this(artist, date_set, album_set, track_set, title_set);
				break;
		}
	},
	tooltip_init: function(name, title, date, id, type, bool){
		if(name == undefined){
			return false;
		}
		var doc = document.getElementById(name);
		if(bool == false){
			doc.setAttribute('onclick','chanson.tooltip_init("' + 
							name + '","' + 
							title + '","' + 
							date + '","' + 
							id + '","' + 
							type + '", true)'
			);
			return false;
		}else{
			doc.setAttribute('onclick','chanson.tooltip_init("' + 
							name + '","' + 
							title + '","' + 
							date + '","' + 
							id + '","' + 
							type + '", false)'
			);
		}
		switch(type){
			case 'all':
				var liste = '<ul class="m-0 p-0"><li id="tooltip-' +
						name +
						'">all</li><li id="tooltip-replace-' + 
						name + 
						'">replace</li></ul>';
				doc.setAttribute('data-bs-title', liste);
				break;
			case 'album':
			case 'artist':
				if(this.on == "library"){
					if(chanson.playlist != null){
						var liste = '<ul class="m-0 p-0"><li id="tooltip-' +
								name +
								'">' + 
								title + 
								'</li><li id="tooltip-replace-' + 
								name + 
								'">replace</li><li id="tooltip-append-' + 
								name +
								'">append</li></ul>';
					}else{
						var liste = '<ul class="m-0 p-0"><li id="tooltip-' +
								name +
								'">' + 
								title + 
								'</li><li id="tooltip-replace-' + 
								name + 
								'">replace</li></ul>';
					}
				}else{
					if(this.on == "playlist"){
						var liste = '<ul class="m-0 p-0"><li id="tooltip-' +
								name +
								'">' + 
								title + 
								'</li><li id="tooltip-remove-' + 
								name + 
								'">delete</li></ul>';
					}
				}
				doc.setAttribute('data-bs-title', liste);
				break;
			case 'title':
				if(this.on == "library"){
					if(chanson.playlist != null){
						var liste = '<ul class="m-0 p-0"><li id="tooltip-' +
								name +
								'">' + 
								title + 
								'</li><li id="tooltip-replace-' + 
								name + 
								'">replace</li><li id="tooltip-append-' + 
								name +
								'">append play</li><li id="tooltip-play-' + 
								name + 
								'">play</li></ul>';
					}else{
						var liste = '<ul class="m-0 p-0"><li id="tooltip-' +
								name +
								'">' + 
								title + 
								'</li><li id="tooltip-replace-' + 
								name + 
								'">replace</li></ul>';
					}
				}else{
					if(this.on == "playlist"){
						var liste = '<ul class="m-0 p-0"><li id="tooltip-' +
								name +
								'">' + 
								title + 
								'</li><li id="tooltip-play-' + 
								name + 
								'">play</li><li id="tooltip-remove-' +
								name +
								'">remove</li></ul>';
					}else{
						var liste = '<ul class="m-0 p-0"><li id="tooltip-' +
								name +
								'">' + 
								title + 
								'</li><li id="tooltip-play-' + 
								name + 
								'">play</li></ul>';
					}
				}
				doc.setAttribute('data-bs-title', liste);
				break;
		}
		var clk = true;
		ondblclick = function(){
			if(document.getElementById(name) != null){
				document.getElementById(name).setAttribute('onclick',
										'chanson.tooltip_init("' + 
										name + '","' +
										title + '","' + 
										date + '","' + 
										id + '","' + 
										type + '", true)'
				);
			}
			clk = false;
			return false
		}
		var TIMEOUT = setTimeout(() => {
			var TriggerEl = doc;
			if(TriggerEl == null){
				return false;
			}
			this.cur_tooltip = id;
			var newtooltip = bootstrap.Tooltip.getOrCreateInstance(TriggerEl);
			if(clk == false){
				newtooltip.hide();
				clearTimeout(TIMEOUT);
				return false;
			}
			for(var i = 0; i < this.ntooltip; i++){
				if(this.name[i] == name){
					break;
				}
			}
			if(i == this.ntooltip){
				this.tooltip.push(newtooltip);
				this.name.push(name);
				this.ntooltip = this.tooltip.length -1;
				var ntooltip = this.ntooltip;
				var tooltipshow = this.tooltip[ntooltip];
			}else{
				this.tooltip[i] = newtooltip;
				var ntooltip = i;
				var tooltipshow = this.tooltip[i];
			}
			if(bool == true){
				tooltipshow.show();
			}
			var myartist = this.artist;
			var myalbum = this.album;
			var mydate = this.date;
			TriggerEl.addEventListener('shown.bs.tooltip', function () {
				if(document.getElementById('tooltip-replace-' + name) != null){
					switch(type){
						case 'all':
							document.getElementById('tooltip-replace-' + name)
								.setAttribute('onclick',
										'chanson.request("REPLACE", "all", null, null, null, null)');
							break;
						case 'artist':
							document.getElementById('tooltip-replace-' + name)
								.setAttribute('onclick',
									'chanson.request("REPLACE", "' + title + '", null, null, null, null)');
							break;
						case 'album':
							document.getElementById('tooltip-replace-' + name)
								.setAttribute('onclick', 'chanson.request("REPLACE","' + 
												myartist + '","' + 
												date + '","' + 
												title + '", null, null)'
								);
							break;
						case 'title':
							document.getElementById('tooltip-replace-' + name)
								.setAttribute('onclick', 'chanson.request("REPLACE","' + 
												myartist + '","' + 
												mydate + '","' + 
												myalbum + '","' + 
												date + '","' + 
												title + '")'
								);
							break;
					}
				}
				if(document.getElementById('tooltip-remove-' + name) != null){
					switch(type){
						case 'artist':
							document.getElementById('tooltip-remove-' + name)
								.setAttribute('onclick',
									'chanson.request("REMOVE", "' + title + '", null, null, null, null)');
							break;
						case 'album':
							document.getElementById('tooltip-remove-' + name)
								.setAttribute('onclick', 'chanson.request("REMOVE","' + 
												myartist + '","' + 
												date + '","' + 
												title + '", null, null)'
								);
							break;
						case 'title':
							document.getElementById('tooltip-remove-' + name)
								.setAttribute('onclick', 'chanson.request("REMOVE","' + 
												myartist + '","' + 
												mydate + '","' + 
												myalbum + '","' + 
												date + '","' + 
												title + '")'
								);
							break;
					}
				}
				if(chanson.playlist != null && document.getElementById('tooltip-append-' + name) != null){
					switch(type){
						case 'artist':
							document.getElementById('tooltip-append-' + name)
								.setAttribute('onclick',
									'chanson.request("APPEND", "' + title + '", null, null, null, null)');
							break;
						case 'album':
							document.getElementById('tooltip-append-' + name)
								.setAttribute('onclick', 'chanson.request("APPEND","' + 
												myartist + '","' + 
												date + '","' + 
												title + '", null, null)'
								);
							break;
						case 'title':
							document.getElementById('tooltip-append-' + name)
								.setAttribute('onclick', 'chanson.request("APPEND","' + 
												myartist + '","' + 
												mydate + '","' + 
												myalbum + '","' + 
												date + '","' + 
												title + '")'
								);
							break;
					}
				}
				if(document.getElementById('tooltip-play-' + name) != null){
					switch(type){
						case 'title':
							document.getElementById('tooltip-play-' + name)
								.setAttribute('onclick', 'chanson.request("PLAY","' + 
												myartist + '","' + 
												mydate + '","' + 
												myalbum + '","' + 
												date + '","' + 
												title + '")'
								);
							break;
					}
				}
				onclick = function(){
					chanson.tooltip[ntooltip].hide();
				}
			})
		}, this.time);

	},
	find_that: function(title){
		var myartist;
		var mydate;
		var myalbum;
		var mytrack;
		var mytitle;
		//console.log(title);
		var re = new RegExp(title, "i");
		var ret = false;
		var lst = (this.playlist == null) ? this.resultat : this.playlist;
		var e = document.getElementById('home');
		var child = e.lastElementChild;
		var doc = document.getElementById('playlist');
		this.deletechild();
		while(child != this.last_el){
			e.removeChild(child);
			child = e.lastElementChild;
		}
		for(let i = 0;i < lst.length; i++){
			myartist = lst[i].artist;
			for(let j = 0;j < lst[i][myartist].length; j++){
				mydate = lst[i][myartist][j].date;
				myalbum = lst[i][myartist][j].album;
				for(let k = 0;k < lst[i][myartist][j][myalbum].length;k++){
					mytrack = lst[i][myartist][j][myalbum][k].track;
					mytitle = lst[i][myartist][j][myalbum][k].title;
					if(re.test(lst[i][myartist][j][myalbum][k].title) == true){
						ret = true;
						//console.log(lst[i][myartist][j][myalbum][k].title);
						if(this.on != null && document.getElementById('search-menu').className != "page-link active"){
							document.getElementById('search-menu').classList.toggle('d-none');
							document.getElementById('search-menu').classList.toggle('active');
							switch(this.on){
								case "all":
									if(document.getElementById('library-menu').className == "page-link active"){
										document.getElementById('library-menu').classList.toggle('active');
									}else{
										document.getElementById('playlist-menu').classList.toggle('active');
									}
									break;
								case "library":
									document.getElementById('library-menu').classList.toggle('active');
									break;
								case "playlist":
									document.getElementById('playlist-menu').classList.toggle('active');
									break;
							}
						}
						this.on = null
						master = document.createElement('div');
						master.setAttribute('class', 'row align-items-start justify-content-center');
						doc.appendChild(master);
						sub = document.createElement('div');
						sub.setAttribute('onselectstart',"return false");
						sub.setAttribute('onCopy', "return false");
						sub.setAttribute('onselectstart',"return false");
						sub.setAttribute('onCopy', "return false");
						sub.setAttribute('onclick', 'chanson.play_this("' + 
											myartist + '","' + 
											mydate + '","' + 
											myalbum + '","' + 
											mytrack + '","' + 
											mytitle + '")');
						sub.innerHTML = "<p class='text-center mb-2'>" +
									myartist + " - " +
									mydate + " - " +
									myalbum + " - " +
									mytrack + " - " + 
									mytitle + 
								"</p>";
						master.appendChild(sub);
					}
				}
			}
		}
		if(ret == false){
			master = document.createElement('div');
			master.setAttribute('class', 'row align-items-start justify-content-center');
			doc.appendChild(master);
			sub = document.createElement('div');
			sub.setAttribute('onselectstart',"return false");
			sub.setAttribute('onCopy', "return false");
			sub.setAttribute('onselectstart',"return false");
			sub.setAttribute('onCopy', "return false");
			sub.innerHTML = "<p class='text-center mb-2'>No song matching</p>";
			master.appendChild(sub);
			if(this.on != null && document.getElementById('search-menu').className != "page-link active"){
				document.getElementById('search-menu').classList.toggle('d-none');
				document.getElementById('search-menu').classList.toggle('active');
				switch(this.on){
					case "all":
						if(document.getElementById('library-menu').className == "page-link active"){
							document.getElementById('library-menu').classList.toggle('active');
						}else{
							document.getElementById('playlist-menu').classList.toggle('active');
						}
						break;
					case "library":
						document.getElementById('library-menu').classList.toggle('active');
						break;
					case "playlist":
						document.getElementById('playlist-menu').classList.toggle('active');
						break;
				}
			}
		}
		return ret;
	},
	delete_that: function(artist, date, album, track, title){
		var myartist = null;
		var myalbum = null;
		var mytrack = null;
		for(let i = 0;i < this.playlist.length; i++){
			if(this.playlist[i].artist == artist){
				myartist =  i;
				break;
			}
		}
		if(date != null && album != null){
			for(let i = 0; i < this.playlist[myartist].artist.length; i++){
				if(this.playlist[myartist].artist[i].date == date && this.playlist[myartist].artist[i].album == album){
					myalbum = i;
					break;
				}
			}
		}
		if(track != null && title != null){
			for(let i = 0; i < this.playlist[myartist].artist[myalbum].length; i++){
				if(this.playlist[myartist].artist[myalbum].album[i].track == track && this.playlist[myartist].artist[myalbum].title == title){
					mytrack = i;
					break;
				}
			}
		}
		if(mytrack != null){
			delete this.playlist[myartist].artist[myalbum].album[mytrack].track;
			delete this.playlist[myartist].artist[myalbum].album[mytrack].title;
			if(this.playlist[myartist].artist[myalbum].album.length == 0){
				delete this.playlist[myartist].artist[myalbum].album;
			}
			if(this.playlist[myartist].artist.length == 0){
				delete this.playlist[myartist];
			}
		}else{
			if(myalbum != null){
				delete this.playlist[myartist].artist[myalbum];
				if(this.playlist[myartist].artist.length == 0){
					delete this.playlist[myartist];
				}
			}else{
				if(myartist != null){
					delete this.playlist[myartist];
				}
			}
		}
		if(this.playlist == ''){
			return true;
		}
		return false;
	},
	request: function(type, artist, date, album, track, title){
		if(this.interval != false || data != false){
			return false;
		}
		if(type == "REMOVE"){
			if(this.delete_that(artist, date, album, track, title) == true){
				type = "REPLACE";
				artist = "all";
				date = null;
				album = null;
				track = null;
				title = null;
			}
		}
		var reqtime = Date.now();
		ticket.cur_tkt();
		var Data = new FormData();
		Data.append('id', ticket.id);
		Data.append('ticket', ticket.ticket);
		Data.append('type', type);
		Data.append('artist', artist);
		Data.append('date', date);
		Data.append('album', album);
		Data.append('track', track);
		Data.append('title', title);
		Data.append('shuffle', (document.getElementById('shuffle').checked == true) ? "on" : "off");
		var requrl = this.protocole + "://" + this.hostname + '/public/php/chanson.php?' + type;
		var request = new XMLHttpRequest();
		var Interval = this;
		var set = false;
		var req = this;
		req.reqDuration.classList.toggle("text-success");
		req.reqDuration.classList.toggle("text-warning");
		req.reqResponse.classList.toggle("text-success");
		req.reqResponse.classList.toggle("text-warning");
		request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				if(set == false){
					set = true;
				}else{
					return false;
				}
				console.log(this.responseText);
				if(Interval.interval != false){
					clearInterval(Interval.interval);
					Interval.interval = false;
				}
				song.myjson = JSON.parse(this.responseText);
				//if(count != 0){
					req.reqDuration.classList.toggle("text-success");
					req.reqDuration.classList.toggle("text-warning");
					req.reqResponse.classList.toggle("text-success");
					req.reqResponse.classList.toggle("text-warning");
				//let t = Date.now() - reqtime;
					let n = Date.now();
					let t = n - reqtime;
					let d = song.myjson["Date"].replace(/^[A-Za-z]{3}, /, '');
					d = Date.parse(d);
					if(n < d){
						var _d = (d - n)/1000;
					}else{
						var _d = (n - d)/1000;
					}
					//let _d = (n - d)/1000;
					/*if(_d < 0){
						_d = (d - n)/1000;
					}*/
					req.reqDuration.innerHTML = "Request: " + t + " ms";
					req.reqResponse.innerHTML = "Response: " + _d.toFixed(2) + " s";
					req.reqCount.innerHTML = "Req Count: " + count;
					count = 0;
				//}
				var search = document.getElementById('search-menu').className.includes('d-none');
				DataReceived();
				song.init = 1;
				ticket.delete_tkt();
				ticket.new_tkt(song.myjson[1].info.next[0].info.ticket);
				document.getElementById("autheur").innerHTML = song.myjson[0].chanson.artist;
				document.getElementById("album").innerHTML = song.myjson[0].chanson.album;
				document.getElementById("titre").innerHTML = song.myjson[0].chanson.title;
				if(search == true){
					if(song.myjson['playlist'] != null){
						var doc = document.getElementById('library-menu');
						if(doc.className.includes("active") == true){
							doc.classList.toggle("active");
							document.getElementById('playlist-menu').classList.toggle("active");
						}
						document.getElementById('title_search').setAttribute('required', 'true');
						chanson.playlist = song.myjson['playlist'];
						chanson.work = chanson.playlist;
						chanson.on = "playlist";
						chanson.set_on = false;
					}else{
						var doc = document.getElementById('library-menu');
						if(doc.className == "page-link active"){
							doc.classList.toggle("active");
							document.getElementById('playlist-menu').classList.toggle("active");
						}
						document.getElementById('title_search').removeAttribute('required');
						chanson.playlist = null;
						chanson.work = null;
						chanson.on = "all";
						chanson.set_on = true;
					}
				}
				chanson.change_to('all', null, null);
				time = song.myjson[1].info.restant;
				if(song.TIMEOUT != false)
					clearTimeout(song.TIMEOUT);
				//song.TIMEOUT = setTimeout(() => { song.currentplaying(false); }, time);
				if(time > _d){
					song.TIMEOUT = setTimeout(() => { song.currentplaying(false); }, time - _d);
				}else{
					/*if(d - n >= time){
						song.TIMEOUT = setTimeout(() => { song.currentplaying(false); }, time - (d - n));
					}else{*/
						song.init = 0;
						song.currentplaying(false);
					//}
				}
				if(ticket.TIMEOUT != false)
					clearTimeout(ticket.TIMEOUT);
				ticket.TIMEOUT = setTimeout(() => { ticket.timeout_tkt(); }, ticket.tkt_time);
			}
		};
		count = 1;
		this.reqCount.innerHTML = "Req Count: " + count;
		request.open("POST", requrl);
		request.send(Data);
		this.interval = setInterval(() => {
			count++;
			this.reqCount.innerHTML = "Req Count: " + count;
			request.open("POST", requrl);
			request.send(Data);
			if(count == maxc){
				req.reqDuration.innerHTML = "Request: NaN";
				req.reqResponse.innerHTML = "Response: NaN";
				req.reqCount.innerHTML = "Req Count: inf";
				req.reqDuration.classList.toggle("text-success");
				req.reqDuration.classList.toggle("text-warning");
				req.reqResponse.classList.toggle("text-success");
				req.reqResponse.classList.toggle("text-warning");
				clearInterval(this.interval);
				this.interval = false;
				count = 0;
			}
		}, timeset);
		DataSend.show();
		data = setTimeout(() => {
			DataSend.hide();
			data = false;
		}, 1725);
	},
};

