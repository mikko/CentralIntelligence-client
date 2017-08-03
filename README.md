# Central Intelligence client helper


## What is Central Intelligence?

Check out https://github.com/mikko/CentralIntelligence-server



## Creating your own action client

Install this client helper

`npm install --save mikko/CentralIntelligence-client`



Implement the client service

```
const Client = require('ci-client');

const config = {
  name: 'My decent service',
  serverHost: 'localhost',
  serverPort: 3000,
  myHost: 'localhost',    // hostname for this client for receiving messages
  myPort: 3001,           // port for this client
  actions: {              // actions this client is offering
    randomJoke: {
      keywords: [         // which keywords found in user phrases are required for these actions to trigger
        {
          word: 'joke',
          type: 'noun'
        }
      ]
    },
    weather: {
      keywords: [
        {
          word: 'weather',  // User types a phrase including a term that is or relates to the noun weather
          type: 'noun' 
        }
      ],
      entities: [           // This action is interested in
        'locations',        // locations and
        'dates'             // dates found in user phrase
      ]
    }
  }
};

// Create the client with config
const client = new Client(config);

// Implement the logic for the actions in a single messageReceiver
const messageReceiver = (action, message, context, reply) => {
  if (action === 'weather') {
    const location = message.locations[0] || 'nowhere';
    
    // Messages can also contain metadata for other clients or later use
    // Context stuff is mostly not implemented yet
    const customContext = { 
      lastWeatherLocation: location
    };
    
    reply(`It sure is sunny in ${location}`, customContext);
  } else { // assuming randomJoke
    const originalMessage = message.originalMessage;    // actual user message available
    const tokenizedMessage = message.tokenizedMessage;  // as well as tokens in basic form
    reply('Knock knock');
  }
}

// Register the receiver
client.setReceiver(messageReceiver);


```

## Creating your own input client

Install this client helper

`npm install --save mikko/CentralIntelligence-client`


Implement the input client

```
const Client = require('ci-client');

const readline = require('readline'); // As an example we use command line for input

const config = {
    name: 'cli-input',
    serverHost: 'localhost',
    serverPort: 3000,
    myHost: 'localhost',
    myPort: 3002
};

const client = new Client(config);

const ask = () => {
    // Irrelevant example stuff
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    
    rl.question('What would you like to know? ', answer => {
        
        // Relevant part here
        const customContext = { messageSent: new Date().toISOString() };
        client.sendMessage(answer, customContext);     // Use the helper library to send messages
        
        rl.close();
        ask();
    });
};

setTimeout(() => ask(), 1000); // Timeout for avoiding the messy startup logging in console

// action not in use when received message is a reply to a message
const messageReceiver = (action, message, context, reply) => {
    console.log(message);
    if (context.messageSent !== undefined) { // You can use context for saving metadata
      console.log('This is an answer to previous message sent on', context.messageSent);
    }
};

// Register the receiver
client.setReceiver(messageReceiver);

```
