(function() {
  // api url
  //const apiRoot = 'https://xo895w8tfb.execute-api.us-east-1.amazonaws.com/prod';
  const apiRoot = 'http://localhost:3000';

  // are we viewing a project in admin or student view?
  if (!location.href.match(/.*?\/projects\/\d*$/)) return;

  // do we have any downloads sections?
  const downloadSections = document.querySelectorAll('.callout-download');

  if (downloadSections) {
    // get the project name
    const projectName = document.querySelector('.m-coursecontentbookend-title').textContent.trim();

    // for each download section, get the associated links
    downloadSections.forEach((downloadSection, i) => {
      // get any links for this download section and create a project Object
      const project = {
        name: projectName + (i ? '-' + (i + 1) : ''),
        files: Array.from(downloadSection.querySelectorAll('a')).map(link => ({
          name: link.textContent.trim(),
          uniqueName: link.href.match(/.*\/(.*)/)[1],
          url: link.href
        }))
      };

      console.log(JSON.stringify(project, null, '\t'));

      // Notify the Java app about the project. This will tell Java to create, update, etc, a github repo
      fetch(apiRoot + '/project', {
        method: 'POST',
        body: JSON.stringify(project),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      })
        .then(response => {
          if (response.status === 200) {
            return response.text();
          } else {
            console.log('Received ' + response.status + ' from project sync.');
          }
        })
        .then(text => console.log(text))
        .catch(response => {
          console.log('Received "' + response + '" from project sync.');
        });
    });
  }
})();
