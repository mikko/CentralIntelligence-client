const request = require('request');

const serverRequest = (host, port, path, body) => {
    const uri = `http://${host}:${port}/${path}`;
    // console.log('Client POSTing to', uri);
    // console.log(JSON.stringify(body));
    request.post({
        uri,
        body: JSON.stringify(body)
    },
    function (err, res, body) {
        if (err || res === undefined || res.statusCode !== 200) {
            console.log('Error connecting to Central Intelligence', err);
            if (res !== undefined) {
                console.log(res.statusCode);
                console.log('Response body:', body);
            }
        }
        else {
            console.log('Probably ok');
        }
    });
};

const open = function(config) {
    console.log('Connecting to Central Intelligence in', config.serverHost, config.serverPort);
    const payload = {
        name: config.name,
        actions: config.actions,
        commands: config.commands,
        host: config.myHost,
        authKey: config.authKey,
        port: config.proxyPort || config.myPort,
        trustedUserGroups: config.trustedUserGroups
    };

    if (payload.trustedUserGroups === undefined) {
        throw new Error('Trusted user groups not configured for client');
    }

    serverRequest(config.serverHost, config.serverPort, 'register', payload);
};

const pong = function(request, reply) {
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

const sendCommand = function(config, message, params, context) {
    console.log('Sending command', message, params);
    const payload = {
        command: message,
        context: context || {}
    };


    if (typeof params === 'string') {
        payload.parameters = params;
    } else {
        payload.JSONPayload = params;
    }

    serverRequest(config.serverHost, config.serverPort, 'command', payload);
};


const replyMessage = function(config, message, context) {
    console.log('Replying message', message);
    const payload = {
        message: message,
        context: context || {}
    };
    serverRequest(config.serverHost, config.serverPort, 'reply', payload);
};

module.exports = {
    open,
    pong,
    sendMessage,
    sendCommand,
    replyMessage
};
