#!/bin/sh
set -e

# Start backend in background
node /app/backend/build/src/apps/backend/server.js &
PID_BACKEND=$!

# Wait a bit for backend to be ready
sleep 2

# Start nginx in foreground
nginx

# If nginx stops, kill backend
kill $PID_BACKEND