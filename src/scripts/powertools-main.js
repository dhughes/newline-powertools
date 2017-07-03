(function startPowertools() {
  // this adds HR breaks between sections in the cohort admin
  (function addAdminSectionBreaks() {
    // get all the lessons
    const lessons = document.querySelectorAll('body.admin div[data-content-gid*=ObjectiveLesson]');

    // add a divider between lessons
    let first = true;
    lessons.forEach(lesson => {
      // const parent = lesson.parentNode;
      const hr = document.createElement('hr');
      hr.className = 'powertools-separator';

      lesson.insertBefore(hr, lesson.firstChild);
    });
  })();

  // this turns on the ability to collapse content items in the admin
  (function enableCollapseContent() {
    document
      .querySelectorAll('body.admin div[data-content-gid], body.admin div[data-additional-content-gid]')
      .forEach(content => content.addEventListener('dblclick', collapseContent));
  })();

  // this re-collapses content items in the admin
  (function collapseCollapsedContent() {
    let collapsedContent = localStorage.getItem('collapsedContent')
      ? JSON.parse(localStorage.getItem('collapsedContent'))
      : [];

    document.querySelectorAll('div.eo').forEach(content => {
      const gidAttr = Object.keys(content.attributes).reduce(
        (acc, i) => (content.attributes[i].name.endsWith('-gid') ? content.attributes[i].value : acc),
        ''
      );

      if (collapsedContent.includes(gidAttr)) {
        content.className += ' powertools-collapse';
      }
    });
  })();

  // this is what collapses content
  function collapseContent(event) {
    let content = getClosest(event.target, 'div[data-content-gid], div[data-additional-content-gid]');
    let collapsedContent = localStorage.getItem('collapsedContent')
      ? JSON.parse(localStorage.getItem('collapsedContent'))
      : [];

    let gidAttr = Object.keys(content.attributes).reduce(
      (acc, i) => (content.attributes[i].name.endsWith('-gid') ? content.attributes[i].value : acc),
      ''
    );

    if (content.className.includes('powertools-collapse')) {
      // remove the class
      content.className = content.className.replace('powertools-collapse', '');
      collapsedContent = collapsedContent.filter(gid => gid !== gidAttr);
    } else {
      // add the class
      content.className += ' powertools-collapse';
      collapsedContent.push(gidAttr);
    }

    // save the collapsed items
    localStorage.setItem('collapsedContent', JSON.stringify(collapsedContent));
  }

  // getClosest is stolen from: https://gomakethings.com/climbing-up-and-down-the-dom-tree-with-vanilla-javascript/
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
          var matches = (this.document || this.ownerDocument).querySelectorAll(s),
            i = matches.length;
          while (--i >= 0 && matches.item(i) !== this) {}
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
