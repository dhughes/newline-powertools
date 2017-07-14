function loadGradebookData() {
  renderLoadingGradebook();

  // get the cohortId
  const cohortId = getCohortId();

  // identify the content assocated with this course
  Promise.all(
    Array.from(document.querySelectorAll('.nav-item a.nav-link[href*=\\/scheduler\\?]')).map(link => link.href)
  )
    // load all of the content items
    .then(contentLinks => Promise.all(contentLinks.map(contentLink => loadLink(contentLink))))
    // get the text/html content from the results
    .then(responses =>
      Promise.all(
        responses.map(response => {
          if (response.status === 200) {
            // grab the HTML from the response
            return response.text();
          } else {
            throw 'Error getting content.';
          }
        })
      )
    )
    // parse the content and extract the projects
    .then(htmls => getProjects(htmls.map(html => getAsNode(html))))
    // now we need to get all of the student submissions. note that we're just passing the projects along
    .then(projects =>
      loadLink(`https://newline.theironyard.com/admin/cohorts/${cohortId}`)
        // get the response
        .then(response => {
          if (response.status === 200) {
            // grab the HTML from the response
            return response.text();
          } else {
            throw 'Error getting students.';
          }
        })
        // parse the content and extract the students
        .then(text => getStudents(getAsNode(text)))
        // load each student and get their project submissions
        .then(students =>
          Promise.all(
            students.map(student =>
              loadLink(student.link + '/project_submissions')
                //get the response
                .then(response => {
                  if (response.status === 200) {
                    // grab the HTML from the response
                    return response.text();
                  } else {
                    throw "Error getting a student's submissions.";
                  }
                })
                // parse the content and extract the student submissions
                .then(text => Object.assign({}, student, { submissions: getStudentSubmissions(getAsNode(text)) }))
            )
          )
            // get student grades
            .then(students => Promise.all(students.map(student => getStudentGrade(student))))
            // collect all of this together
            .then(students => ({
              projects,
              students
            }))
        )
    )
    // save to local storage
    .then(results => localStorage.setItem('powertools-gradebook', JSON.stringify(results)))
    // render the gradebookData
    .then(() => renderGradebook());
}

function getStudentGrade(student) {
  return (
    loadLink(student.link)
      //get the response
      .then(response => {
        if (response.status === 200) {
          // grab the HTML from the response
          return response.text();
        } else {
          throw "Error getting a student's grade.";
        }
      })
      // parse the content and extract the student submissions
      .then(text =>
        Object.assign({}, student, {
          grade: getAsNode(text).querySelector('#stats #stats-9 > div:nth-child(4) dd h5').textContent
        })
      )
  );
}

function getStudentSubmissions(dom) {
  return Array.from(dom.querySelectorAll('.tab-content table tbody tr')).map(row => ({
    name: row.querySelector('td').textContent,
    link: row.querySelector('td:last-child li:last-child a').href,
    status: row.querySelector('td:last-child li:last-child label').textContent.trim()
  }));
}

function getStudents(dom) {
  return Array.from(dom.querySelectorAll('#members tbody tr'))
    .map(row => {
      // is this student disabled?

      if (!row.querySelector('.badge-danger')) {
        return {
          name: row.querySelector('a').textContent,
          id: parseInt(row.querySelector('a').href.match(/^.*\/cohort_memberships\/(\d*).*?$/)[1]),
          link: row.querySelector('a').href
        };
      }
    })
    .filter(row => row !== undefined)
    .sort((a, b) => {
      if (a.name > b.name) {
        return 1;
      } else if (a.name == b.name) {
        return 0;
      } else {
        return -1;
      }
    });
}

function getProjects(doms) {
  const projectNodes = doms.map(dom => Array.from(dom.querySelectorAll('div[data-content-gid*=Project]')));

  return [].concat(...projectNodes).map(projectNode => ({
    name: projectNode.querySelector('dd').textContent.trim(),
    link: projectNode.querySelector('a').href,
    id: parseInt(projectNode.querySelector('dt').textContent.split(':')[1].trim()),
    type: projectNode.textContent.indexOf('Weekly Project') > -1 ? 'Weekly' : 'Daily'
  }));
}

function getAsNode(html) {
  var node = document.createElement('html');
  node.innerHTML = html;
  return node;
}

function getCohortId() {
  return location.href.match(/^.*\/cohorts\/(\d*).*?$/)[1];
}

function loadLink(link) {
  return fetch(link, {
    credentials: 'include'
  });
}
