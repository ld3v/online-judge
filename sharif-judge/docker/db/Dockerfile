FROM mysql:5.6

ADD ./full.sql /docker-entrypoint-initdb.d

ENV MYSQL_DATABASE=sharif_judge \
    MYSQL_ROOT_PASSWORD=root@wecode

EXPOSE 3306