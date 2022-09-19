#!/bin/bash
#    [                                                                   ]
echo "\e[1;32m[i] - [ DEPLOY ] =====================================\e[0m"
read -rp '      [?] - Do we need to git pull? (y/N): ' NEED_TO_PULL
read -rp '      [?] - Do we need to run docker-compose up? (y/N): ' NEED_TO_DOCKER_COMPOSE_UP
read -rp "      [?] - Do we need to install dependencies (install with '--force' flag) ? (y/N): " NEED_TO_INSTALL_NODE_MODULES
echo "\e[1;32m[%] - [ Back to your source ] ========================\e[0m"
cd ..
echo "\e[1;33m    - Current path: '$PWD'\e[0m"
if [ "$NEED_TO_PULL" = 'y' ]
then
    echo "\e[1;32m[%] - [ Updating new code... ] =======================\e[0m"
    git pull
    if [ $? -eq 0 ]
    then
        echo "\e[1;33m    - [✔] - Your code is updated!\e[0m"
    else
        echo "\e[1;31m    - [✘] - Can't update your code!\e[0m"
    fi
fi
if [ "$NEED_TO_DOCKER_COMPOSE_UP" = 'y' ]
then
    echo "\e[1;32m[%] - [ Creating your docker... ] ====================\e[0m"
    docker compose up -d --remove-orphans
    if [ $? -eq 0 ]
    then
        echo "\e[1;33m    - [✔] - Your docker is up!\e[0m"
    else
        echo "\e[1;31m    - [✘] - Can't start your docker!\e[0m"
    fi
fi
echo "\e[1;32m[%] - [ Creating source backup... ] ==================\e[0m"
dateNow=$(date +'%Y-%m-%d.%H-%M-%S')
tar cf ~/wecode.${dateNow}.tgz dist
export NODE_OPTIONS="--max-old-space-size=1024"
if [ "$NEED_TO_INSTALL_NODE_MODULES" = 'y' ]
then
    echo "\e[1;32m[%] - [ Installing dependecies... ] ==================\e[0m"
    npm install --force
    if [ $? -eq 0 ]
    then
        echo "\e[1;33m    - [✔] - Dependecies are updated!\e[0m"
    else
        echo "\e[1;31m    - [✘] - Can't install dependencies\e[0m"
    fi
fi
echo "\e[1;32m[%] - [ Building your code... ] ======================\e[0m"
npm run build
echo "\e[1;32m[%] - [ Update .env in build source ] ================\e[0m"
cp .env ./dist/src/.env
echo "\e[1;32m[%] - [ Restarting your application... ] =============\e[0m"
pm2 restart wecode
echo "\e[1;32m[✓] - [ Your app is deployed successfully! ] =========\e[0m"