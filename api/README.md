# Online-Judge - `@judge-api`
<small>
<ul>
<li>Document for <code>@judge-api</code></li>
<li>Created at <i>22:00 - 30/09/2022</i>.</li>
<li>Last updated at <i>22:48 - 30/09/2022</i> by <a href="mailto:nqh.d3v@gmail.com"><b>@nqh.d3v</b></a></li>
</ul>
</small>

This document will guide you how to setup, start this application. Other, documents for reference features.

## 0. Source structure
```bash
    - common
    - data
    - dist
    - docs
    - logs
    - migrations
    - scripts
    - src
    - test
    - upload
    - utils         # 
```

## 1. How to setup
To run this app (`@judge-api`), your computer has to have:
- `Docker` - Install here: https://docs.docker.com/engine/install/
- `docker-compose` - Install here: https://docs.docker.com/compose/install/
- `NodeJS` - Install here: https://nodejs.org/en/download/  
  This app is running with **node@v16**.

Already have it? Now, let's setup `@judge-api`!

### 1.1 First, create a new ENV file to declare environment variables.
You can make a copy from my `.env` example file (`.env.example`)
```bash
cp .env.example .env
```
In this file, you will see some variables, like this:
```bash
APP_FRONTEND_URL="http://localhost:11000"  # Frontend URL
JUDGE_URL="http://localhost:12000"         # @sharif-judge app URL
MAINTENANCE=""                             # Maintenance finish time (unix)
# DATABASE CONFIGURE
POSTGRES_HOST="localhost"                  # Database host
POSTGRES_PORT=11011                        # Database port
POSTGRES_USER="root"                       # Database username
POSTGRES_PASSWORD="root@wecode"            # Database password
POSTGRES_DB="db"                           # Database name
ADMINER_PORT=11012                         # Adminer port
# REDIS
REDIS_PORT=11022                           # Redis port (use for cache)
REDIS_HOST="localhost"                     # Redis host
# APP CONFIGURE
APP_PORT=11010                             # App port (@judge-api app port)
APP_ACCOUNT_USER="admin"                   # Username for default account (for init)
APP_ACCOUNT_PASS="admin@wecode"            # Password for default account (for init)
TEST_OUTPUT_DIRECTORY_PATH="./upload/"     # Directory path (store test files for problems)
# AUTHENTICATE CONFIGURE
JWT_SECRET="jwt-secret-for-auth"           # JWT secret string (use for encrypting password)
JWT_EXPIRATION_DATE=7                      # Time to expire JWT (days)
PASS_HASH_SALT=15                          # Password hash-salt length
AUTH_SECRET_STR="auth-secret-str"          # Auth secret string (use for encrypt auth's token)
# MAIL CONFIGURE
MAIL_UI_PORT=11020                         # Mailhog UI PORT
MAIL_HOST="localhost"                      # Mailhog host
MAIL_PORT=11021                            # Mailhog SMTP port
MAIL_USER="hi@host.example"                # Mail username
MAIL_PASS="password@example"               # Mail password
MAIL_FROM="hi@wecode.nqhuy.dev"            # Mail from
```

> In these ENV variables, `MAINTENANCE` is variable with empty value, just set value for it, when you want to tell **_"This server is in maintenance mode"_**.

In the real case, you should change value of `POSTGRES_PASSWORD`, `JWT_SECRET`, `AUTH_SECRET_STR`, and `APP_ACCOUNT_PASS`, instead of using default value.

### 1.2 Install dependencies
To install dependencies for this app, run `npm install`. Make sure that you are using `node@v16` before run this command.

> In some cases, you can get an error "Conflict dependencies...", don't worry, continue with flag `--force` (`npm install --force`).

## 2. Start your app
### 2.1 Start docker
To start docker for this app, run `docker-compose up -d --remove-orphans` (or `make up`).

Expected result:  
![](https://i.imgur.com/jmcHwnG.png)

Now, your `adminer` and `mailhog` services should be available here:
- **adminer**: http://localhost:11012.
  By default, you can login with username and password is `root` and `root@wecode` (`POSTGRES_USERNAME` and `POSTGRES_PASSWORD` variables in ENV file).
- **mailhog**: http://localhost:11021.

### 2.2 Start backend.
To start your backend (`@judge-api`), run `npm run start` (or `make dev`).

Expected result:  
![](https://i.imgur.com/NA7kyMk.png)

Now, your backend should be available here: http://localhost:11010. Visit, and you should be got a message: **"OK! I AM FINE"**

### 2.3 Initial default account.
To init default account (create default account with username and password, which setup in ENV file), visit here: http://localhost:11010/init.

You will get some message like this:
- **Hi, I am here!** - You already init before!
- **Ohh! Where am I! Can I see me!?** - An expected error occur when init this account -> Not create before, and have error when save new account!
- **So early, now is ___** - An expected error occur when check is account existed in database -> Duplicate account! 
- **Ohh! I think i have COVID-19 virus!!** - An unknown error occur! Please check your log in your app to fix it early! => **CRITICAL ISSUE**
- **Thank for awake me up!** - Yup, init default account successfully!

## 3. Document for reference features:
- [Sync-all-data - How to **sync-all-data** from old system to current system](https://github.com/nqhd3v/online-judge/blob/main/api/docs/sync-all-data.md)
- [Submission - Submit code, and what need to do to compile, run and test result with test files](https://github.com/nqhd3v/online-judge/blob/main/api/docs/submission.md).