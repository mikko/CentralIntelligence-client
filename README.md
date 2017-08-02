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

TODO
