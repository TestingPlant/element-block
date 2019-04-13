'use babel';

import ElementBlockView from './element-block-view';
import { CompositeDisposable } from 'atom';
import actions from './element-block.js'

export default {

  elementBlockView: null,
  modalPanel: null,
  subscriptions: null,
  elementsToBlock: '',

  activate(state) {
    console.info(state);
    actions.elementBlockView = new ElementBlockView(state.elementBlockViewState);
    actions.modalPanel = atom.workspace.addModalPanel({
      item: actions.elementBlockView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    actions.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    actions.subscriptions.add(atom.commands.add('atom-workspace', {
      'element-block:toggle': () => actions.toggle()
    }));
  },

  deactivate() {
    actions.modalPanel.destroy();
    actions.subscriptions.dispose();
    actions.elementBlockView.destroy();
  },

  serialize() {
    return 'you got searialized';
    //return {
    //  elementBlockViewState: actions.elementBlockView.serialize()
    //};
  },

  toggle() {
    //if (!actions.modalPane.isVisible()) {
    //  actions.modalPanel.show();
    //} else {
    //    actions.elementsToBlock = actions.elementBlockView.ElementsToBlock.value;
    //}
    return (
      actions.modalPanel.isVisible() ?
      actions.modalPanel.hide() :
      actions.modalPanel.show()
    );
  }

};
