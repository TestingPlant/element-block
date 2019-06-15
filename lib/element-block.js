"use babel";
/*
Possibly buggy code:

RegExp pattern
([,+\(\[{=]\s*)elementsToBlock(\s*[,+\)\]}.=])
to find when the variable is accessed
It shouldn't be buggy by not including == or !=
since I never need to do that.
*/

import ElementBlockView from "./element-block-view";
import { CompositeDisposable } from "atom";

var actions = {};

actions.elementBlockView = null;
actions.modalPanel = null;
actions.subscriptions = null;
actions.elementsToBlock = "";

actions.documentsListening = [];

//requires connectDocumentSource, blockSource and elementsToBlock
actions.observerSetupSource = `
;var observerArgs = {
  childList: true
  , subtree: true
  , attributes: false
  , characterData: false
};
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (!mutation.addedNodes) return
    var match = elementsToBlock.split("\\n");
    var spacePattern = new RegExp("\\s", "g")
    for (var i = 0; i < mutation.addedNodes.length; ++i) {
      if (!mutation.addedNodes[i].querySelector) {
        continue;
      }
      switch (mutation.addedNodes[i].tagName) {
        case "WEBIEW":
        case "IFRAME": {
          console.log("treated as special element");
          alert("something special happened");
          var doc = mutation.addedNodes[i];
          eval(
            "elementsToBlock=" + JSON.stringify(elementsToBlock) +
            connectDocumentSource
          );
          break;
        }
        default: {
          var breakOut = false;
          for (s in match) {
            if (match[s].replace(spacePattern, "").length) {
              if (mutation.addedNodes[i].matches(match[s])) {
                mutation.addedNodes[i].remove();
                breakOut = true;
                break;
              }
            }
          }
          if (!breakOut) {
            var doc = mutation.addedNodes[i];
            eval(blockSource);
          }
        }
      }
    }
  })
})
`.slice(1, -1);

actions.blockSource = (`
  ;
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

  match = elementsToBlock.split("\\\\n");
  iframes = doc.querySelectorAll("iframe");
  webviews = doc.querySelectorAll("webview");
  spacePattern = new RegExp("\\\\s", "g")
  for (i in match) {
    if (match[i].replace(spacePattern, "").length) {
      console.log("trying to block " + match[i]);
      blockOnDocument(doc, match[i]);
    }
  }
`).slice(1, -1);

actions.connectDocument = function(doc) {
  var documentsListening = actions.documentsListening;
  documentsListening[documentsListening.length] = doc;
  var source =
  "var blockSource=" + JSON.stringify(actions.blockSource) +
  ";var connectDocumentSource=" + JSON.stringify(actions.connectDocumentSource) +
  actions.connectDocumentSource.replace(/([,+\(\[{=]\s*)elementsToBlock(\s*[,+\)\]}.=])/g, "$1actions.elementsToBlock$2");
  console.info("connectDocument " + source);
  eval(source);
};

actions.updateBlock = function(doc) {
  var source =
  "blockSource=" + JSON.stringify(actions.blockSource) +
  ";elementsToBlock=" + JSON.stringify(actions.elementsToBlock) +
  actions.updateBlockSource;
  console.info(source);
  eval(source);
};

actions.updateBlockSource = `;
console.info("updating", doc);
switch (doc.tagName) {
  case "WEBVIEW": {
    var inject = \`javascript:(function() {
      document.querySelector(".communicationBlockUsingElementBlock").value = elementsToBlock;
      var doc = document;
      ` + actions.blockSource + `;
    })()\`;
    console.log(inject);
    doc.loadURL(inject);
    break;
  }
  default: {
    console.log("updateBlock ", doc);
    ` + actions.blockSource + `;
  }
}
`;


