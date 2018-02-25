import {isProp, default as Prop} from './prop';
import {isObject, isNumber, isBoolean, isString} from '../utils/type';
import {toString} from '../utils/string';

export default class PropList {
    constructor(props) {
        if(isPropList(props)) {
            return Object.create(props);
        }
        if(!isObject(props)) {
            throw 'Not an Object';
        }
        this.originalProps = props;
        this.props = Object.entries(props)
            .map(([name, value]) => {
                return new Prop(name, value);
            });
    }
    get events() {
        return this.props.filter(function(prop) {
            return prop.isEvent;
        });
    }
    toString() {
        return this.props
            .filter(prop => !prop.isEvent && (isString(prop.value) || isNumber(prop.value) || isBoolean(prop.value)))
            .map(prop => `${prop.name}="${prop.value}"`)
            .join(' ');
    }
};

function isPropList(props) {
    return props instanceof PropList;
}
