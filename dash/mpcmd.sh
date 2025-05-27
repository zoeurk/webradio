#!/bin/sh
MPCDIR=$HOME/.mpcmd
if test ! -d $MPCDIR
then
 mkdir $MPCDIR || exit 255
 for dir in "config" "jsons" "sed" "src" "temp"
 do
  mkdir $MPCDIR/$dir
 done
#"web" not used in the script
 cat << EOF > $MPCDIR/config/config.json
{
        "web":{
                "user": "username",
                "password": "password"
        },
        "mpd":{
                "host": "mpd-host",
                "password": "mpd-passwd"
        }
}
EOF
 cat << EOF > $MPCDIR/config/dirs.conf
ROOT=$MPCDIR
SED="\$ROOT/sed"
JSONS="\$ROOT/jsons"
SRCDIR="\$ROOT/src"
TEMP="\$ROOT/temp"
TMP=\$TEMP
EOF
 chmod 600 $MPCDIR/config/dirs.conf $MPCDIR/config/config.json
 . $MPCDIR/config/dirs.conf
 cat << EOF > $MPCDIR/src/current_artist.src
HOST=\${PASSWD}@\${HOSTNAME}
ARTIST=`mpc -f "%artist%" current`
mpc -f "%artist% pos=%position%" playlist | \
        sed -n "/^\$ARTIST pos=[0-9]\+$/ ! { s/^.* pos=\([0-9]\+\)$/\1/p }" | \
        mpc --host=\$HOST del
mpc -f '\"artist\": \"%artist%\", \"album\": \"%date% - %album%\", \"track\": \"%track%\" - \"%title%\"' playlist | sed ':redo; s/\(\"track\": \)\"\([0-9]\{1,2\}\)\"/\1\"0\2\"/;t redo' | sort | sed -nf \${SED}/mpc2json.sed > \${JSONS}/playlist.json
EOF
 cat << EOF > $MPCDIR/src/library.src
mpc -f '\"artist\": \"%artist%\", \"album\": \"%date% - %album%\", \"track\": \"%track%\" - \"%title%\"' playlist | sed ':redo; s/\(\"track\": \)\"\([0-9]\{1,2\}\)\"/\1\"0\2\"/;t redo' | sort | sed -nf \${SED}/mpc2json.sed > \${JSONS}/mpd.json
EOF
 cat << EOF >$MPCDIR/src/order.src
cd \${SRCDIR}
HOST=\${PASSWD}@\${HOSTNAME}
mpc -f "%artist% %date% %album% track %track% %title% file:%file%" playlist | \
        sed ':redo;s/track \([0-9]\{3\}\)/track \1/; t; s/track \([0-9]*\)/track 0\1/; t redo;' | \
        sort | \
        sed 's/^.*file://g' > \${TEMP}/files.txt;
mpc status -f "%artist% %date% %album% %track% %title%" | \
        sed -n -e '1 p' -e '2 s/^.*\([0-9]\+:[0-9]\+\)\/.*$/\1/p' > \${TEMP}/song.txt;
mpc --host=\$HOST --wait crop;
cat \${TEMP}/files.txt | \
        mpc --host=\$HOST --wait add;
