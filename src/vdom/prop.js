import EVENTS from '../constants/events';
import {isArray} from '../utils/type';
import {toString} from '../utils/string';
import {isHTMLAttr, isSVGAttr, isCustomAttr} from '../utils/attr';

export default class Prop {
    constructor(name, value) {
        let isEvent = false, isCustomProp = false;
        if(name.startsWith('on') && EVENTS.has(name.substr(2))) {
            isEvent = true;
            name = name.substr(2);
        } else if(isCustomAttr(name)) {
            isCustomProp = true;
        } else {
            if(name === 'style') {
                value = Object.entries(value).map(entry => entry.join(':')).join(';');
            } else if(name === 'class' && isArray(value)) {
                value = value.join(' ');
            } else {
                value = toString(value);
            }
        }
        Object.assign(this, {
            name,
            value,
            isEvent,
            isCustomProp
        });
    }
}
function isProp(prop) {
    return prop instanceof Prop;
}
export {
    isProp
};
