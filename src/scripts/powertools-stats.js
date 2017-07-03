(function() {
  if (!localStorage.getItem('projectSubmissions')) {
    collectStats();
  } else {
    renderGradebook();
  }
})();

function renderGradebookProjectsHeaders(projects) {
  return projects
    .map(
      project =>
        `<th title="${project.name}" class="${project.type}"><a href="${project.link}" target="_blank">${project.name.substr(
          0,
          1
        )} ${project.type === 'Weekly' ? '(x5)' : ''}</a></th>`
    )
    .join('');
}

function renderGradebookStudentRows(students, projects) {
  return students
    .map(
      student =>
        `<tr><td><a href="${student.link}">${student.name}</a></td><td>${student.grade}</td>${renderGradebookStudentProjectCells(
          student,
          projects
        )}</tr>`
    )
    .join('');
}

function renderGradebookStudentProjectCells(student, projects) {
  return projects
    .map(project => {
      const grade = formatGrade(student.projects[project.name].status);
      return `<td class="${grade} ${project.type}"><a class="submission" href="${student.projects[project.name]
        .link}">${grade}</a></td>`;
    })
    .join('');
}

function formatGrade(grade) {
  if (grade) {
    if (grade.toLowerCase().indexOf('exceeds') >= 0) {
      return 'EE';
    } else if (grade.toLowerCase().indexOf('satisfactory') >= 0) {
      return 'CS';
    } else if (grade.toLowerCase().indexOf('unsatisfactory') >= 0) {
      return 'CU';
    } else if (grade.toLowerCase().indexOf('incomplete') >= 0) {
      return 'In';
    } else if (grade.toLowerCase().indexOf('not graded') >= 0) {
      return 'NG';
    } else {
      return '';
    }
  } else {
    return '';
  }
}

function renderGradebookTable(students, projects) {
  return `
    <h1>
      <div class="toggle"></div>
      Gradebook
      <div class="refresh"></div>
    </h1>
    <div id="powertoolsTableContainer">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Grade</th>
            ${renderGradebookProjectsHeaders(projects)}
          </tr>
        </thead>
        <tbody>
          ${renderGradebookStudentRows(students, projects)}
        </tbody>
      </table>
    </div>
  `;
}

function renderGradebook() {
  // are we in the admin section?
  if (!location.href.match(/.*?\/admin\/cohorts\/.*?/)) return;

  const projectSubmissions = JSON.parse(localStorage.getItem('projectSubmissions'));
  const students = projectSubmissions.students;
  const projects = projectSubmissions.projects;
  const gradebookDiv = document.querySelector('#page-title div');

  // remove the gradebook if it already exists
  const gradebook = document.querySelector('.powertools-gradebook');
  if (gradebook) gradebook.remove();

  const div = document.createElement('div');
  div.className = 'powertools-gradebook';
  if (localStorage.getItem('powertoolsGradebookDisplayOff') === 'true') div.className += ' off';
  div.innerHTML = renderGradebookTable(students, projects);

  gradebookDiv.append(div);

  document.querySelector('.toggle').addEventListener('click', e => {
    if (div.className.split(' ').includes('off')) {
      div.className = 'powertools-gradebook';
      localStorage.setItem('powertoolsGradebookDisplayOff', 'false');
    } else {
      div.className = 'powertools-gradebook off';
      localStorage.setItem('powertoolsGradebookDisplayOff', 'true');
    }
  });

  document.querySelector('.refresh').addEventListener('click', e => collectStats());
}

function collectStats() {
  if (!location.href.match(/.*?\/admin\/cohorts\/.*?/)) return;

  console.log('Loading project stats...');

  const powertoolsTableContainer = document.querySelector('#powertoolsTableContainer');
  powertoolsTableContainer.textContent = 'Loading...';

  // todo: this should be parsed from the url
  const cohortId = 15;

  // are we in the admin section?

  // fetch the stats page
  loadLink(`https://newline.theironyard.com/admin/cohorts/${cohortId}/stats`).then(response => {
    if (response.status === 200) {
      // grab the HTML from the response
      response
        .text()
        // convert the HTML to a DOM node we can interact with
        .then(html => getAsNode(html))
        // find all details links
        .then(node => Array.from(node.querySelectorAll('.objective-card a[href*=\\/stats\\/]')))
        // extract and load each link
        .then(links => Promise.all(links.map(link => loadLink(link.href))))
        // get the html text from each response
        .then(responses =>
          Promise.all(
            responses.map(response =>
              response.text().then(html => ({
                link: response.url,
                dom: getAsNode(html)
              }))
            )
          )
        )
        // extract the daily and weekly projects
        .then(responses =>
          Promise.all(
            responses.map(response => ({
              name: response.dom.querySelector('h1.mt-2').textContent,
              link: response.url,
              grade: response.dom.querySelector('#projects-9 .card-block h4').textContent,
              projects: getDailyAndWeeklyProjectBreakdown(response.dom)
            }))
          )
        )
        // normalize data
        .then(data => normalize(data))
        // do something
        .then(data => localStorage.setItem('projectSubmissions', JSON.stringify(data)))
        .then(() => console.log('Finished loading project stats....'))
        .then(() => renderGradebook());
    }
  });
}

// this flattens the project and student data and extracts the projects from the students array
function normalize(students) {
  // sort the students (in place)
  students.sort((a, b) => {
    if (a.name > b.name) {
      return 1;
    } else if (a.name == b.name) {
      return 0;
    } else {
      return -1;
    }
  });
  // get the set of all projects from all students. There will be many, many, duplicate projects we need to clean up
  let projects = students.map(student => student.projects);
  // flatten our array of projects
  projects = [].concat(...projects);

  // reduce our projects down to the set of unique projects
  projects = projects.reduce((projects, project) => {
    // try to find an element in projects with the same name as this project
    const index = projects.findIndex(proj => {
      //console.log(proj.name, project.name);
      return proj.name === project.name;
    });

    if (index < 0) {
      projects.push({
        name: project.name,
        link: project.link ? project.link : undefined,
        type: project.type
      });
    } else if (project.link) {
      projects[index] = {
        name: project.name,
        link: project.link ? project.link : undefined,
        type: project.type
      };
    }
    return projects;
  }, []);

  return {
    projects: projects,
    students: students.map(student => ({
      name: student.name,
      link: student.link,
      grade: student.grade,
      projects: student.projects.reduce((acc, project) => Object.assign({}, acc, { [project.name]: project }), {})
    }))
  };
}

function getDailyAndWeeklyProjectBreakdown(dom) {
  // for each table of projects (there are three, daily, weekly, and unattempted)...
  const projects = Array.from(dom.querySelectorAll('#projects-9 table')).map((table, i) => {
    // ... get each row (representing a project) and ...
    const projects = Array.from(table.querySelectorAll('tbody tr')).map(project => {
      if (i == 2) {
        // ... if unattempted, make note of the name and that it wasn't attempted
        return Array.from(project.children).map(project => ({
          name: project.textContent,
          attempted: false
        }));
      } else {
        // this is daily or weekly projects
        const link = project.children[0].querySelector('a');
        return {
          name: link.textContent,
          link: link.href,
          attempted: true,
          type: i === 1 ? 'Weekly' : 'Daily',
          dateSubmitted: new Date(project.children[1].textContent),
          status: project.children[2].textContent
        };
      }
    });

    return [].concat(...projects);
  });

  return [].concat(...projects);
}

function loadLink(link) {
  return fetch(link, {
    credentials: 'include'
  });
}

function getAsNode(html) {
  var node = document.createElement('html');
  node.innerHTML = html;
  return node;
}
