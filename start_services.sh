#!/bin/bash

# PlantsAI Service Startup Script
echo "Starting PlantsAI services..."

# Navigate to the project directory
cd /Users/chang/PlantsAI

# Kill any existing processes on the required ports
echo "Cleaning up existing processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:8001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:5174 | xargs kill -9 2>/dev/null || true

# Wait for ports to be freed
sleep 2

# Start the main backend server
echo "Starting main backend server (port 8000)..."
cd backend/server
./venv/bin/python main.py &
MAIN_PID=$!

# Wait a moment for the main server to start
sleep 3

# Start the Gemini backend server
echo "Starting Gemini backend server (port 8001)..."
./venv/bin/python location_gemini.py &
GEMINI_PID=$!

# Wait a moment for the Gemini server to start
sleep 3

# Start the frontend development server
echo "Starting frontend development server..."
cd ../../frontend
npm run dev &
FRONTEND_PID=$!

# Save PIDs to a file for easy cleanup
echo $MAIN_PID > /tmp/plantsai_main.pid
echo $GEMINI_PID > /tmp/plantsai_gemini.pid
echo $FRONTEND_PID > /tmp/plantsai_frontend.pid

echo "All services started!"
echo "Main Backend: http://localhost:8000"
echo "Gemini Backend: http://localhost:8001"
echo "Frontend: http://localhost:5174 (or 5173)"
echo ""
echo "To stop all services, run: ./stop_services.sh" 