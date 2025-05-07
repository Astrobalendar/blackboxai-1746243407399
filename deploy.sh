#!/bin/bash
cd apps/frontend
npm run build
cd ../..
firebase deploy
