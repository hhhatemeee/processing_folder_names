@echo off

echo Загрузка и установка Node.js...
curl -o nodejs.msi https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
msiexec /i nodejs.msi /qn

echo Установка Yarn...
npm install -g yarn

echo Выполнение команды yarn install...
yarn install

echo Установка завершена.
exit 0
