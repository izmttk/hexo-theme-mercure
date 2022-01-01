import foo from './foo';
import answer from 'the-answer';
import './style.css';
import '../style/style.css';

import App from './Main.svelte';
console.log("test");
const app = new App({
    target: document.body,
    props: {
        // we'll learn about props later  
        answer: 42
    }
});
foo();
console.log(answer);
export {
    app
};