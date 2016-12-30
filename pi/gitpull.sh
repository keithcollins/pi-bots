#!/bin/bash
REPODIR=$HOME/bots/
cd $REPODIR
var=`/usr/bin/git pull origin master`
echo $var > /usr/local/bin/gitpullLog.txt