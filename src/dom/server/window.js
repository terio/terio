const WINDOW = {

};
function setJSWindow(win) {
    global.window = win || WINDOW;
}
function unsetJSWindow() {
    global.window = undefined;
}
export default WINDOW;
export {
    setJSWindow,
    unsetJSWindow
}
