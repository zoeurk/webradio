Webradio  
systemd files for icecast2/mpd and bind9 who working at reboot  
Maybe you need to this line in rc.local...  
mpc status | grep -e "^ERROR:" >/dev/null && \  
	(  	nslookup host >> /tmp/services;  
		systemctl status bind9 >> /tmp/services;  
		systemctl status mpd >> /tmp/services;  
		systemctl status icecast2 >> /tmp/services;  
		systemctl restart bind9 mpd icecast2;mpc --host=password@host play >/dev/null;  
		printf "bind9/mpd/icecast2 started manually\n" >> /tmp/services  
	)  
Sometime services like bind doesn't start corectly  
In a first time I would like to start my webradio whitout rc.local...  
sorry  
But this doesn't use rc.local at every time :)
Before using rc.local try without rc.local ;)
