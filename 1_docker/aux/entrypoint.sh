echo -e "> Installing application dependences"
cd /opt/metools-api && npm install

echo "186.208.81.229  jim.metasig.com.br " >> /etc/hosts

echo -e "> Installing application dependences"
cd /opt/metools-api && pm2 start app.js --no-daemon

