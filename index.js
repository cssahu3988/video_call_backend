const dgram = require('node:dgram');
const express = require('express');
const app = express();
app.use(express.json());


app.get('/', (req,res)=>{
    res.status(200).send({"msj":"hello from server"});
})

app.listen(80,()=>{
    console.log('listening on port 80');
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
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(3000);