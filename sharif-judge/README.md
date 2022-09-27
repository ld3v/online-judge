# Online Judge - Docker supported
Update new version, which is **supported by docker**!  
By **[huy.nq](mailto:nqh.d3v@gmail.com)** at *20:45 - 22/07/2022*

> **NOTE**: Currently, I just add docker to start this app, It **STILL NOT SUPPORT** user submit their code!
-----
Read full document about **Online Judge**, read [here](https://github.com/nqhd3v/online-judge/tree/main/sharif-judge/src/README.md).

-----
## Setup project and run it by docker!
Easier to start your project without install PHP, MySQL, or anything, just install docker and run some commands!

Absolutely, before run commands, you need to have **Docker** and **docker compose**. To install theme, view [here](https://docs.docker.com/get-docker/).  

Done? Now, let's setup this project!
### Create a new ENV file
```bash
cp .env.example .env
```
### Update `system_path` and `application_path` (line 113, and 132).
### Config database connections and config variables
```bash
# Go to `config` folder
cd src/application/config

# Copy from example file
cp database.php.example database.php
cp config.php.example config.php
```
1. Update `lines 87-91` in `database.php`, update configuration for database's connection.
   Example (if you not change anythings, you can apply that configs):
   ```php
    ...
    'port' => '3306',
    'hostname' => 'sharif_judge_db', // container's name of database
    'username' => 'root',            // view in file `docker/db/Dockerfile`.
    'password' => 'root@wecode',     // view in file `docker/db/Dockerfile`.
    'database' => 'sharif_judge',    // view in file `docker/db/Dockerfile`.
    ...
   ```
2. Update `line 26` in `config.php`, update base path for your app.
   Example (if you not change anythings, you can apply that configs)
   ```php
   ...
   $config['base_url'] = 'http://localhost:12000/'; # port 12000 is defined in `.env`.
   ...
   ```

### Now, start your project.
```bash
docker-compose up -d --build --remove-orphans
# or
make up
```

Expected output:
![](https://i.imgur.com/T0TDjKD.png)

Now, your `judge` should be available [here](https://localhost:12000).

By default, you can use this account to login:
```
admin
0123456Son@
```

### Already has SQL file.
In the case, you already have a SQL file, (maybe exported from your old system,...).

Move it to `/sharif-judge/docker/db` folder. (Example `wecode.sql` file).

Open `Dockerfile` (`/sharif-judge/docker/db/Dockerfile`) and replace "**sample.sql**" with "**wecode.sql**" (Line 3).
```Dockerfile
# Old
ADD ./sample.sql /docker-entrypoint-initdb.d
# Change to
ADD ./wecode.sql /docker-entrypoint-initdb.d
```

Restart your app with command `make up`.
