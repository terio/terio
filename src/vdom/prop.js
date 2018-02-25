import EVENTS from '../constants/events';
import {isArray} from '../utils/type';

export default class Prop {
    constructor(name, value) {
        let isEvent;
        if(name === 'style') {
            value = Object.entries(value).map(entry => entry.join(':')).join(';');
        } else if(name === 'class' && isArray(value)) {
            value = value.join(' ');
        }
        if(name.startsWith('on') && EVENTS.has(name.substr(2))) {
            isEvent = true;
            name = name.substr(2);
        }
        Object.assign(this, {
            name,
            isEvent: false,
            value
        });
    }
}
function isProp(prop) {
    return prop instanceof Prop;
}
export {
    isProp
};
