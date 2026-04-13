#!/bin/bash
set -e

echo "=== JUDDEV CORPORATION - Railway Deployment ==="

echo "[1/2] Installing dependencies..."
cd JUDDEV-backend
npm install --omit=dev

echo "[2/2] Starting server..."
node server.js
