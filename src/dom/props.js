import EVENTS from './events';

function getNativeProp(name, value) {
    if(name.startsWith('on') && EVENTS.has(name.substr(2))) {
        return {
            name: name.substr(2),
            isEvent: true,
            value
        };
    }
    if(name === 'style') {
        value = Object.entries(value).map(entry => entry.join(':')).join(';');
    }
    return {
        name,
        isEvent: false,
        value
    };
}

export {
    getNativeProp
};
