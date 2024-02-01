const { exec } = require('child_process');

const backend = exec('cd ./Backend && node server.js');
const frontend = exec('cd ./Frontend && npm run serve');

setTimeout(() => {
  backend.kill();
  frontend.kill();
  console.log('Testing Done, Server Killed.');
  process.exit(0); 
}, 20000);//20sec
