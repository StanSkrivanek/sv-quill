# TODO

- The part where you check the current value and the default value is a bit hard to read, it can be simplified with the use of a deep merge lib (defaults is a good example of a sure lib, but there are many others that can do the same)

- For the part of reading/saving data from/to local storage there are some lib that can do it for you (like @macfja/svelte-persistent-store (I'm the author of this one, but many others lib do the same) but they use Svelte Store instead of runes

- ~~defaultToolState don't need to be a state as its value don't change, so it don't need to be reactive (and tracked be the compile/runtime)~~

- ~~the $effect can be replaced by a **onMount** that only run in the browser. $effect is triggered every time a runes (used inside the $effect) is change, but by looking to you code, you only want to run it on init, so **onMount** lifecycle event should be better and will avoid unwanted side effect~~

- ~~I don't really get the difference between toolbarTools (which is a $derived) and the function generateToolbarOptions: they seem to produce the same result~~

- ~~Instead of a setTimeout(..., 0) maybe you can use **tick** to delay the action just after the DOM update (if it's what you need)~~

- for the showPopup function, instead of creating the DOM on the fly with the DOM API, I personally prefer to have the HTML wrapped inside a {#if} block and manage the display of the dialog with a variable (it also offers the ability to use transition: to show/hide the modal)

- Maybe the setup of the Quill could be done with an action instead of playing with the innerHTML DOM API 🤔
