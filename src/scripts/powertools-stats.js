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
    // filter out projects with no submissions (unless there are other projects after them which do have submissions). IE get rid of all the blanks.
    .then(results => filterRemainingBlankProjects(results))
    // calculate students scores
    .then(results => calculateScores(results))
    // save to local storage
    .then(results => localStorage.setItem('powertools-gradebook', JSON.stringify(results)))
    // render the gradebookData
    .then(() => renderGradebook());
}

function calculateScores(results) {
  // calculate the total number of points for each unit
  const unitValues = results.projects.reduce(
    (acc, project) => {
      // all units start out with zero points
      if (!acc[project.unit]) acc[project.unit] = 0;

      acc[project.unit] += project.value;
      acc.total += project.value;

      return acc;
    },
    { total: 0 }
  );

  // calculate the scores for each student
  results.students.forEach(student => {
    // the student's grades
    const grades = { total: 0 };

    // get all student submissions
    const submissions = student.submissions;

    results.projects.forEach(project => {
      // does this unit exist in the student's grades yet?
      if (!grades[project.unit]) grades[project.unit] = 0;

      // get the student's submission for this project
      const submission = submissions.filter(studentSubmission => studentSubmission.name === project.name);
      if (
        submission.length &&
        (submission[0].status === 'Complete and satisfactory' || submission[0].status === 'Exceeds expectations')
      ) {
        // the student submitted this and it was accepted
        grades.total += project.value;
        grades[project.unit] += project.value;
      }
    });

    // calculate the student's percentages
    Object.keys(grades).forEach(key => {
      grades[key] = (grades[key] / unitValues[key] * 100).toFixed(1);
    });

    student.grades = grades;
  });

  /*
    need to add this to each student:
    {
      grades: grades,
      grade: average
    }
   */

  console.log(results);

  return results;
}

function filterRemainingBlankProjects(results) {
  // reduce the projects to group projects based their unit
  const projects = results.projects.reduce((acc, project) => {
    // does the acc already have a key for this unit?
    if (!acc[project.unit]) {
      // nope, create the key
      acc[project.unit] = [];
    }

    // add this project to its unit
    acc[project.unit].push(project);

    return acc;
  }, {});

  // for each unit, loop backwards and see if any projects do not have submissions
  Object.keys(projects).forEach(key => {
    const unitProjects = projects[key].reverse();

    let foundSubmissions = false;

    unitProjects.forEach(project => {
      const hasSubmissions = projectHasSubmissions(project, results.students);

      if (hasSubmissions) {
        foundSubmissions = true;
      }

      project.show = foundSubmissions || hasSubmissions;
    });
  });

  filteredProjects = results.projects.filter(project => project.show);

  return Object.assign({}, results, { projects: filteredProjects });
}

function projectHasSubmissions(project, students) {
  // map students to submissions
  let submissions = students.map(student => student.submissions);
  submissions = [].concat(...submissions).filter(submission => submission.name === project.name);

  return submissions.length > 0;
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
      .then(text => {
        // get the set of grades for this student
        const grades = Array.from(
          getAsNode(text).querySelectorAll('.objective-card .row div:nth-child(4)  dd h5')
        ).map(grade => parseFloat(grade.textContent));

        // average the grades
        const average = (grades.reduce((acc, grade) => acc + grade, 0) / grades.length).toFixed(1);

        return Object.assign({}, student, {
          grades: grades,
          grade: average
        });
      })
  );
}

function getStudentSubmissions(dom) {
  return (
    Array.from(dom.querySelectorAll('.tab-content table tbody tr'))
      // filter out non-submissions
      .filter(row => row.querySelector('td:last-child li:last-child') != null)
      // map submissions to objects
      .map(row => ({
        name: row.querySelector('td').textContent,
        link: row.querySelector('td:last-child li:last-child a').href,
        status: row.querySelector('td:last-child li:last-child label').textContent.trim()
      }))
  );
}

function getStudents(dom) {
  return Array.from(dom.querySelectorAll('#members tbody tr'))
    .map(row => {
      // is this student disabled?

      try {
        if (!row.querySelector('.badge-danger')) {
          return {
            name: row.querySelector('a').textContent,
            id: parseInt(row.querySelector('a').href.match(/^.*\/cohort_memberships\/(\d*).*?$/)[1]),
            link: row.querySelector('a').href
          };
        }
      } catch (e) {
        // do nothing
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
    unit: projectNode
      .closest('.tab-pane.active')
      .querySelector('.card-header-large')
      .textContent.replace(/ - .*/, '')
      .trim(),
    link: projectNode.querySelector('a').href,
    id: parseInt(projectNode.querySelector('dt').textContent.split(':')[1].trim()),
    type: projectNode.textContent.indexOf('Weekly Project') > -1 ? 'Weekly' : 'Daily',
    value: projectNode.textContent.indexOf('Weekly Project') > -1 ? 5 : 1
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
