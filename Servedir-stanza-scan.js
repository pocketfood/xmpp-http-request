const express = require('express')
const path = require('path')
const app = express()

// this is stanza and scan
const XMPP = require('stanza');
const Evilscan = require('evilscan');


// Static Middleware
app.use(express.static(path.join(__dirname, 'public',)))
{
};


// View Engine Setup
app.set('public', path.join(__dirname, 'public'))
//app.use('/public', express.static('public'))


const client = XMPP.createClient({
  // Prompt input results for username and password
  jid: "user@example.net",
  password: "",
  resource: 'module',
  sendReceipts: true,
  capsNode: ' ',
  softwareVersion: ' ',
  transports: {
    websocket: 'wss://example.net/',
  }
});


// Clears screen and exits when user puts incorrect username or password
client.on('auth:failed', function() {
  process.stdout.write('\x1Bc')
  const time = new Date().toLocaleTimeString();
  console.log('\n',time,'\x1b[31m','--- ERROR! ---' ,'\x1b[0m','\n');
  process.exit();
  });

  // Lets the User know if a message was failed
client.on('message:failed', function() {
  process.stdout.write('\x1Bc')
  const time = new Date().toLocaleTimeString();
  console.log('\n',time,'\x1b[31m','--- ERROR! - Message Failed ---' ,'\x1b[0m','\n');
  });


// session
client.on('session:started', async (from, jid) => {

  console.log('\x1b[33m%s\x1b[0m', '--- XMPP Connection ---');
  console.log('\x1b[1m\x1b[36m','signed in as:',from,'\x1b[0m','\n');

  // Client goes offline if a user connects with the same resource
  client.on('--transport-disconnected', function() {
    process.stdout.write('\x1Bc')
    const time = new Date().toLocaleTimeString();
    console.log('\n',time,'\x1b[31m','--- ERROR! - Duplicate resource ---', from ,'\x1b[0m','\n');
    process.exit();
    });



  // This sends a presence saying the user is online
  // very important
  client.sendPresence(console.error);



  // receiving messages
  client.on('chat', msg => {

      client.sendMessage({
          to: msg.from,
          //body: msg.body
      });

      client.sendMarker(msg.from);

      // TimeStamp for received messages
      const time = new Date().toLocaleTimeString();

      console.log(time,'\x1b[32m[',msg.from,']:\x1b[0m',msg.body);


  });

 // This hosts a express webpage
 app.use('/', function (req, res) {

  // I like looking at a meme but could just be a blank page
  res.send('<img src="meme.png" alt="meme.png" class="transparent overflowingVertical">')
  //res.send('')

  // outputs the connect ip
  //console.log('[ ',req.socket.remoteAddress,' ][ ',req.header('User-Agent'),']','[',req.path,' ] ')

  // Scans the connected ip
  const http = req.header('x-forwarded-for')

  const options = {
      target:http,
      //port:'8080,8083',
      status:'TROU', // Timeout, Refused, Open, Unreachable
      banner:true,
      geo: true
  };

  new Evilscan(options, (err, scan) => {

      if (err) {
          console.log(err);
          return;
      }

      scan.on('result', data => {

      //  This is where you can send
      //  the data to the map

      // fired when item is matching options
      console.log(data);

      // sending messages
      client.sendMessage ({
        to: "user@example.net",
        body: JSON.stringify(data)
        });
        });

      scan.on('error', err => {
          throw new Error(data.toString());
      });

      scan.on('done', () => {
          // finished !
      });

      scan.run();

  });
});
});

app.listen(8083, function(error){
    if(error) throw error
    console.log("Server running on localhost:8083")
});


client.connect().catch(console.error);
