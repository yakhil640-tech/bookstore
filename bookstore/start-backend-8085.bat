@echo off
cd /d "%~dp0backend"
mvn spring-boot:run "-Dspring-boot.run.profiles=local" "-Dspring-boot.run.arguments=--server.port=8085"
