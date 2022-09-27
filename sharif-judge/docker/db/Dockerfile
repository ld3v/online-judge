FROM mysql:5.6

ADD ./sample.sql /docker-entrypoint-initdb.d

ENV MYSQL_DATABASE=wecode_judge \
    MYSQL_ROOT_PASSWORD=root@wecode

EXPOSE 3306