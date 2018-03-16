const placeholder = Symbol('placeholder');

export default placeholder;

function isPlaceHolder(node) {
    return placeholder === node;
}

export {
    isPlaceHolder
};
