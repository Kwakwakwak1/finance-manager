#!/bin/bash
# Launch finance manager node server
cd /Users/kwak/Home/finance-manager
nohup node server.js > finance-manager.log 2>&1 &
echo "Finance Manager service started on port 3000"
echo "Access it at http://localhost:3006"