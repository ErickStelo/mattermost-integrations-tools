echo -e "> Installing application dependences"
cd /opt/metools-api && npm install

echo -e "> Installing application dependences"
cd /opt/metools-api && pm2 start app.js --no-daemon