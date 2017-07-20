/**
 * Calculates a hash for the string.
 * Stolen from here: https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
 * @return {[type]} [description]
 */
String.prototype.hashCode = function() {
  var hash = 0,
    i,
    chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

(function() {
  // we can have more than one article
  let articles = document.querySelectorAll('article');

  // get the root elements of all articles
  let rootElements = document.querySelectorAll('article > *');

  rootElements.forEach(item => {
    item.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);
  });

  function handleSelectionChange(event) {
    if (isValidSelection()) {
      // get the selection
      const selection = window.getSelection();
      // which article is the selection in?
      const article = getParentArticile(selection.anchorNode);

      // get the direct children of this article
      const children = Array.from(article.children);

      // get the node which is a direct child of the article that anchorNode is located within
      const beginNode = children.filter(
        child => child === selection.anchorNode || child.contains(selection.anchorNode)
      )[0];
      const endNode = children.filter(child => child === selection.focusNode || child.contains(selection.focusNode))[0];

      console.log(children.indexOf(beginNode));
      console.log(children.indexOf(endNode));
      // const endNode = findDirectChildNode(article, selection.focusNode);
      // console.log(children.indexOf(beginNode));
      // console.log(children.indexOf(endNode));

      // what are the root elements in the document that the selection includes?
      console.log(node);
    }
  }

  function findDirectChildNode(article, thisNode, lastNode) {
    if (thisNode === article) {
      return lastNode;
    }

    return findDirectChildNode(article, thisNode.parentNode, thisNode);
  }

  function isValidSelection() {
    let selection = window.getSelection();

    // if there isn't an anchorNode then we don't have a selection
    if (!selection.anchorNode) return false;

    // selection must start and end in text nodes.
    if (!(selection.anchorNode.nodeName === '#text' || selection.focusNode.nodeName === '#text')) return false;

    // the selected content must start and end inside the article nodeName
    if (!getParentArticile(selection.anchorNode) || !getParentArticile(selection.focusNode)) return false;

    // selections must have a length
    if (selection.anchorNode === selection.focusNode && selection.baseOffset === selection.focusOffset) return false;

    // selections begin and end in the SAME article
    if (getParentArticile(selection.anchorNode) !== getParentArticile(selection.focusNode)) return false;

    // apparently this is a valid selection
    return true;
  }

  // returns the parent article for a given node
  function getParentArticile(node) {
    return Array.from(articles).filter(article => article.contains(node))[0];
  }
})();
