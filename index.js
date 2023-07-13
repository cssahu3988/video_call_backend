const dgram = require('node:dgram');
const express = require('express');
const app = express();
app.use(express.json());

var audio_address = new Map();            //{"user_name":"ip_address"}
var video_address = new Map();
var calls = new Map(); 

app.get('/', (req,res)=>{
    res.status(200).send({"msj":"hello from server"});
})

app.post('/setUserNamePorts',(req,res)=>{
  // var user_name = req.body.user_name;
  // var port = req.body.port;
  // var ip_address = req.body.ip_address;
  // console.log(user_name);
  // console.log(req.ip);
  // address.set(ip_address,user_name);
  // address2.set(user_name,ip_address);
  // ports.set(user_name,port);
  res.status(200).send({"msj":"details submitted"});
});

app.listen(5000,()=>{
    console.log('http listening on port 5000');
})

const server = dgram.createSocket('udp4');
const audioServer = dgram.createSocket('udp4');
const videoServer = dgram.createSocket('udp4');


const sendMessage = (msg,rinfo)=>{
  console.log(msg.toString()+":"+rinfo.address+":"+rinfo.port);
  server.send(msg, rinfo.port, rinfo.address);
}

const sendPacket = async(msg,rinfo)=>{
  server.send(msg, rinfo.port, rinfo.address);
}

server.on('error', (err) => {
  console.error(`server error:\n${err.stack}`);
  server.close();
});

var caller_audio_address;
var receiver_audio_address;
var caller_video_address;
var receiver_video_address;

server.on('message', async(msg, rinfo) => {
  if(msg.toString().includes("call:")){//call:user_name:other_user_name
    var caller = msg.toString().split(":")[2];
    var receiver = msg.toString().split(":")[3];

    if(msg.toString().includes("audio:")){
      caller_audio_address = rinfo.address+":"+rinfo.port;
      receiver_audio_address = audio_address.get(receiver);
      calls.set(caller_audio_address,receiver_audio_address);
      calls.set(receiver_audio_address,caller_audio_address);
      sendMessage(receiver_audio_address,rinfo);
    }    

    if(msg.toString().includes("video:")){
      caller_video_address = rinfo.address+":"+rinfo.port;
      receiver_video_address = video_address.get(receiver);
      calls.set(caller_video_address,receiver_video_address);
      calls.set(receiver_video_address,caller_video_address);
      sendMessage(receiver_video_address,rinfo);
    }
  }
  else if(msg.toString().includes("audio:")){
    audio_address.set(rinfo.address+":"+rinfo.port,msg.toString().split(":")[1]);
    audio_address.set(msg.toString().split(":")[1],rinfo.address+":"+rinfo.port);
    sendMessage(msg, rinfo);
    return;
  }
  else if(msg.toString().includes("video:")){
    video_address.set(rinfo.address+":"+rinfo.port,msg.toString().split(":")[1]);
    video_address.set(msg.toString().split(":")[1],rinfo.address+":"+rinfo.port);
    sendMessage(msg, rinfo);
    return;
  }
})
  
  

server.on('listening', () => {
  const address = server.address();
  console.log(`udp server listening ${address.address}:${address.port}`);
});

server.bind(3000);




audioServer.on('error', (err) => {
  console.error(`server error:\n${err.stack}`);
  server.close();
});

audioServer.on('message', async(msg, rinfo) => {
  var receiver_address = calls.get(rinfo.address+":"+rinfo.port);
  rinfo.address = receiver_address.split(":")[0];
  rinfo.port = receiver_address.split(":")[1];
  sendPacket(msg, rinfo);
});

audioServer.on('listening', () => {
  const address = audioServer.address();
  console.log(`udp server listening ${address.address}:${address.port}`);
});

audioServer.bind(3100);




videoServer.on('error', (err) => {
  console.error(`server error:\n${err.stack}`);
  server.close();
});

videoServer.on('message', async(msg, rinfo) => {
  var receiver_address = calls.get(rinfo.address+":"+rinfo.port);
  rinfo.address = receiver_address.split(":")[0];
  rinfo.port = receiver_address.split(":")[1];
  sendPacket(msg, rinfo);
});

videoServer.on('listening', () => {
  const address = videoServer.address();
  console.log(`udp server listening ${address.address}:${address.port}`);
});

videoServer.bind(3200);