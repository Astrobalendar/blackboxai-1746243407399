@echo off
echo 🔁 Loading environment variable: MONGODB_URI...

:: Manually set the environment variable (Windows batch syntax)
set MONGODB_URI=mongodb+srv://akurafamily:Akura%%40gmail.com@cluster0.5pizcxq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

echo 🚀 Starting backend server...
python backend_server.py

pause
