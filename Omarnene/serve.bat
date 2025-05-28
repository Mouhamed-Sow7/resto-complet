@echo off
cd /d %~dp0
start http://127.0.0.1:8080
http-server -p 8080
pause
