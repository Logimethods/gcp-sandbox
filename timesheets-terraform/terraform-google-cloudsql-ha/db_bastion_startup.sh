#! /bin/bash\n\n#Installs mysql commandline\napt-get update\napt-get install mysql-client -y\n

export SQLHOST=35.245.9.72
mysql --host=$SQLHOST -udbuser -pdbuser -e "show databases" | grep -v Database | grep -v mysql| grep -v information_schema | grep -v performance_schema | grep -v sys | gawk '{print "drop database `" $1 "`;select sleep(0.1);"}' | mysql --host=$SQLHOST -udbuser -pdbuser

git clone https://github.com/datacharmer/test_db.git
mysql --host=$SQLHOST --user=dbuser --password=dbuser < employees.sql 