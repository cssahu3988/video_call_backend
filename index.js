const dgram = require('node:dgram');
const express = require('express');
const app = express();
app.use(express.json());

var calls = new Map();

app.get('/', (req,res)=>{
    res.status(200).send({"msj":"hello from server"});
})

app.get('/initiatecall',(req,res)=>{
  var user_name = req.query.user_name;
  console.log(user_name);
  console.log(req.ip);
  if(!calls.has(`${user_name}`)){
    calls.set(user_name,req.socket.remoteAddress)
  }
  else{
    return res.status(400).send({"msj":"user name already exists"});
  }
  res.status(200).send({"msj":"call initiated"});
});

app.listen(5000,()=>{
    console.log('http listening on port 5000');
})

const server = dgram.createSocket('udp4');

server.on('error', (err) => {
  console.error(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  console.log(Uint8Array.from(Buffer.from(msg)));
  server.send("Hello", rinfo.port, rinfo.address);
});

server.on('listening', () => {
  const address = server.address();
  console.log(`udp server listening ${address.address}:${address.port}`);
});

server.bind(3000);