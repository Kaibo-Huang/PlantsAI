#!/bin/bash

# PlantsAI Service Stop Script
echo "Stopping PlantsAI services..."

# Kill processes by PID if available
if [ -f /tmp/plantsai_main.pid ]; then
    kill -9 $(cat /tmp/plantsai_main.pid) 2>/dev/null || true
    rm /tmp/plantsai_main.pid
fi

if [ -f /tmp/plantsai_gemini.pid ]; then
    kill -9 $(cat /tmp/plantsai_gemini.pid) 2>/dev/null || true
    rm /tmp/plantsai_gemini.pid
fi

if [ -f /tmp/plantsai_frontend.pid ]; then
    kill -9 $(cat /tmp/plantsai_frontend.pid) 2>/dev/null || true
    rm /tmp/plantsai_frontend.pid
fi

# Kill any remaining processes on the ports
echo "Cleaning up port 8000..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

echo "Cleaning up port 8001..."
lsof -ti:8001 | xargs kill -9 2>/dev/null || true

echo "Cleaning up port 5173..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo "Cleaning up port 5174..."
lsof -ti:5174 | xargs kill -9 2>/dev/null || true

echo "All services stopped!" 