let config = {};

const setConfig = cfg => config = cfg;

const getUser = ctx => {
    if (ctx && ctx._user && ctx._user.user) {
        return ctx._user.user;
    }
};

const createContext = (customContext) => {
    customContext = customContext || {};
    Object.keys(customContext).forEach(key => {
        if (key[0] === '_') {
            console.log('Context keys starting with underscore are for internal use only');
        }
    });

    let initialContext = {
        _origin: config.name,
        _private: false
    };

    return Object.assign({}, customContext, initialContext);
};

const setUserData = (user, props, context) => {
    if (user !== undefined) {
        Object.assign(context, { _user: { client: config.name, user, properties: props }});
    }
    return context;
};

const setPrivate = (isPrivate, context) => {
    if (isPrivate === true) {
        Object.assign(context, { _private: true });
    }
    return context;
};

const setReply = (isReply, actionName, context) => {
    if (isReply === true) {
        delete context._origin; // If replying, do not reset origin
        context._actionClient = config.name;
        context._actionName = actionName;
        Object.assign(context, { _reply: isReply });
    }
    return context;
};

module.exports = {
    setConfig,
    createContext,
    getUser,
    setUserData,
    setPrivate,
    setReply
};
