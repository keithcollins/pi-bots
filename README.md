# raspberry pi

test test out of date

This repo is auto-pulled to raspberry pi via cron job. On the pi, it lives in `~/bots`

### Shell scripts on the pi

```
/usr/local/bin/
│   gitpull.sh
│   usinjuries.sh
|   gitpullLog.txt
|   usinjuriesLog.txt
│
```

New shell scripts to be executed from cron need to be made executable with

`$ chmod +x filename.sh`

### cron jobs on the pi

crontab executes shell scripts as the user who created the jobs (I think). Edit crontab with

`$ crontab -e`

Or view it with 

`$ crontab -l`

These are the current cron jobs:
```
# git pull every ten minutes
*/10 * * * * /usr/local/bin/gitpull.sh 2>/tmp/gitpullError
# tweet usinjuries every three hours
0 */3 * * * /usr/local/bin/usinjuries.sh 2>/tmp/usinjuriesError
```

View most recent job error/response with:

`$ cat /tmp/gitpullError`

`$ cat /tmp/usinjuriesError`

View cron job event log:

`$ grep CRON /var/log/syslog`
