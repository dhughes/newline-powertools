(function startPowertools() {
  // this adds HR breaks between sections in the cohort admin
  (function addAdminSectionBreaks() {
    // get all the lessons
    const lessons = document.querySelectorAll('body.admin div[data-content-gid*=ObjectiveLesson]');

    // add a divider between lessons
    let first = true;
    lessons.forEach(lesson => {
      if (first) {
        first = !first;
      } else {
        // const parent = lesson.parentNode;
        const hr = document.createElement('hr');
        hr.className = 'powertools-separator';

        lesson.append(hr);
      }
    });
  })();

  (function enableCollapseContent() {
    document
      .querySelectorAll('body.admin div[data-content-gid], body.admin div[data-additional-content-gid]')
      .forEach(content => content.addEventListener('dblclick', collapseContent));
    //content.addEventLister('click', collapseContent)
  })();

  function collapseContent(event) {
    let content = getClosest(event.target, 'div[data-content-gid], div[data-additional-content-gid]');
    if (content.className.includes('powertools-collapse')) {
      // remove the class
      content.className = content.className.replace('powertools-collapse', '');
    } else {
      // add the class
      content.className += ' powertools-collapse';
    }

    console.log(content);
  }

  // getClosest is stolen from: https://gomakethings.com/climbing-up-and-down-the-dom-tree-with-vanilla-javascript/
  /**
 * Get the closest matching element up the DOM tree.
 * @private
 * @param  {Element} elem     Starting element
 * @param  {String}  selector Selector to match against
 * @return {Boolean|Element}  Returns null if not match found
 */
  function getClosest(elem, selector) {
    // Element.matches() polyfill
    if (!Element.prototype.matches) {
      Element.prototype.matches =
        Element.prototype.matchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        function(s) {
          var matches = (this.document || this.ownerDocument).querySelectorAll(s), i = matches.length;
          while (--i >= 0 && matches.item(i) !== this) {
          }
          return i > -1;
        };
    }

    // Get closest match
    for (; elem && elem !== document; elem = elem.parentNode) {
      if (elem.matches(selector)) return elem;
    }

    return null;
  }
})();
