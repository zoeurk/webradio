<?php
	set_include_path(get_include_path() . PATH_SEPARATOR . '/www/html/');
	class chanson{
		public $shuf;
		public $default_cmd = 'mpc --host=mpd-hostname';
		private $host = null;
		private $password = null;
		/**** Public ****/
		public function __construct($init, $shuffle){
			if($init == true){
				$content = file_get_contents('/www/private/config/config.json');
				$json = json_decode($content);
				$this->host = $json->mpd->host;
				$this->password = $json->mpd->password;
				if($shuffle == true){
					$this->shuf = 'mpc --wait --host=' . $this->password . '@' . $this->host . ' shuffle;';
				}else{
					$this->shuf = ';';
				}
			}
		}
		public function curart(){
			shell_exec('. /www/private/src/current_artist.src');
		}
		public function loop($val){
			shell_exec('mpc --host=' . $this->password . '@' .  $this->host . ' repeat ' . $val);
		}
		public function shuffle_it(){
			shell_exec('mpc --host=' . $this->password . '@' .  $this->host .  ' shuffle');
		}
		public function random($val){
			switch($val){
				case "on":
					shell_exec('mpc --host='  . $this->password . '@' .  $this->host . ' random on;mpc --host=' . $this->password . '@' . $this->host . ' shuffle');
					break;
				case "off":
					shell_exec('. /www/private/src/order.src');
					break;
			}
		}
		public function createplaylist(){
			$tps = array();
			shell_exec($this->default_cmd . ' -f "\"artist\": \"%artist%\", \"album\": \"%date% - %album%\", \"track\": \"%track%\" - \"%title%\"" playlist | sed \':redo; s/\(\"track\": \)\"\([0-9]\{1,2\}\)\"/\1\"0\2\"/;t redo\' | sort | sed -nf ../../private/sed/mpc2json.sed > ../../private/jsons/playlist.json; test -s /www/private/jsons/playlist.json || rm /www/private/jsons/playlist.json');
		}
		/**** Private ****/
		private function mylibrary(){
			shell_exec('mpc --wait --host='  . $this->password . '@' .  $this->host . ' crop;'. $this->default_cmd . ' -f "%artist% %date% %album% track %track% %title% file:%file%" listall  | sed ":redo;s/track \([0-9]\{1,2\}\) /track 0\1 /; t redo;" | sort | sed "s/^.*file://g" | mpc --host='  . $this->password . '@' .  $this->host . ' add;' . $this->shuf . 'mpc --wait --host='  . $this->password . '@' .  $this->host . ' del 0;');
		}
		private function replace_this($exp){
			shell_exec('mpc --wait --host='  . $this->password . '@' .  $this->host . ' crop;mpc --wait --host='  . $this->password . '@' .  $this->host . ' findadd "' . $exp . '";' . $this->shuf . 'mpc --wait --host='  . $this->password . '@' .  $this->host . ' del 0');
		}
		private function append_this($exp){
			shell_exec('mpc --wait --host='  . $this->password . '@' .  $this->host . ' findadd "' . $exp . '";' . $this->shuf);
		}
		private function delete_song($string){
			shell_exec($this->default_cmd . ' -f "%artist% %date% %album% %track% %title% pos=%position%" playlist | sed -n "s/^' . $string . '.* pos=\([0-9]*\)$/\1/p" | mpc --host='  . $this->password . '@' .  $this->host . ' del');
		}
		private function get_current($type){
			$tps = array();
			if($this->host == null || $this->password == null){
				$temps = shell_exec($this->default_cmd . ' --wait -f "\[{\"chanson\":{\"artist\":\"%artist%\",\"album\":\"%album%\",\"track\":\"%track%\",\"title\":\"%title%\"}}," ' . $type . ' | sed -n -e "1 p" -e "2 s/^\[\([A-Za-z]*\)\].*\([0-9]\+\):\([0-9]\{2\}\)\/\([0-9]\+\):\([0-9]\{2\}\).*$/{\"info\":{\"status\":\"\1\",\"timeup\": 0,\"restant\": 0, \"temps\" :{\"m\":\"\2\",\"s\":\"\3\"},\"duree\":{\"m\":\"\4\",\"s\":\"\5\"}/p; 3 { s/^.*\(repeat\): \(on\|off\) *\(random\): \(on\|off\).*$/,\"\1\":\"\2\", \"\3\": \"\4\"}}\]/p;}"');
			}else{
				$temps = shell_exec('mpc --wait --host=' . $this->password .'@' . $this->host . ' -f "\[{\"chanson\":{\"artist\":\"%artist%\",\"album\":\"%album%\",\"track\":\"%track%\",\"title\":\"%title%\"}}," ' . $type . ' | sed -n -e "1 p" -e "2 s/^\[\([A-Za-z]*\)\].*\([0-9]\+\):\([0-9]\{2\}\)\/\([0-9]\+\):\([0-9]\{2\}\).*$/{\"info\":{\"status\":\"\1\",\"timeup\": 0,\"restant\": 0, \"temps\" :{\"m\":\"\2\",\"s\":\"\3\"},\"duree\":{\"m\":\"\4\",\"s\":\"\5\"}/p; 3 { s/^.*\(repeat\): \(on\|off\) *\(random\): \(on\|off\).*$/,\"\1\":\"\2\", \"\3\": \"\4\"}}\]/p;}"');
			}
			$tps = json_decode($temps);
			return $tps;
		}
		private function g_next($type){
			$next = array();
			if($this->host == null || $this->password == null){
				$next_str = shell_exec($this->default_cmd . ' --wait -f "\[{\"chanson\":{\"artist\":\"%artist%\",\"album\":\"%album%\",\"track\":%track%,\"title\":\"%title%\", \"time\":\"%time%\"}, \"info\":{\"id\": \"0\", \"ticket\": \"0\", \"status\": \"false\", \"time\": 0}}\]" ' . $type . ' | head -n 1');
			}else{
				$next_str = shell_exec('mpc --wait --host=' . $this->password .'@' . $this->host . ' -f "\[{\"chanson\":{\"artist\":\"%artist%\",\"album\":\"%album%\",\"track\":%track%,\"title\":\"%title%\", \"time\":\"%time%\"}, \"info\":{\"id\": \"0\", \"ticket\": \"0\", \"status\": \"false\", \"time\": 0}}\]" ' . $type . ' | head -n 1');
			}
			$next = json_decode($next_str);
			return $next;
		}
		private function search($search){
			$find = shell_exec($this->default_cmd . ' --wait -f "\[{\"chanson\":{\"artist\":\"%artist%\",\"album\":\"%album%\",\"track\":%track%,\"title\":\"%title%\", \"time\":\"%time%\"}, \"info\":{\"id\": \"0\", \"ticket\": \"0\", \"status\": \"false\", \"time\": 0}}\]" find '. $search);
			if($find == ""){
				return false;
			}
			return true;
		}
		private function findadd($song){
			shell_exec('mpc --wait  --host='  . $this->password . '@' .  $this->host . ' findadd ' . $song  .  '>/dev/null;' . $this->shuf);
		}
		private function mpdjson($file){
			return file_get_contents($file);
		}
		private function thisone($song){
			shell_exec('mpc --wait  --host='  . $this->password . '@' .  $this->host . ' searchplay ' . $song . ' >/dev/null');
		}
		/**** Public ****/
		public function current($type){
			$times = array(0, 0, 0, 0, 0); 
			$reste = array(0, 0);
			$tps = $this->get_current($type);
			$tps[1]->info->next = $this->g_next("queue");
			$tps[1]->info->duree->m = intval($tps[1]->info->duree->m);
			$tps[1]->info->duree->s = intval($tps[1]->info->duree->s);
			$tps[1]->info->temps->m = intval($tps[1]->info->temps->m);
			$tps[1]->info->temps->s = intval($tps[1]->info->temps->s);
			$cur_time = $tps[1]->info->temps->m * 60 + $tps[1]->info->temps->s;
			$total_time = $tps[1]->info->duree->m * 60 + $tps[1]->info->duree->s;
			$tps[1]->info->restant = (($total_time - $cur_time) * 1000) + 750;
			$nextms = explode(":", $tps[1]->info->next[0]->chanson->time);
			$tps[1]->info->next[0]->chanson->time = ((($nextms[0] * 60) + $nextms[1]) * 1000) + 750;
			return $tps;
		}
		public function nextsong($type){
			if($type == "next"){
				$this->g_next($type);
				$cur = null;
			}else
				$cur = $this->get_current("status");
			$result = $this->g_next("queue");
			$time[0] = $_SERVER['REQUEST_TIME'];
			$time[1] = time();
			$time[2] = $time[1] - $time[0];
			$time_ended = $time[1] + $time[2];
			$next = explode(":", $result[0]->chanson->time);
			$result[0]->chanson->time = ((($next[0] * 60) + $next[1])) * 1000 + 750;
			return $result;
		}
		public function getlib(){
			return $this->mpdjson('/www/private/jsons/mpd.json');
		}
		public function getplaylist(){
			if(file_exists('/www/private/jsons/playlist.json')){
				return $this->mpdjson('/www/private/jsons/playlist.json');
			}
			return null;
		}
		public function play_this($artist, $date, $album, $track, $title){
			$this->thisone('artist "' . $artist . '" date "'. $date . '" album "' . $album . '" track "' . $track . '" title "' . $title . '"');
		}
		public function addplay($artist, $date, $album, $track, $title){
			$play = $this->search(" artist '". $artist . "' date '" . $date . "' album '" . $album . "' track '" . $track . "' title '" . $title . "'");
			if($play == false){
				$this->findadd('artist "' . $artist . '" date "'. $date . '" album "' . $album . '" track "' . $track . '" title "' . $title . '"');
			}
			$this->thisone('artist "' . $artist . '" date "'. $date . '" album "' . $album . '" track "' . $track . '" title "' . $title . '"');
		}
		public function remove($artist, $date, $album, $track, $title){
			$string = null;
			if($artist != 'null'){
				$string = $artist;
			}
			if($date != 'null' && $album != 'null'){
				if($string == null){
					$string = $date . " " . $album;
				}else{
					$string .= " " . $date . " " . $album;
				}
			}
			if($track != 'null' && $title != 'null'){
				if($string == null){
					$string = $track . " " . $title;
				}else{
					$string .= " " . $track . " " . $title;
				}
			}
			$this->delete_song($string);
		}
		public function replace($artist, $date, $album, $track, $title){
			$ar = null;
			$al = null;
			$ti = null;
			if($artist != 'null'){
				$ar = '(artist == \"' . $artist . '\")';
			}
			if($date != 'null' && $album != 'null'){
				$al = '(date == \"'.  $date . '\") AND (album == \"' . $album . '\")';
			}
			if($track != 'null' && $title != 'null'){
				$ti = '(track == \"'.  $track . '\") AND (title == \"' . $title . '\")';
			}
			if($al == null && $ti == null){
				$exp = '(' . $ar . ')';
			}else{
				if($ti == null){
					$exp = '(' . $ar . ' AND ' . $al . ')';
				}else{
					$exp = '(' . $ar . ' AND ' . $al . ' AND ' . $ti . ')';
				}
			}
			$this->replace_this($exp);
		}
		public function append($artist, $date, $album, $track, $title){
			$ar = null;
			$al = null;
			$ti = null;
			if($artist != 'null'){
				$ar = '(artist == \"' . $artist . '\")';
			}
			if($date != 'null' && $album != 'null'){
				$al = '(date == \"'.  $date . '\") AND (album == \"' . $album . '\")';
			}
			if($track != 'null' && $title != 'null'){
				$ti = '(track == \"'.  $track . '\") AND (title == \"' . $title . '\")';
			}
			if($al == null && $ti == null){
				$exp = '(' . $ar . ')';
			}else{
				if($ti == null){
					$exp = '(' . $ar . ' AND ' . $al . ')';
				}else{
					$exp = '(' . $ar . ' AND ' . $al . ' AND ' . $ti . ')';
				}
			}
			$this->append_this($exp);
		}
		public function tolibrary(){
			if(file_exists('/www/private/jsons/playlist.json')){
				unlink('/www/private/jsons/playlist.json');
			}
			$this->mylibrary();
		}
	}
?>

