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
          grade: getAsNode(text).querySelector('#stats > div:nth-child(4) dd h5').textContent
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

  //
  // return [].concat(...projects).map(projectNode => ({
  //   name: projectNode
  // }));
  /*
.querySelector('dd').textContent.trim(),
link: projectNode.querySelector('a').href,
id: projectNode.map(project => project.querySelector('dt').textContent.split(':')[1].trim())
*/
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

// (function() {
//   renderGradebook();
// })();

// function collectStats() {
//   if (!location.href.match(/.*?\/admin\/cohorts\/.*?/)) return;
//
//   console.log('Loading project stats...');
//
//   const powertoolsTableContainer = document.querySelector('#powertoolsTableContainer');
//   powertoolsTableContainer.textContent = 'Loading...';
//
//   // todo: this should be parsed from the url, or somehow made dynamic
//   const cohortId = 15;
//   const cohortCourseId = 35;
//
//   // are we in the admin section?
//
//   //  the stats page
//   loadLink(`https://newline.theironyard.com/admin/cohorts/${cohortId}/stats`).then(response => {
//     if (response.status === 200) {
//       // grab the HTML from the response
//       response
//         .text()
//         // convert the HTML to a DOM node we can interact with
//         .then(html => getAsNode(html))
//         // find all details links
//         .then(node => Array.from(node.querySelectorAll('.objective-card a[href*=\\/stats\\/]')))
//         // extract and load each link
//         .then(links => Promise.all(links.map(link => loadLink(link.href))))
//         // get the html text from each response
//         .then(responses =>
//           Promise.all(
//             responses.map(response =>
//               response.text().then(html => ({
//                 link: response.url,
//                 dom: getAsNode(html)
//               }))
//             )
//           )
//         )
//         // extract the daily and weekly projects
//         .then(responses =>
//           Promise.all(
//             responses.map(response => ({
//               name: response.dom.querySelector('h1.mt-2').textContent,
//               link: response.url,
//               grade: response.dom.querySelector('#projects-9 .card-block h4').textContent,
//               projects: getDailyAndWeeklyProjectBreakdown(response.dom)
//             }))
//           )
//         )
//         // load project data too and sort the students (this is getting to be a frickin' mess)
//         .then(data => ({
//           projects: loadProjects(cohortId, cohortCourseId),
//           students: data.sort((a, b) => {
//             if (a.name > b.name) {
//               return 1;
//             } else if (a.name == b.name) {
//               return 0;
//             } else {
//               return -1;
//             }
//           })
//         }))
//         // normalize data
//         //.then(data => normalize(data))
//         // do something
//         .then(data => localStorage.setItem('projectSubmissions', JSON.stringify(data)))
//         .then(() => console.log('Finished loading project stats....'))
//         .then(() => renderGradebook());
//     }
//   });
// }
//
// function loadProjects(cohortId, cohortCourseId) {
//   loadLink(
//     `https://newline.theironyard.com/admin/cohorts/${cohortId}/scheduler?cohort_course_id=${cohortCourseId}`
//   ).then(response => {
//     if (response.status === 200) {
//       // grab the HTML from the response
//       return (
//         response
//           .text()
//           // convert the HTML to a DOM node we can interact with
//           .then(html => getAsNode(html))
//           // extract all the projects (data-content-gid="gid://newline/Project/35")
//           .then(node => Array.from(node.querySelectorAll('div[data-content-gid*=Project]')))
//           // map the project nodes to a structured object
//           .then(projects =>
//             projects.map(project => ({
//               name: project.querySelector('dd').textContent.trim(),
//               link: project.querySelector('a').href,
//               id: projects.map(project => project.querySelector('dt').textContent.split(':')[1].trim())
//             }))
//           )
//       );
//     }
//   });
// }
//
// // this flattens the project and student data and extracts the projects from the students array
// function normalize(students) {
//   // sort the students (in place)
//   students.sort((a, b) => {
//     if (a.name > b.name) {
//       return 1;
//     } else if (a.name == b.name) {
//       return 0;
//     } else {
//       return -1;
//     }
//   });
//
//   // get the set of all projects from all students. There will be many, many, duplicate projects we need to clean up
//   let projects = students.map(student => student.projects);
//
//   // flatten our array of projects
//   projects = [].concat(...projects);
//
//   // reduce our projects down to the set of unique projects
//   projects = projects.reduce((projects, project) => {
//     // try to find an element in projects with the same name as this project
//     const index = projects.findIndex(proj => {
//       //console.log(proj.name, project.name);
//       return proj.name === project.name;
//     });
//
//     if (index < 0) {
//       projects.push({
//         name: project.name,
//         link: project.link ? project.link : undefined,
//         type: project.type
//       });
//     } else if (project.link) {
//       projects[index] = {
//         name: project.name,
//         link: project.link ? project.link : undefined,
//         type: project.type
//       };
//     }
//     return projects;
//   }, []);
//
//   return {
//     projects: projects,
//     students: students.map(student => ({
//       name: student.name,
//       link: student.link,
//       grade: student.grade,
//       projects: student.projects.reduce((acc, project) => Object.assign({}, acc, { [project.name]: project }), {})
//     }))
//   };
// }
//
// function getDailyAndWeeklyProjectBreakdown(dom) {
//   // for each table of projects (there are three, daily, weekly, and unattempted)...
//   const projects = Array.from(dom.querySelectorAll('#projects-9 table')).map((table, i) => {
//     // ... get each row (representing a project) and ...
//     const projects = Array.from(table.querySelectorAll('tbody tr')).map(project => {
//       if (i == 2) {
//         // ... if unattempted, make note of the name and that it wasn't attempted
//         return Array.from(project.children).map(project => ({
//           name: project.textContent,
//           attempted: false
//         }));
//       } else {
//         // this is daily or weekly projects
//         const link = project.children[0].querySelector('a');
//         return {
//           name: link.textContent,
//           link: link.href,
//           attempted: true,
//           type: i === 1 ? 'Weekly' : 'Daily',
//           dateSubmitted: new Date(project.children[1].textContent),
//           status: project.children[2].textContent
//         };
//       }
//     });
//
//     return [].concat(...projects);
//   });
//
//   return [].concat(...projects);
// }
//

//
// function getAsNode(html) {
//   var node = document.createElement('html');
//   node.innerHTML = html;
//   return node;
// }
//
