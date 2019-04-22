"use babel";

import ElementBlockView from "./element-block-view";
import { CompositeDisposable } from "atom";
import actions from "./element-block.js"

var observerArgs;
var observer;
var observerSetupSource = `
observerArgs = {
    childList: true
  , subtree: true
  , attributes: false
  , characterData: false
};
observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (!mutation.addedNodes) return
    var match = eval(elementsToBlock).split("\\n");
    var spacePattern = new RegExp("\\s", "g")
    for (var i = 0; i < mutation.addedNodes.length; ++i) {
      for (s in match) {
        if (match[i].replace(spacePattern, "").length) {
          if (mutation.addedNodes[i].matches(match[s])) {
            mutation.addedNodes[i].remove();
            breakOut = true;
            break;
          }
        }
      }
      if (!breakOut) {
        var doc = mutation.addedNodes[i];
        eval(
          "source=" + JSON.stringify(blockSource) +
          ";elementsToBlock=" + JSON.stringify(elementsToBlock) +
          blockSource
        )
      }
    }
  })
})
`.slice(1, -1);

export default {

  elementBlockView: null,
  modalPanel: null,
  subscriptions: null,
  elementsToBlock: "",

  documentsListening: [],

  blockSource: (`
;
console.log(doc);
function blockOnDocument(docTarget, selector) {
  var selector = docTarget.querySelectorAll(selector);
  console.log("searching in");
  console.log(selector);
  for (var x = --selector.length; x + 1; --x)
  {
    console.log("removing element");
    console.log(x);
    selector[x].remove();
  }
}

match = elementsToBlock.split("\\n");
iframes = doc.querySelectorAll("iframe");
webviews = doc.querySelectorAll("webview");
spacePattern = new RegExp("\\s", "g")
for (i in match) {
  if (match[i].replace(spacePattern, "").length) {
    console.log("trying to block " + match[i]);
    //for (var ifs = 0; ifs < iframes.length; ++ifs) {
    //  blockOnDocument(iframes[ifs].contentWindow.doc, match[i]);
    //}

    //for (var wvs = 0; wvs < webviews.length; ++wvs) {
    //  console.info("injecting into webview");
    //  var inject = "javascript:source=" + JSON.stringify(source) + ";elementsToBlock=" + JSON.stringify(elementsToBlock) + source;
    //  console.log(inject);
    //  webviews[wvs].loadURL(inject);
    //}

    blockOnDocument(doc, match[i]);
  }
}
`.slice(1, -1)),

  connectDocument(doc) {
    var source =
    "var blockSource=" + JSON.stringify(actions.blockSource) +
    ";var observerSetupSource=" + JSON.stringify(observerSetupSource) +
    ";var updateBlockSource=" + JSON.stringify(actions.updateBlockSource) +
    ";var elementsToBlock=\"actions.elementsToBlock\";" +
    actions.connectDocumentSource;
    console.info(source);
    eval(
      source
    );
  },

  connectDocumentSource: `;
switch (doc.tagName) {
  case "WEBVIEW" : {
    doc.loadURL(\`javascript:(function() {
var t = document.createElement("textarea");
t.style = "display:none";
t.value= \` + JSON.stringify(elementsToBlock) + \`;
t.id= "communicationBlockUsingElementBlock";
document.body.appendChild(t);

eval(
  "var blockSource = \\\` + JSON.stringify(actions.blockSource) +
  \\\`;var elementsToBlock ="t.value";\\\` +
  observerSetupSource + \\\`
);

eval(
  "var elementsToBlock= " + t.value +
  \\\` + JSON.stringify(actions.blockSource)
);

    })()\`)
    break;
  }
  case "IFRAME" : {
    doc = doc.contentWindow.doc;
    //intentionally passed to default
  }
  default: {
    eval(observerSetupSource);
    observer.observe(doc, observerArgs);
    console.log(doc);
    eval(updateBlockSource);
  }
}
  `,

  updateBlock(doc) {
    eval(
      "blockSource=" + JSON.stringify(actions.blockSource) +
      ";elementsToBlock=" + JSON.stringify(actions.elementsToBlock) +
      actions.updateBlockSource
    );
  },

  updateBlockSource: `;
switch (doc.tagName) {
  case "WEBVIEW": {
    var inject = \`javascript:(function() {document.querySelector(".communicationBlockUsingElementBlock").value = JSON.stringify(elementsToBlock)})()\`;
    console.log(inject);
    doc.loadURL(inject);
    break;
  }
  default: {
    var source = "source=" + JSON.stringify(blockSource) + ";elementsToBlock=" + JSON.stringify(elementsToBlock) + blockSource;
    //console.info(source);
    eval(source);
  }
}
  `,

  updateBlockAll() {
    eval(actions.updateBlockAllSource);
  },

  updateBlockAllSource: `
for (var i = 0; i < actions.documentsListening.length; ++i) {
  actions.updateBlock()
}
  `,

  activate(state) {
    console.info(state);
    actions.elementBlockView = new ElementBlockView(state.elementBlockViewState);
    actions.modalPanel = atom.workspace.addModalPanel({
      item: actions.elementBlockView.getElement(),
      visible: false
    });

    // Events subscribed to in atom"s system can be easily cleaned up with a CompositeDisposable
    actions.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    actions.subscriptions.add(atom.commands.add("atom-workspace", {
      "element-block:toggle": () => actions.toggle()
    }));
    actions.block();
  },

  deactivate() {
    actions.modalPanel.destroy();
    actions.subscriptions.dispose();
    actions.elementBlockView.destroy();
  },

  serialize() {
    return {
      elementBlockViewState: actions.elementBlockView.element
    };
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
actions.connectDocument(document);
