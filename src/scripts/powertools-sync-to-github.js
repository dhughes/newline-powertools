const octocat =
  'data:image/png;base64,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';

const octocatSpinner =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiI+PHBhdGggZmlsbD0iIzMzMyIgZD0iTTM2NCAyOC42QzQyMC43IDU3IDQ1OS42IDk0LjQgNDg1IDE1MWwtMzEuNCAxNWMtMjAtNDEtNjMtODQtMTA0LjYtMTA0LjUiPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImZpbGwiIHZhbHVlcz0iIzMzMzsjZWVlOyMzMzM7IzMzMyIgYmVnaW49IjBzIiBkdXI9IjFzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjwvcGF0aD48cGF0aCBmaWxsPSIjMzMzIiBkPSJNNDk0IDE2OWMyMCA2MCAyMSAxMTQtMSAxNzJsLTMyLjgtMTEuNGMxNS00My4zIDE1LTEwNCAwLTE0OCI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iZmlsbCIgdmFsdWVzPSIjMzMzOyNlZWU7IzMzMzsjMzMzIiBiZWdpbj0iMC4xMjVzIiBkdXI9IjFzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjwvcGF0aD48cGF0aCBmaWxsPSIjMzMzIiBkPSJNNDg1LjQgMzU5LjJjLTI4LjMgNTYuNi02NS44IDk1LjUtMTIyLjQgMTIxbC0xNS4yLTMxLjRjNDEuMy0yMCA4NC4yLTYzIDEwNC43LTEwNC42Ij48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJmaWxsIiB2YWx1ZXM9IiMzMzM7I2VlZTsjMzMzOyMzMzMiIGJlZ2luPSIwLjI1MHMiIGR1cj0iMXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PC9wYXRoPjxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik0zNDQuNSA0ODguNWMtNjAgMjAtMTE0IDIxLTE3Mi0xbDExLjQtMzNjNDMuMiAxNSAxMDQgMTUgMTQ4IDAiPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImZpbGwiIHZhbHVlcz0iIzMzMzsjZWVlOyMzMzM7IzMzMyIgYmVnaW49IjAuMzc1cyIgZHVyPSIxcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48L3BhdGg+PHBhdGggZmlsbD0iIzMzMyIgZD0iTTE1NC4zIDQ4Mi44Yy01Ni42LTI4LjQtOTUuNS02NS44LTEyMS0xMjIuNGwzMS40LTE1LjJjMjAgNDEuMyA2MyA4NC4yIDEwNC42IDEwNC43Ij48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJmaWxsIiB2YWx1ZXM9IiMzMzM7I2VlZTsjMzMzOyMzMzMiIGJlZ2luPSIwLjUwMHMiIGR1cj0iMXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PC9wYXRoPjxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik0yMy43IDM0Mi43Yy0yMC02MC0yMS0xMTQgMS0xNzJsMzMgMTEuNGMtMTUgNDMuNS0xNSAxMDQgMCAxNDgiPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImZpbGwiIHZhbHVlcz0iIzMzMzsjZWVlOyMzMzM7IzMzMyIgYmVnaW49IjAuNjI1cyIgZHVyPSIxcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48L3BhdGg+PHBhdGggZmlsbD0iIzMzMyIgZD0iTTMxLjggMTUxQzYwIDk0LjIgOTcuNSA1NS4zIDE1NCAzMGwxNS4zIDMxLjNjLTQxLjIgMjAtODQgNjMtMTA0LjYgMTA0LjYiPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImZpbGwiIHZhbHVlcz0iIzMzMzsjZWVlOyMzMzM7IzMzMyIgYmVnaW49IjAuNzUwcyIgZHVyPSIxcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48L3BhdGg+PHBhdGggZmlsbD0iIzMzMyIgZD0iTTE3MyAyMWM2MC0yMCAxMTQtMjEgMTcyIDFsLTExLjUgMzIuOGMtNDMuMy0xNS0xMDQtMTUtMTQ4IDAiPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImZpbGwiIHZhbHVlcz0iIzMzMzsjZWVlOyMzMzM7IzMzMyIgYmVnaW49IjAuODc1cyIgZHVyPSIxcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48L3BhdGg+PHBhdGggZmlsbD0iI2VlZSIgZD0iTTE5NyA0NTl2LTQ4cy00LTQtMzMtMWMtMjggMy02Mi02Ni02NS02OSAyNC0xMCA0MyAyNiA2NSAzOGgzMXMzLTQ0IDIwLTM3YzE3IDYtNzIgMS05Ny02MXMxOS0xMjYgMjAtMTE1YzAgOS0xNy0zNS0xMC00NiAyMC0yNCA1MCAxMSA2OSAxNSA1IDAgMTgtOCA1OS03IDQxIDAgNTUgOCA2MCA2IDIyLTEwIDUxLTMyIDY1LTE3IDEwIDEyLTEgNjEtMSA0OXM0MyA4MSA2IDEzMmMtMjkgNDYtOTUgNDMtODQgNDYgMjEgMTUgMTQgOTEgMTQgMTE1bC0yMiA0di03NGMwLTktOS0xMC05LTl2ODVsLTIxIDF2LTg2aC0xMHY4NmwtMjAtMXYtODNzLTgtMS04IDEwdjcyIi8+PC9zdmc+Cg==';

(function() {
  // api url
  const apiRoot = 'https://xo895w8tfb.execute-api.us-east-1.amazonaws.com/prod';
  //const apiRoot = 'http://localhost:3000';

  // are we viewing a project in admin or student view?
  if (!location.href.match(/.*?\/projects\/\d*$/)) return;

  // do we have any downloads sections?
  const downloadSections = document.querySelectorAll('.callout-download');

  if (downloadSections) {
    // get the project name
    const projectName = document.querySelector('.m-coursecontentbookend-title').textContent.trim();

    // for each download section, get the associated links
    downloadSections.forEach((downloadSection, i) => {
      // create a container for git syncing related stuff
      const container = document.createElement('div');
      container.className = 'powertools-github-container';
      downloadSection.appendChild(container);

      // add a spinner to indicate the plugin is syncing
      container.innerHTML = `
        <div>
          <img src="${octocatSpinner}" class="octocat-spinner" alt="Syncing with Github">
          <p>Syncing downloads with Github...</p>
        </div>
      `;

      // get any links for this download section and create a project Object
      const project = {
        name: projectName + (i ? '-' + (i + 1) : ''),
        files: Array.from(downloadSection.querySelectorAll('a')).map(link => ({
          name: link.textContent.trim(),
          uniqueName: link.href.match(/.*\/(.*)/)[1],
          url: link.href
        }))
      };

      //console.log(JSON.stringify(project, null, '\t'));

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
            return response.json();
          } else {
            console.log('Received ' + response.status + ' from project sync.');
          }
        })
        .then(data => {
          console.log(data);

          const githubLink = document.createElement('a');
          githubLink.className = 'forkMe';
          githubLink.setAttribute('href', data.githubProjectUrl);
          githubLink.setAttribute('target', '_blank');

          githubLink.innerHTML = `
            <button class="c-btn c-btn--small c-btn--">
              <img src="${octocat}"/>
              Or, just fork this on Github (Beta)
            </button>`;
          //downloadSection.insertBefore(githubLink, firstChild);
          container.innerHTML = '';
          container.appendChild(githubLink);
        })
        //.then(data => console.log(data))
        .catch(response => {
          console.log('Received "' + response + '" from project sync.');
        });
    });
  }
})();
