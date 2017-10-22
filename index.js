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
                        const userProperties = this.getUserProperties(customContext);

                        const isPrivate = this.isPrivate(originalContext._private);

                        const newContext = Context.createContext(customContext);
                        Context.setUserData(user, userProperties, newContext);
                        Context.setPrivate(isPrivate);
                        Context.setReply(true, actionName, newContext);
                        Connection.replyMessage(clientConfig, msg, newContext);
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

                    const paramsString = request.payload.parameters;
                    const paramsJSON = request.payload.JSONpayload;

                    let params;

                    if (paramsString !== undefined && paramsString !== '') {
                        params = paramsString;
                    } else if (paramsJSON !== undefined) {
                        params = paramsJSON;
                    }

                    const replyMessage = (msg, customContext) => {
                        const fullContext = Object.assign({
                            reply: true
                        }, customContext || {}, originalContext);
                        Connection.replyMessage(clientConfig, msg, fullContext);
                    };
                    this.receiveCommand(request.payload.command, params, originalContext, replyMessage);
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
        const userProperties = this.getUserProperties(customContext);
        const isPrivate = this.isPrivate(customContext);

        const newContext = Context.createContext(customContext);
        Context.setUserData(userHash, userProperties, newContext);
        Context.setPrivate(isPrivate, newContext);
        Connection.sendMessage(clientConfig, msg, newContext);
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
    this.getUserProperties = context => () => ({});

    this.setReceiver = receiver => this.receiveMessage = receiver;
    this.setCommandHandler = handler => this.receiveCommand = handler;
    this.setUserParser = parser => this.getUser = parser;
    this.setUserPropertiesParser = parser => this.getUserProperties = parser;
    this.setPrivateChatParser = isPrivate => this.isPrivate = isPrivate;

    this.stop = () => {
        console.log('Closing client server');
        return server.stop().then(() => console.log('Client server closed'));
    };
};
