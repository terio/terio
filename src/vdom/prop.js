import EVENTS from '../constants/events';
import {isArray} from '../utils/type';
import {toString} from '../utils/string';
import {isCustomAttr} from '../utils/attr';

export default class Prop {
    constructor(name, value) {
        const prop = {
            name,
            value,
            isEvent: false,
            isCustomProp: false
        };
        if(name.startsWith('on') && EVENTS.has(name.substr(2))) {
            prop.isEvent = true;
            prop.name = name.substr(2);
        } else if(isCustomAttr(name)) {
            prop.isCustomProp = true;
        } else {
            if(name === 'style') {
                prop.value = Object.entries(value).map(entry => entry.join(':')).join(';');
            } else if(name === 'class' && isArray(value)) {
                prop.value = value.join(' ');
            } else {
                prop.value = toString(value);
            }
        }
        Object.assign(this, prop);
    }
    toString() {
        return toString(this.value);
    }
}
function isProp(prop) {
    return prop instanceof Prop;
}
export {
    isProp
};