actions.updateBlockAll = function() {
  console.info("updating block");
  for (i in actions.documentsListening) {
    console.info("applying updated block on ", actions.documentsListening[i])
    actions.updateBlock(actions.documentsListening[i])
  }
};
//requires elementsToBlock
actions.connectDocumentSource = `;
var documentsToConnect = [doc];
console.info("connecting" , doc);
for (documentNumber in documentsToConnect) {
  doc = documentsToConnect[documentNumber];
  console.info("subconnected", doc)
  switch (doc.tagName) {
    case "WEBVIEW" : {
      alert("doing life in webview");
      console.log("observer ", observerSetupSource);
      var observerSetupSource = ` + JSON.stringify(actions.observerSetupSource) + `;
      var connectDocumentSource = ` + JSON.stringify(actions.connectDocumentSource) + `;
      var blockSource = ` + JSON.stringify(actions.blockSource) + `;
      var updateBlockSource = ` + JSON.stringify(actions.updateBlockSource) + `;
      var source = \`javascript:(function() {
        alert("webview detected");
        var doc = document;
        var elementsToBlock = \` + JSON.stringify(elementsToBlock) + \`;
        var observerSetupSource = \` + JSON.stringify(observerSetupSource) + \`;
        var connectDocumentSource = \` + JSON.stringify(connectDocumentSource) + \`;
        var blockSource = \` + JSON.stringify(blockSource) + \`;
        var updateBlockSource = \` + JSON.stringify(updateBlockSource) + \`;
        var documentsListening = [];
        var t = document.createElement("textarea");
        t.style = "display:none";
        t.value = \` + JSON.stringify(elementsToBlock) + \`;
        t.id = "communicationBlockUsingElementBlock";
        document.body.appendChild(t);

        function block(doc) {
          \` + blockSource + \`;
        }
        function connnectDocument(doc) {
          \` + connectDocumentSource + \`;
        }
        function updateBlockAll(doc) {
          console.info("oh no! the block was updated");
          elementsToBlock = t.value;
          for (i in documentsListening) {
            var doc = documentsListening[i];
            ` + (actions.updateBlockSource).replace(/([,+\(\[{=]\s*)elementsToBlock(\s*[,+\)\]}.=])/g, "$1t.value$2").replace(/`/g, "\\`") + `;
          }
        }
        block(document);
        connectDocument(document);

        alert("webview connected");
      })()\`.replace(/actions\\.elementsToBlock/g, "elementsToBlock");
      doc.loadURL(source);
      console.log(source);
      break;
    }
    case "IFRAME" : {
      doc = doc.contentWindow.doc;
      //intentionally passed to default
    }
    default: {
      ` + actions.observerSetupSource + `;
      observer.observe(doc, observerArgs);
      console.log("connect document ", doc);
      var iframe = doc.querySelectorAll("iframe");
      var webview = doc.querySelectorAll("webview");
      for (var i = 0; i < iframe.length; ++i) {
        console.info("found an iframe in connectDocument");
        documentsToConnect[documentsToConnect.length] = iframe[i];
      }
      for (var i = 0; i < webview.length; ++i) {
        console.info("found a webview in connectDocument");
        documentsToConnect[documentsToConnect.length] = webview[i];
      }
      ` + actions.updateBlockSource + `;
    }
  }
}
`;

actions.activate = function(state) {
  console.info(state);
  actions.elementBlockView = new ElementBlockView(state.elementBlockViewState);
  actions.modalPanel = atom.workspace.addModalPanel({
    item: actions.elementBlockView.getElement(),
    visible: false
  });

  // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
  actions.subscriptions = new CompositeDisposable();

  // Register command that toggles this view
  actions.subscriptions.add(atom.commands.add("atom-workspace", {
    "element-block:toggle": () => actions.toggle()
  }));
};

actions.deactivate = function() {
  actions.modalPanel.destroy();
  actions.subscriptions.dispose();
  actions.elementBlockView.destroy();
};

actions.serialize = function() {
  return {
    elementBlockViewState: actions.elementBlockView.element
  };
};

actions.toggle = function() {
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
};

for (k in actions) {
  console.log(k, actions[k]);
}
export default actions;

actions.connectDocument(document);

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
