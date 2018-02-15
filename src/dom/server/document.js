const DOCUMENT = {

};
function setJSDOM(dom) {
    global.document = dom || DOCUMENT;
}
function unsetJSDOM() {
    global.document = undefined;
}
export default DOCUMENT;
export {
    setJSDOM,
    unsetJSDOM
}
