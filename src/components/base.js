import {createElement} from '../vdom/element'
import componentStore from '../store/component'

export default class Component {
    constructor() {
        console.log(this)
    }
    render() {
        return <div></div>;
    }
}
