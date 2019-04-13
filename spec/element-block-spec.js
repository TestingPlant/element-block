'use babel';

import ElementBlock from '../lib/element-block';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('ElementBlock', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('element-block');
  });

  describe('when the element-block:toggle event is triggered', () => {
    it('hides and shows the modal panel', () => {
      // Before the activation event the view is not on the DOM, and no panel
      // has been created
      expect(workspaceElement.querySelector('.element-block')).not.toExist();

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'element-block:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        expect(workspaceElement.querySelector('.element-block')).toExist();

        let elementBlockElement = workspaceElement.querySelector('.element-block');
        expect(elementBlockElement).toExist();

        let elementBlockPanel = atom.workspace.panelForItem(elementBlockElement);
        expect(elementBlockPanel.isVisible()).toBe(true);
        atom.commands.dispatch(workspaceElement, 'element-block:toggle');
        expect(elementBlockPanel.isVisible()).toBe(false);
      });
    });

    it('hides and shows the view', () => {
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement);

      expect(workspaceElement.querySelector('.element-block')).not.toExist();

      // This is an activation event, triggering it causes the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'element-block:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        // Now we can test for view visibility
        let elementBlockElement = workspaceElement.querySelector('.element-block');
        expect(elementBlockElement).toBeVisible();
        atom.commands.dispatch(workspaceElement, 'element-block:toggle');
        expect(elementBlockElement).not.toBeVisible();
      });
    });
  });
});
