const Hapi = require('hapi');
const Connection = require('./lib/connection');
const Context = require('./lib/contextUtil');

module.exports = function(clientConfig, actions) {

    const port = clientConfig.myPort;

    let serverOptions = {};

    const server = new Hapi.Server(serverOptions);

    Context.setConfig(clientConfig);

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
                    const originalContext = request.payload.context;
                    const actionName = request.payload.action;

                    const replyMessage = (msg, customContext) => {
                        customContext = customContext || originalContext;
                        const user = this.getUser(Context.getUser(originalContext));
                        const isPrivate = this.isPrivate(originalContext._private);

                        const fullContext = Context.updateContext(user, isPrivate, true, customContext, actionName);

                        Connection.replyMessage(clientConfig, msg, fullContext);
                    };

                    const prompt = (question, key, options) => {
                        const context = Object.assign({}, originalContext, {
                            _question: {
                                key,
                                options,
                                answered: false
                            }
                        });
                        replyMessage(question, context);
                    };

                    this.receiveMessage(actionName, request.payload.message, originalContext, replyMessage, prompt);

                    reply('Message received');
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
                    reply('Command received');
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
        const userHash = this.getUser(customContext);
        const isPrivate = this.isPrivate(customContext);
        const fullContext = Context.updateContext(userHash, isPrivate, false, customContext);
        Connection.sendMessage(clientConfig, msg, fullContext);
    };

    this.sendCommand = (cmd, params, customContext) => {
        const fullContext = Object.assign({
            _origin: clientConfig.name
        }, customContext);
        Connection.sendCommand(clientConfig, cmd, params, fullContext);
    };

    this.receiveMessage = msg => console.log('No handler specified but message received', msg);

    this.receiveCommand = cmd => console.log('No handler specified but command received', cmd);

    this.getUser = context => console.log('User hash parser missing. Not able to keep user sessions. ' +
        'Call setUserParser');
    this.isPrivate = context => console.log('Public check not implemented in this client. ' +
        'Assuming all messages public. Please call setPrivateChatParser');

    this.setReceiver = receiver => this.receiveMessage = receiver;
    this.setCommandHandler = handler => this.receiveCommand = handler;
    this.setUserParser = parser => this.getUser = parser;
    this.setPrivateChatParser = isPrivate => this.isPrivate = isPrivate;
};
