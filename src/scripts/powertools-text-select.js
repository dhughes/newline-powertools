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

function handleSelectionChange(event) {
  console.log(event);
}

(function() {
  let rootElements = document.querySelectorAll('article > *');

  rootElements.forEach(item => {
    item.addEventListener('mouseup', handleSelectionChange);
    item.addEventListener('keyup', handleSelectionChange);
  });
})();
