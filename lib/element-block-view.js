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
    actions.elementBlockView.element.appendChild(actions.elementBlockView.lastSavedState)
    //actions.elementBlockView.lastSavedState.remove()
    actions.elementBlockView.lastSavedState = actions.elementBlockView.input.cloneNode(true);
    actions.elementsToBlock = actions.elementBlockView.getInput();
    console.info(actions.elementsToBlock);
    actions.block();
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
