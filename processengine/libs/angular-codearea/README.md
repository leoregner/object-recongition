Anguar Codearea
===============

Lightweight textarea syntax highlighting for Angular.
-----------------------------------------------------

The goal of this project is to provide a simple, light-weight (in terms of code
size) text area with live syntax highlighting to Angular applications. It works
by aligning a styled copy of the input text in a layer below a semi-transparent
text area. I can't take any credit for that clever idea, because I blatantly
ripped it off from [Colin Kuebler's LDT](http://kueblc.github.io/LDT/). I just
wrapped it up in a nice AngularJS directive. 

How to Use
----------

Include the `ivl.angular-codearea` module in the dependencies of your Angular
application. Then use the new directive as follows:

```html
<ivl-codearea ng-model="text" syntax="lua"></ivl-codearea>
```

The directive will expand to fill the parent element, so it should be wrapped
in a `<div>` or other element that is sized with CSS. The `rows` and `cols`
attributes of native text areas are not supported.

Syntax Highlighting
-------------------

So far my implementation only contains highlighting rules for Lua programs, but
it's easy to add rules for other languages. A rule set is a map of CSS class
names to regular expressions.

License
-------

Angular Codearea is open-sourced under the MIT license. See the file
[LICENSE](LICENSE) for the full license text.
