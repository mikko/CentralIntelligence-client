let config = {};

const setConfig = cfg => config = cfg;

const getUser = ctx => {
    if (ctx && ctx._user && ctx._user.user) {
        return ctx._user.user;
    }
};

const updateContext = (user, isPrivate, isReply, customContext, actionName) => {
    console.log('updateContext', user, isPrivate, customContext);
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

    if (isReply === true) {
        delete initialContext._origin; // If replying, do not reset origin
        initialContext._actionClient = config.name;
        initialContext._actionName = actionName;
        Object.assign(initialContext, { _reply: isReply });
    }

    if (user !== undefined) {
        Object.assign(initialContext, { _user: { client: config.name, user }});
    }

    if (isPrivate === true) {
        console.log('Assigning object');
        Object.assign(initialContext, { _private: true });
    }

    return Object.assign({}, customContext, initialContext);
};

module.exports = {
    setConfig,
    updateContext,
    getUser
};
