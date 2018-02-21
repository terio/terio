import {isString, isFunction, getType, areDifferentTypes} from '../../utils/type';
import {toLowerCase} from '../../utils/string';
import {getNativeProp} from '../shared/props';
import {LOKI_ROOT} from '../../constants/attr';
import {create as createVirtualNode} from '../../vdom/node';
import componentCache from '../../cache/component';

function isChanged(newNode, oldNode) {
    if(areDifferentTypes(newNode, oldNode)) {
        return true;
    }
    if(isString(newNode) && newNode !== oldNode) {
        return true;
    }
    if(newNode.type !== oldNode.type) {
        return true;
    }
    const newProps = Object.entries(newNode.props);
    const oldProps = Object.entries(oldNode.props);
    if(newProps.length !== oldProps.length) {
        return true;
    }
    for(let i = 0; i < newProps.length; i++) {
        for(let j = 0; j < 2; j++) {
            if(newProps[i][j] !== oldProps[i][j]) {
                return true;
            }
        }
    }
    return false;
}
function create($parent, parent, idx, hydrate = false, isRoot = false) {
    let $node = $parent.childNodes[idx];
    let node = parent.children[idx];
    if(isString(node)) {
        if(!hydrate) {
            return document.createTextNode(node);
        }
        if(getType($node) !== 'Text' || node !== $node.textContent) {
            throw 'Hydration went wrong or parent is not empty!';
        }
        return $node;
    }
    if(isFunction(node.type)) {
        const component = new node.type(node.props, node.children, function rerender() {
            parent.children[idx] = <div {...node.props}>{component.render()}</div>;
            parent.children[idx].$$component = component;
            update($parent, parent, parent.children[idx], node, idx);
        });
        parent.children[idx] = node = <div {...node.props}>{component.render()}</div>;
        node.$$component = component;
        return create($parent, parent, idx, hydrate, isRoot);
    }
    if(hydrate && (!$node || node.type !== toLowerCase($node.tagName))) {
        throw 'Hydration went wrong or parent is not empty!';
    }
    const nodeProps = Object.entries(node.props)
        .map(([name, value]) => getNativeProp(name, value));
    if(hydrate) {
        const existingProps = $node.getAttributeNames().reduce((pv, attr) => {
            pv[attr] = $node.getAttribute(attr);
            return pv;
        }, {});
        nodeProps.forEach((prop) => {
            if(prop.isEvent || !isString(prop.value)) {
                return;
            }
            if(!existingProps[prop.name]) {
                throw 'Hydration went wrong or parent is not empty!';
            }
        });
    }
    if(!hydrate) {
        const el = document.createElement(node.type);
        nodeProps.forEach((prop) => {
            if(!prop.isEvent) {
                if(isString(prop.value)) {
                    el.setAttribute(prop.name, prop.value);
                }
                return;
            }
            el.addEventListener(prop.name, prop.value);
        });
        if(isRoot) {
            el.setAttribute(LOKI_ROOT, '');
        }
        node.children
            .map((child, _idx) => create(el, node, _idx))
            .forEach(el.appendChild.bind(el));
        return el;
    }
    nodeProps.forEach((prop) => {
        if(!prop.isEvent) {
            return;
        }
        $node.addEventListener(prop.name, prop.value);
    });
    node.children
        .forEach((child, _idx) => {
            if(!$node.childNodes[_idx]) {
                throw 'Hydration went wrong or parent is not empty!';
            }
            return create($node, node, _idx, hydrate);
        });
    return $node;
}

function update($parent, parent, newNode, oldNode, idx = 0) {
    if(!oldNode) {
        console.log('mutation 1')
        return $parent.appendChild(create($parent, parent, idx));
    }
    if(!newNode) {
        console.log('mutation 2')
        return $parent.removeChild($parent.childNodes[idx]);
    }
    if(isChanged(newNode, oldNode)) {
        console.log('mutation 3', newNode, oldNode)
        return $parent.replaceChild(create($parent, parent, idx), $parent.childNodes[idx]);;
    }
    if(!isString(newNode)) {
        for(let i = 0; i < oldNode.children.length; i++) {
            update($parent.childNodes[idx], parent.children[idx], newNode.children[i], oldNode.children[i], i);
        }
    }
}

export {
    create
};
