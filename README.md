Webradio  
systemd files for icecast2/mpd and bind9 who working at reboot  
Maybe you need to this line in rc.local...  
mpc status | grep -e "^ERROR:" >/dev/null && (systemctl restart bind9 mpd icecast2;mpc --host=password@host play >/dev/null; printf "bind9/mpd/icecast2 started manually\n" >> /tmp/services)  
Sometime services like bind doesn't start corectly
