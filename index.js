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
                    this.receiveMessage(request.payload.message, request.payload.context);
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

    this.receiveMessage = msg => console.log('No handler specified but message received', msg);

    this.setReceiver = receiver => this.receiveMessage = receiver;
};
