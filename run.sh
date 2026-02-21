#!/bin/bash

cd lifesaver-server
npm install
npm run seed
npm start &
cd ../lifesaver-client
npm install 
npm run dev