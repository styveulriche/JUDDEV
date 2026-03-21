@echo off
echo ====================================================
echo   JUDDEV CORPORATION - Demarrage du serveur
echo ====================================================
echo.

:: Vérifier si MongoDB est en cours d'exécution
sc query MongoDB >nul 2>&1
if %errorlevel% == 0 (
  echo [OK] Service MongoDB detecte
  sc start MongoDB >nul 2>&1
) else (
  echo [INFO] Tentative de demarrage de mongod...
  start /B "" "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "C:\data\db" >nul 2>&1
  if %errorlevel% NEQ 0 (
    start /B "" "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db" >nul 2>&1
  )
  timeout /t 3 /nobreak >nul
)

:: Créer le dossier data/db si nécessaire
if not exist "C:\data\db" mkdir "C:\data\db"

:: Aller dans le dossier backend
cd /d "%~dp0JUDDEV-backend"

echo [INFO] Installation des dependances...
call npm install --silent

echo [INFO] Initialisation de la base de donnees...
call node seed.js

echo.
echo [START] Demarrage du backend sur http://localhost:5000
echo [INFO] Frontend : http://localhost:5000
echo [INFO] Dashboard: http://localhost:5000/admin/login.html
echo [INFO] API      : http://localhost:5000/api
echo.
call npm start
