const request = require('request');

const serverRequest = (host, port, path, body) => {
    const uri = `http://${host}:${port}/${path}`;
    request.post({
        uri,
        body: JSON.stringify(body)
    },
    function (err, res, body) {
        console.log(res.statusCode);
        if (err || res.statusCode !== 200) {
            console.log('Error connecting to Central Intelligence', err, res.statusCode);
        }
    });
};

const open = function(config) {
    console.log('Connecting to Central Intelligence');
    const payload = {
        name: config.name,
        actions: config.actions,
        host: config.myHost,
        port: config.myPort
    };
    serverRequest(config.serverHost, config.serverPort, 'register', payload);
};

const pong = function(request, reply) {
    console.log("Got a ping from Central Intelligence");
    reply({ alive: true });
};

const sendMessage = function(config, message, context) {
    console.log('Sending message', message);
    const payload = {
        message: message,
        context: context || {}
    };
    serverRequest(config.serverHost, config.serverPort, 'message', payload);
};

module.exports = {
    open,
    pong,
    sendMessage
};
