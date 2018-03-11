import {isProp, default as Prop} from './prop';
import {isObject, isDefined, isArray} from '../utils/type';
import {toString} from '../utils/string';

export default class PropList {
    constructor(props) {
        if(isPropList(props)) {
            return new PropList(props.toArray());
        }
        props = props || {};
        if(!isObject(props)) {
            throw 'Not an Object';
        }
        if(isArray(props)) {
            if(isDefined(props[0]) && !isProp(props[0])) {
                throw 'Invalid arguments passed';
            }
            this.$$props = props.slice();
            return this;
        }
        this.originalProps = props;
    }
    add(prop) {
        this.$$props = this.toArray();
        this.$$props.push(prop);

        //need to reset cache
        delete this.$$map;
        delete this.$$string;
        delete this.$$events;
        delete this.$$nativeProps;
        return this;
    }
    get events() {
        return this.$$events = this.$$events || this.toArray().filter(function(prop) {
            return prop.isEvent;
        });
    }
    get textProps() {
        return this.$$nativeProps = this.$$nativeProps || this.toArray().filter(function(prop) {
            return !prop.isEvent && !prop.isCustomProp;
        });
    }
    toString() {
        return this.$$string = this.$$string || this.textProps
            .map(prop => `${prop.name}="${toString(prop.value)}"`)
            .join(' ');
    }
    toMap() {
        return this.$$map = this.$$map || this.toArray().reduce((pv, cv) => {
            pv[cv.name] = cv;
            return pv;
        }, {});
    }
    has(name) {
        return this.toMap().hasOwnProperty(name);
    }
    get(name) {
        return this.toArray().find((prop) => prop.name === name);
    }
    toArray() {
        return this.$$props = this.$$props || Object.entries(this.originalProps)
            .map(([name, value]) => {
                return new Prop(name, value);
            });
    }
    size() {
        return this.$$props.length;
    }
    clone() {
        return new PropList(this.toArray());
    }
}

function isPropList(props) {
    return props instanceof PropList;
}
