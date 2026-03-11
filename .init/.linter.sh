#!/bin/bash
cd /home/kavia/workspace/code-generation/react-quick-start-scaffold-241050-241064/react_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

