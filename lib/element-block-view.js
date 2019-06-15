'use babel';
import actions from './element-block.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default class ElementBlockView {
  input: null
  lastSavedState: null
  getInput() {
    return actions.elementBlockView.input.getElementsByClassName('lines')[0].innerText;
  }
  async cancel() {
    console.info('Cancelling');
    copy = actions.elementBlockView.lastSavedState.cloneNode(true);
    copy.firstChild.remove();
    actions.elementBlockView.element.prepend(copy);
    //actions.elementBlockView.input.replaceWith(copy);
    actions.elementBlockView.input.remove()
    actions.elementBlockView.input = copy;
    while (copy.firstChild == copy.lastChild) {
      await sleep(1); //to wait for both parts to load, so we can remove the broken part.
    }
    copy.lastChild.remove();
    //actions.toggle();
  }

  async save() {
    console.info('Saving');
    //actions.elementBlockView.lastSavedState.remove()
    actions.elementsToBlock = actions.elementBlockView.getInput();
    console.info(actions.elementsToBlock);
    actions.updateBlockAll();
    //actions.toggle();
  }

  constructor(serializedState) {
    console.log(serializedState);
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('element-block');

    this.input = document.createElement('atom-text-editor');
    this.input.class = "editor"
    this.input.tabindex = -1;
    this.input.name = "elementsToBlock";
    this.element.appendChild(this.input);
    this.lastSavedState = this.input.cloneNode(true);

    this.element.appendChild(document.createElement('br'))
    this.element.appendChild(document.createElement('br'))

    cancel = document.createElement('input');
    cancel.type = 'button';
    cancel.value = 'Cancel';
    this.element.appendChild(cancel);
    cancel.onclick = this.cancel;

    save = document.createElement('input');
    save.type = 'button';
    save.value = 'Save';
    save.onclick = this.save;
    this.element.appendChild(save);
  }

  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}

/*
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>
*/
