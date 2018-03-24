import {isString, getType} from '../../utils/type';
import {defer} from '../../utils/function';
import {toLowerCase} from '../../utils/string';
import {create as createVirtualNode, default as VNode} from '../../vdom/node';
import {isComponent} from '../../classes/component';
import {TERIO_ROOT} from '../../constants/attr';
import PropList from '../../vdom/prop-list';
import {isPlaceHolder} from '../../vdom/placeholder';

function setTextProps($node, attrs) {
    attrs.forEach((prop) => {
        $node.setAttribute(prop.name, prop.value);
    });
}
function removeTextProps($node, attrs) {
    attrs.forEach((prop) => {
        $node.removeAttribute(prop.name);
    });
}
function setEventListenerProps($node, listeners) {
    listeners.forEach((prop) => {
        $node.addEventListener(prop.name, prop.value);
    });
}
function removeEventListenerProps($node, listeners) {
    listeners.forEach((prop) => {
        $node.removeEventListener(prop.name, prop.value);
    });
}
function setProps($node, props) {
    setTextProps($node, props.textProps);
    setEventListenerProps($node, props.events);
}
function removeProps($node, props) {
    removeTextProps($node, props.textProps);
    removeEventListenerProps($node, props.events);
}

function patch($parent, parent, newNode, oldNode, idx = 0) {
    const $node = $parent.childNodes[VNode.getNonEmptyNodesBeforeIdx(parent.children, idx).length];

    const diff = VNode.diff(newNode, oldNode);

    const patchSummary = {
        isNodeObsolete: true
    };
    if(!diff.SECOND_NODE_EXISTS && !diff.FIRST_NODE_EXISTS) {
        return patchSummary;
    }
    if(!diff.SECOND_NODE_EXISTS) {
        const $newNode = create(newNode);
        $parent.insertBefore($newNode, $node || null);

        doPostAttachTasks($newNode, newNode, idx);

        return patchSummary;
    }
    if(!diff.FIRST_NODE_EXISTS) {
        unmount($node, oldNode, idx);

        return patchSummary;
    }
    if(diff.ARE_DIFFERENT_TYPES || diff.ARE_DIFFERENT_TEXTS) {
        doPreDetachTasks($node, oldNode, idx);

        const $newNode = create(newNode);
        $parent.replaceChild($newNode, $node);

        doPostAttachTasks($newNode, newNode, idx);

        return patchSummary;
    }

    setProps($node, diff.ADDED_PROPS);
    removeProps($node, diff.REMOVED_PROPS);
    setProps($node, diff.UPDATED_PROPS);

    patchSummary.isNodeObsolete = false;

    return patchSummary;
}
function doPostAttachTasks($node, node, idx = 0) {
    if(isString(node)) {
        return;
    }
    if(isComponent(node.component)) {
        const component = node.component;
        component.onStateChange = function(done) {
            const renderedComponent = component.render().inflate(`${node.id}.0`);
            update($node, node, renderedComponent, node.children[0], 0);
            node.children = [renderedComponent];
            defer(done);
        };
        component.mounted();
    }
    VNode.getNonEmptyNodesBeforeIdx(node.children, node.children.length)
        .forEach((childNode, idx) => doPostAttachTasks($node.childNodes[idx], childNode, idx));
}
function doPreDetachTasks($node, node) {
    if(isString(node)) {
        return;
    }
    if(isComponent(node.component)) {
        const component = node.component;
        component.willUnmount();
        delete component.onStateChange;
    }
    VNode.getNonEmptyNodesBeforeIdx(node.children, node.children.length)
        .forEach((childNode, idx) => doPreDetachTasks($node.childNodes[idx], childNode, idx));
}
function hydrate($node, node) {
    if(isString(node)) {
        if(getType($node) !== 'Text' || node !== $node.textContent) {
            throw 'Hydration went wrong or parent is not empty!';
        }
        return $node;
    }
    if(!$node || node.type !== toLowerCase($node.tagName)) {
        throw 'Hydration went wrong or parent is not empty!';
    }
    const existingProps = $node.getAttributeNames().reduce((pv, attr) => {
        pv[attr] = $node.getAttribute(attr);
        return pv;
    }, {});
    node.props.textProps.forEach((prop) => {
        if(prop.name === TERIO_ROOT) {
            setTextProps($node, [node.props.get(TERIO_ROOT)]);
            return;
        }
        if(!existingProps[prop.name] || existingProps[prop.name] !== prop.value) {
            throw 'Hydration went wrong or parent is not empty!';
        }
    });
    setEventListenerProps($node, node.props.events);
    VNode.getNonEmptyNodesBeforeIdx(node.children, node.children.length)
        .forEach((child, idx) => {
            if(!$node.childNodes[idx]) {
                throw 'Hydration went wrong or parent is not empty!';
            }
            return hydrate($node.childNodes[idx], child);
        });
    return $node;
}
function create(node) {
    if(isString(node)) {
        return document.createTextNode(node);
    }
    const $node = document.createElement(node.type);
    setProps($node, node.props);
    VNode.getNonEmptyNodesBeforeIdx(node.children, node.children.length)
        .map(child => create(child))
        .forEach($node.appendChild.bind($node));
    return $node;
}

function update($parent, parent, newNode, oldNode, idx = 0) {
    const $node = $parent.childNodes[VNode.getNonEmptyNodesBeforeIdx(parent.children, idx).length];

    const patchSummary = patch($parent, parent, newNode, oldNode, idx);
    if(patchSummary.isNodeObsolete) {
        return;
    }

    if(!isString(newNode)) {
        const len = Math.max(oldNode.children.length, newNode.children.length);
        for(let i = 0; i < len; i++) {
            update($node, oldNode, newNode.children[i], oldNode.children[i], i);
            if(i < newNode.children.length) {
                oldNode.children[i] = newNode.children[i];
            }
        }
    }
}
function unmount($node, node, idx) {
    doPreDetachTasks($node, node, idx);
    $node.parentNode.removeChild($node);
}
function mount($parent, node, shouldHydrate = false) {
    let $node = $parent.firstChild;
    if(shouldHydrate) {
        hydrate($node, node);
    } else {
        $node = $parent.appendChild(create(node));
    }
    doPostAttachTasks($node, node);
    return {
        node,
        $node
    };
}
export {
    mount,
    unmount
};
