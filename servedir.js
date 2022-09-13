const express = require('express')
const path = require('path')
const app = express()

const { client, xml } = require("@xmpp/client");


// Static Middleware
app.use(express.static(path.join(__dirname, 'public',)))
{
};


// View Engine Setup
app.set('public', path.join(__dirname, 'public'))
//app.use('/public', express.static('public'))


const xmpp = client({
    service: "",
    domain: "",
    resource: "",
    username: "",
    password: "",
  });

  xmpp.on("online", async () => {
    app.use('/', function (req, res) {
      
      res.send('<img src="meme.png" alt="meme.png" class="transparent overflowingVertical">')
    const date = new Date();

    const message = xml(
      "message",
      { type: "chat", to: 'user' },
      xml("body", {}, date,'[ ',req.ip,' ][ ',req.path,' ] '),
    );

    xmpp.send(message);
    
  });
  
  const date = new Date();
  console.log('\x1b[33m%s\x1b[0m', '--- XMPP Connection ---')
  console.log('\x1b[36m','http-bot Started on',date,'\x1b[0m')

});


app.listen(8083, function(error){
    if(error) throw error
    console.log("Server running on localhost:8083")
});

// starts XMPP connection
xmpp.start();
