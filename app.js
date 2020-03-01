const Server = require('./findServer'); // fileServer.js contains all logical calculations
const data  = require('./data.json'); // data.json contains list of servers
const message = require('./message_template'); // message_template is an template of messages
// comment

Server.findServer(data).then((server)=>{
    console.log(`${message.online} ${server.url}`);
}).catch(err=>{
    console.log(err);
})
