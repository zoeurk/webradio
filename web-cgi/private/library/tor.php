<?php
	class tornet{
		private $onion;
		public $toronion = null;
		public $hostname = null;
		public $ip;
		public $json = null;
		public function __construct(){
			$this->onion = file_get_contents("/var/opt/tor/service/hostname");
			$this->hostname = str_replace(PHP_EOL, '', $this->onion);
		}
		public function read_req(){
			exec(". /opt/get-ip.src", $this->ip, $ret);
			if(empty($this->ip)){
				$this->toronion = "Services";
			}else{
				$this->toronion = "Services";
				if($_SERVER['REMOTE_ADDR'] != "127.0.0.1" && $_SERVER['REMOTE_ADDR'] == $this->ip[0]){
					exec("/usr/bin/wget --quiet -O /tmp/search.json https://onionoo.torproject.org/details?search=" . $_SERVER['REMOTE_ADDR'], $output, $ipret);
					$file = file_get_contents("/tmp/search.json");
					$this->json = json_decode($file);
					if($this->json != null){
						if(isset($this->json->relays[0]->exit_addresses)){
							foreach($this->json->relays[0]->exit_addresses as $val){
								if($_SERVER['REMOTE_ADDR'] == $val){
									/*$tor = file_get_contents("/var/opt/tor/service/hostname");
									$toronion = str_replace(PHP_EOL, '', $tor);*/
									$this->toronion = $this->hostname;
									break;
								}
							}
						}
					}
				}
			}
		}
	}
?>
