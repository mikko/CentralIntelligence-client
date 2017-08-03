const Hapi = require('hapi');
const Connection = require('./lib/connection');

module.exports = function(clientConfig, actions) {

    const port = clientConfig.myPort;

    let serverOptions = {};

    const server = new Hapi.Server(serverOptions);

    const routes = [
        {
            method: 'GET',
            path: `/ping`,
            config: {
                handler: Connection.pong
            }
        },
        {
            method: 'POST',
            path: `/message`,
            config: {
                handler: (request, reply) => {
                    console.log(request.payload);
                    const originalContext = request.payload.context;
                    const replyMessage = (msg, customContext) => {
                        const fullContext = Object.assign({
                            reply: true
                        }, customContext || {}, originalContext);
                        Connection.replyMessage(clientConfig, msg, fullContext);
                    };
                    this.receiveMessage(request.payload.action, request.payload.message, originalContext, replyMessage);
                }
            }
        },
        {
            method: 'POST',
            path: `/command`,
            config: {
                handler: (request, reply) => {
                    console.log(request.payload);
                    const originalContext = request.payload.context;
                    const replyMessage = (msg, customContext) => {
                        const fullContext = Object.assign({
                            reply: true
                        }, customContext || {}, originalContext);
                        Connection.replyMessage(clientConfig, msg, fullContext);
                    };
                    this.receiveCommand(request.payload.command, request.payload.parameters, originalContext, replyMessage);
                }
            }
        }
    ];

    server.connection({
        port
    });

    routes.forEach(route => {
        server.route(route);
    });

    server.start(err => {
        if (err) {
            throw err;
        }
        console.log('Server running', server.info.uri);

        Connection.open(clientConfig, actions);
    });

    this.sendMessage = (msg, customContext) => {
        const fullContext = Object.assign({
            origin: clientConfig.name
        }, customContext);
        Connection.sendMessage(clientConfig, msg, fullContext);
    };

    this.sendCommand = (cmd, params, customContext) => {
        const fullContext = Object.assign({
            origin: clientConfig.name
        }, customContext);
        Connection.sendCommand(clientConfig, cmd, params, fullContext);
    };

    this.receiveMessage = msg => console.log('No handler specified but message received', msg);

    this.receiveCommand = cmd => console.log('No handler specified but command received', cmd);

    this.setReceiver = receiver => this.receiveMessage = receiver;
    this.setCommandHandler = handler => this.receiveCommand = handler;
};