NBR=\`mpc -f '%artist% %date% %album% %track% %title% pos=%position%' playlist | sed '1 d' | grep "\$(sed '1 p' \${TEMP}/song.txt)" | sed 's/^.*pos=//'\`;
mpc --host=\$HOST play \$NBR
mpc --host=\$HOST seek \`sed -n '2 p' \${TEMP}/song.txt\`
mpc --host=\$HOST del 1
mpc --host=\$HOST random off
EOF
 cat << EOF > $MPCDIR/sed/mpc2json.sed
s/", *"/"\n"/g
s/\("track": \)"0*\([1-9][0-9]*\|0\{1\}\)"/\1"\2"/
1 {
        h
        i [{
        s/^\("artist":\) \([^\n]*\)/\1\2,\2:[{/
        s/\("album":\) "\([^ ]*\) - \([^\n]*\)"/\1"\3", "date": "\2", "\3":[/
        s/"track": \("[0-9]*"\) - \([^\n]*\)/{ "track": \1, "title": \2 }/p
        g
        s/\n"track":.*$//
        h
        b end
};
H;
g;
/^\("artist": [^\n]*\)\n.*\(\1\)\n.*$/ {
        s/^\("artist": [^\n]*\)\(\n.*\)\(\1\)\n/\3\2/
        h
        b year
}
/^\("artist": [^\n]*\)\n.*\(\1\)\n.*$/ ! {
        s/^\("artist": [^\n]*\)\(\n.*\)\("artist": [^\n]*\)\n/\3\2/
        h
        s/^\("artist": \([^\n]*\)\).*$/]}]},{\1,\2:[{/p
        t ar_new
}
:year
/\("album": [^\n]*\)\n\(\1\)/ ! {
        i ]},{
        :ar_new
        g
        s/\("album": [^\n]*\)\n//
        h
        s/^.*\("album":\) *"\([^ ]*\) - \([^\n]*\)"/\1"\3","date": "\2", "\3":[/
        s/\n"track": \("[0-9]*"\) - \(".*"\)/{ "track": \1, "title": \2 }/p
        b next
}
s/\("album": [^\n]*\n\)\1/\1/
h
s/^.*\n"track": \("[0-9]*"\) - \(".*"\)/,{ "track": \1, "title": \2 }/
P
: next
g
s/\n"track":.*$//
h
: end
\${
        i ]}]}]
}
EOF
 printf "Edit files in $MPCDIR/config:\n"
 find $MPCDIR/config -type f
 printf "\t= = = = = = = =\nAfter run $0 -h\n"
 exit
fi
CONFIG="$MPCDIR/config"
HOSTNAME=""
PASSWD=""
. ${CONFIG}/dirs.conf
MkTEMP="mktemp -p ${TMP} -d mpc.XXXXXXXXXX"
config(){
 #$1 => ${TEMP}
 if test ! -e ${CONFIG}/config.json
 then
  printf "Config file doesn't exist!\n"
  exit
 fi
 test -s $1/ident.txt || \
  sed -n '/"mpd":/ { :ident; /\("\(host\|password\)"\).*\("\(host\|password\)":\)/ { :redo; s/"\(host\|password\)": "\([^"]*\)"/\n\1=\2\n/; t redo; s/\(.*\)\(host=[^\n]*\)\n/\2\n\1/;s/^\(host=[^\n]*\n\).*\n\(password=[^\n]*\).*$/\1\2/p }; N; b ident; }' ${CONFIG}/config.json \
  > $1/ident.txt
 PASSWD="$(sed -n '2 s/^password=//p' $1/ident.txt)"
 HOSTNAME="$(sed -n '1 s/^host=//p' $1/ident.txt)"
}
usage(){
  printf "\
Usage: $0 ARGUMENTS\n\
Arguments:\n\t\
-C\t\tCreate the main library\n\t\
-R on|off\tSwitch random \"on/off\"\n\t\
-A\t\tReplace playlist by the current artist\n\t\
-a ARG\t\tAppend to playlist\n\t\
-r ARG\t\tReplace playlist by selected\n\t\
-D\t\tDelete the current playlist\n\t\
-d ARG\t\tDelele selected\n\t\
-s ARG\t\tSimple search for playing\n\t\
-S ARG\t\tSimple Search\n\t\
-l\t\tSearch from artist\n\t\
-L \"artist\"\tList from artist\n\t\
-h,-?\t\tShow this message\n\
\t= = = = = = = = = = = = = = = =\n\
For '-a, -r, -d, -s, -S':\nAt least one of -A, -a or -t is needed:\n\
  -A \"Artist\"\n\
  -a \"Album\"\n\
  -t \"Title\"\n\
  -T \"Track\" (for -a, -r and -d only)\n"
}
subopts(){
 case $1
 in
 A)
  ARTIST="artist \"$2\""
  ;;
 a)
  ALBUM="album \"$2\""
  ;;
 t)
  TITLE="title \"$2\""
  ;;
 t)
  TRACK="track \"$2\""
  ;;
 *)
  printf "Invalid command line.\nTry $0 -h|-?\n"
  exit 255
  ;;
 esac;
}
error(){
 if test -z "$1" -a -z "$2" -a -z "$3"
 then
  printf "Invalid Command Line.\nTry: $0 -h|-?\n"
  test -d "${TEMP#$TMP}" && rm -rf ${TEMP}
  exit
 fi
}
shuffle(){
 test "`mpc | sed -n 's/^.*random: \(on\|off\).*$/\1/p'`" = "on" && mpc --quiet --wait --host=${PASSWD}@${HOSTNAME} shuffle
}
SED(){
 sed ':redo; s/\(\"track\": \)\"\([0-9]\{1,2\}\)\"/\1\"0\2\"/;t redo' | sort | \
 sed -nf ${SED}/mpc2json.sed > ${JSONS}/$1
}
c_playlist(){
  mpc --host=${PASSWD}@${HOSTNAME} \
   -f "\"artist\": \"%artist%\", \"album\": \"%date% - %album%\", \"track\": \"%track%\" - \"%title%\"" playlist | SED playlist.json
    #sed ':redo; s/\(\"track\": \)\"\([0-9]\{1,2\}\)\"/\1\"0\2\"/;t redo' | sort | \
    #sed -nf ${SED}/mpc2json.sed > ${JSONS}/playlist.json
}
while getopts CRlL::Aa:r:Dd:S:s:h? main
do
case $main
in
 h|\?)
  usage
  exit
 ;;
 C)
  #CREATE
  . ./src/library.src
  exit
 ;;
 R)
  #Switch
  TEMP=`$MkTEMP`
  config ${TEMP}
  rm -r $TEMP
  case $OPTARG
  in
  off)
   . ./src/order.src
  ;;
  on)
   mpc --quiet --host=PASSWD@HOSTNAME random on
   mpc --quiet --host=PASSWD@HOSTNAME shuffle
   mpc -f "%artist% - %album% - %title%"
  ;;
  *)
   printf "Invalid Command Line.\nTry: $0 -h|-?\n"
  ;;
  esac
  exit
 ;;
 r)
  #replace
  shift
  while getopts a:A:T:t value
  do
    subopts $value "$OPTARG"
   done
  error "$ARTIST" "$ALBUM" "$TITLE"
  TEMP=`$MkTEMP`
  config ${TEMP}
  mpc --quiet --wait --host=${PASSWD}@${HOSTNAME} crop;
  printf "mpc --wait --host=${PASSWD}@${HOSTNAME} findadd $ARTIST $ALBUM $TRACK $TITLE\n" > ${SRCDIR}/cmd.src
  . ${SRCDIR}/cmd.src
  shuffle
  mpc --quiet --wait --host=${PASSWD}@${HOSTNAME} del 0;
  c_playlist
  rm -r ${TEMP}
  mpc -f "%artist% - %album% - %title%" current
  exit
 ;;
 A)
  #Replace by current artist
  TEMP=`$MkTEMP`
  config ${TEMP}
  rm -r ${TEMP}
  . ${SRCDIR}/current_artist.src
  c_playlist
  mpc -f "%artist% - %album% - %title%" current
  exit
  ;;
 a)
  #append
  if test ! -f ${JSONS}/playlist.json
  then
   printf "No playlist.\nTry $0 with -r or -A first.\n"
  fi
  shift
  while getopts a:A:T:t value
  do
    subopts $value "$OPTARG"
  done
  error "$ARTIST" "$ALBUM" "$TITLE"
  TEMP=`$MkTEMP`
  config ${TEMP}
  printf "mpc --quiet --wait --host=${PASSWD}@${HOSTNAME} findadd $ARTIST $ALBUM $TRACK $TITLE\n" > ${SRCDIR}/cmd.src
  . ${SRCDIR}/cmd.src
  shuffle
  c_playlist
  rm -r ${TEMP}
  mpc -f "%artist% - %album% - %title%" current
  exit
 ;;
 D)
  #Delete current playlist
  TEMP=`$MkTEMP`
  config ${TEMP}
  mpc --quiet --wait --host=${PASSWD}@${HOSTNAME} crop;
  mpc --wait --host=${PASSWD}@${HOSTNAME} -f "%artist% %date% %album% track %track% %title% file:%file%" listall  | \
   sed ":redo;s/track \([0-9]\{1,2\}\) /track 0\1 /; t redo;" | \
   sort | sed "s/^.*file://g" | mpc --host=${PASSWD}@${HOSTNAME} add;
  shuffle
  mpc --quiet --wait --host=${PASSWD}@${HOSTNAME} del 0;
  test -e ${JSONS}/playlist.json && rm ${JSONS}/playlist.json
  rm -r ${TEMP}
  mpc -f "%artist% - %album% - %title%" current
  exit
 ;;
 d)
  #delete
  shift
  while getopts a:A:T:t value
  do
   case $value
   in
   A)
    ARTIST="$OPTARG"
    _ARTIST="artist \"$ARTIST\""
    ;;
   a)
    ALBUM="$OPTARG"
    _ALBUM="album \"$ALBUM\""
    ;;
   t)
    TITLE="$OPTARG"
    _TITLE="title \"$TITLE\""
    ;;
   t)
    TRACK="$OPTARG"
    _TRACK="track \"$TRACK\""
    ;;
   *)
    printf "Invalid command line.\nTry $0 -h|-?\n"
    exit 255
    ;;
   esac;
  done
  error "$ARTIST" "$ALBUM" "$TITLE"
  TEMP=`$MkTEMP`
  config ${TEMP}
  printf "mpc -f \"\\\"artist\\\": \\\"%%artist%%\\\", \\\"album\\\": \\\"%%date%% - %%album%%\\\", \\\"track\\\": \\\"%%track%%\\\" - \\\"%%title%%\\\"\" --host=${PASSWD}@${HOSTNAME} search $_ARTIST $_ALBUM $_TRACK $_TITLE\n" > ${SRCDIR}/cmd.src
  . ${SRCDIR}/cmd.src | sed ':redo; s/\(\"track\": \)\"\([0-9]\{1,2\}\)\"/\1\"0\2\"/;t redo' | sort | SED remove.json
  if diff -q ${JSONS}/playlist.json ${JSONS}/remove.json > /dev/null 2>&1
  then
   printf "Use: $0 -D\n"
   rm -r ${TEMP}
   exit
  fi
  mpc --host=${PASSWD}@${HOSTNAME} -f "%artist% %album% %track% %title% pos=%position%" playlist | \
  	sed -n "s/^.*$ARTIST *$ALBUM *$TRACK *$TITLE.* pos=\([0-9]*\)$/\1/p" | mpc --host=${PASSWD}@${HOSTNAME} del
  rm -r ${TEMP}
  c_playlist
  if test ! -f ${JSONS}/playlist.json -o ! -s ${JSONS}/playlist.json
  then
  	rm -v ${JSONS}/playlist.json
  	mpc --host=${PASSWD}@${HOSTNAME} load all
 	shuffle
	mpc --quiet --host=${PASSWD}@${HOSTNAME} play
	#mpc --host=${PASSWD}@${HOSTNAME} next
 fi
  mpc -f "%artist% - %album% - %title%" current
  exit
 ;;
 s)
  #Simple search
  shift
  while getopts a:A:t: value
  do
   subopts $value "$OPTARG"
  done
  error "$ARTIST" "$ALBUM" "$TITLE"
  TEMP=`$MkTEMP`
  printf "mpc -f \"artist \\\"%%artist%%\\\" album \\\"%%album%%\\\" track \\\"%%track%%\\\" title \\\"%%title%%\\\"\" search $ARTIST $ALBUM $TITLE\n" > ${SRCDIR}/cmd.src
  . ${SRCDIR}/cmd.src | cat -n > ${TEMP}/mpc.scan
  if test ! -s ${TEMP}/mpc.scan
  then
   printf "Search is empty.\n"
   rm -r ${TEMP}
   exit
  fi
  sed 's/\(artist\|album\|track\|title\) //g' ${TEMP}/mpc.scan | less
  printf "Which one (0 = none):"
  read READ
  test $READ -ge 0 -o $READ -le 0 || rm -r ${TEMP}
  test -d ${TEMP} || exit 255
  if test $READ -le 0
  then
   rm -r ${TEMP}
   printf "Ok,\n\tSee you later.\n"
   exit
  fi
  config ${TEMP}
  sed -n "$READ s/^[ \t]*[0-9]*[ \t]*/mpc --host=$PASSWD@$HOSTNAME searchplay /p;" -i ${TEMP}/mpc.scan
  . ${TEMP}/mpc.scan
  rm -r ${TEMP}
  exit
 ;;
 S)
  CMD=""
  shift
  while getopts a:A:t: value
  do
   subopts $value "$OPTARG"
   case $value
   in
   A)
    AR="artist \\\"%%artist%%\\\""
    #break
   ;;
   a)
    AL="album \\\"%%album%%\\\""
    #break
   ;;
   t)
    TI="track \\\"%%track%%\\\" title \\\"%%title%%\\\""
    #break
   ;;
   esac
  done
  if test ${#TI} -ne 0
  then
  	if test ${#AL} -eq 0
	then
		AL="album \\\"%%album%%\\\""	
	fi
  	if test ${#AR} -eq 0
	then
		AR="artist \\\"%%artist%%\\\""
	fi
  fi
  if test ${#AL} -ne 0
  then
  	if test ${#AR} -eq 0
	then
		AR="artist \\\"%%artist%%\\\""
	fi
  fi
  if test ${#AR} -eq 0
  then
	AR="artist \\\"%%artist%%\\\""
  fi
  CMD="${AR} ${AL} ${TI}"
  error "$ARTIST" "$ALBUM" "$TITLE"
  TEMP=`$MkTEMP`
  config ${TEMP}
  printf "mpc --host=${PASSWD}@${HOSTNAME} -f \"$CMD\" search $ARTIST $ALBUM $TITLE\n" > ${SRCDIR}/cmd.src
  . ${SRCDIR}/cmd.src | sort | uniq
  rm -r ${TEMP}
  #echo $TEMP
  exit
 ;;
 L)
  mpc -f 'artist "%artist%" album "%album%" track "%track%" title "%title%"' search artist "$OPTARG" | less
  exit
 ;;
 l)
  mpc -f "%artist%" playlist | sort | uniq
  exit
 ;;
 *)
  printf "Invalid command line.\nTry $0 -h|-?\n"
  exit 255
 esac;
done
printf "Anormal Termination.\nTry $0 -h|-?\n"
exit 255
