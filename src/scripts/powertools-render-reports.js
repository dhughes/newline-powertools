(function() {
  renderReports();
})();

function renderReports() {
  // are we in the appropriate admin section
  if (
    !(
      location.href.match(/.*?\/admin\/cohorts\/\d*$/) ||
      location.href.match(
        /.*?\/admin\/cohorts\/\d*\/(attendance|stats|progress_reports|project_submissions|(scheduler\?cohort_course_id=\d*))$/
      )
    )
  )
    return;

  // get or create the container and append under the page title
  const container = createContainer();

  // create the gradebook's container
  const gradebookContainer = container.appendChild(createGradebookContainer());

  // add the gradebook header
  gradebookContainer.appendChild(createGradebookHeader());

  // render the gradebook
  renderGradebook();
}

function resetGradebookData() {
  const gradebookData = document.querySelector('.gradebook-data');
  if (gradebookData) gradebookData.remove();
}

function getGradebookContainer() {
  return document.querySelector('#gradebook-container');
}

function toggleGradebookVisibility() {
  const gradebookData = document.querySelector('#gradebook-container');

  if (gradebookData.className.split(' ').includes('off')) {
    gradebookData.className = '';
    localStorage.setItem('powertools-gradebook-visible', 'true');
  } else {
    gradebookData.className = 'off';
    localStorage.setItem('powertools-gradebook-visible', 'false');
  }
}

function renderLoadingGradebook() {
  resetGradebookData();

  getGradebookContainer().appendChild(
    getAsNode(`<div class="gradebook-data"><div class="loading"></div> Loading gradebook data...</div>`)
  );
}

function renderGradebook(sortMethod, reverse) {
  resetGradebookData();

  // get the gradebook container
  const gradebookContainer = getGradebookContainer();

  // do we have data to render?
  let data = localStorage.getItem('powertools-gradebook');
  if (!data) {
    gradebookContainer.appendChild(getAsNode(`<div class="gradebook-data">Gradebook data not loaded!</div>`));
  } else {
    data = JSON.parse(data);
    console.log(data);
    if (sortMethod) {
      // sort data
      data.students.sort(sortMethod);
    }
    if (reverse) {
      data.students.reverse();
    }
    //localStorage.setItem('powertools-gradebook', data);
    gradebookContainer.appendChild(getAsNode(renderGradebookTable(data.students, data.projects)));
    gradebookContainer.querySelector('.nameHeader').addEventListener('click', e => {
      renderGradebook(sortStudentName, !reverse);
    });
    gradebookContainer.querySelector('.gradeHeader').addEventListener('click', e => {
      renderGradebook(sortStudentsGrade, !reverse);
    });
  }
}

const sortStudentsGrade = (a, b) => {
  if (a.grade > b.grade) return 1;
  else if (a.grade < b.grade) return -1;
  else return 0;
};
const sortStudentName = (a, b) => {
  if (a.name > b.name) return 1;
  else if (a.name < b.name) return -1;
  else return 0;
};

function renderGradebookTable(students, projects) {
  return `
    <div class="gradebook-data">
      <table>
        <thead>
          <tr>
            <th><a href="javascript:" class="nameHeader">Name</a></th>
            <th><a href="javascript:" class="gradeHeader">Grade</a></th>
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

function createGradebookContainer() {
  return getAsNode(`
    <div id="gradebook-container"
      class="${localStorage.getItem('powertools-gradebook-visible') === 'false' ? 'off' : ''}">
    </div>
  `);
}

function createGradebookHeader() {
  const header = getAsNode(`
    <h1>
      <div class="toggle"></div>
      Gradebook
      <div class="refresh"></div>
    </h1>
  `);

  header.querySelector('.toggle').addEventListener('click', e => toggleGradebookVisibility());
  header.querySelector('.refresh').addEventListener('click', e => loadGradebookData());

  return header;
}

function getAsNode(html) {
  var node = document.createElement('div');
  node.innerHTML = html;
  return node.children[0];
}

function createContainer() {
  // this is the location in the document where we want to place the gradebook
  const titleDiv = document.querySelector('#page-title div');

  const container = getAsNode(`<div id="powertools-container"></div>`);

  titleDiv.append(container);

  return container;
}

function renderGradebookProjectsHeaders(projects) {
  return projects
    .map(
      project =>
        `<th title="${project.name}" class="${project.type}"><a href="${project.link}" target="_blank">${project.name.substr(
          0,
          1
        )} </th>`
    )
    .join('');

  // ${project.type === 'Weekly' ? '(x5)' : ''}</a>
}

function renderGradebookStudentRows(students, projects) {
  return students
    .map(
      student =>
        `<tr>
          <td><a href="${student.link}">${student.name}</a></td>
          <td class="gradeCell">
            <span>
              ${student.grade}%
            </span>
            ${student.grades.reduce((acc, grade) => acc + `<span>${grade}%</span>`, '')}
          </td>
          ${renderGradebookStudentProjectCells(student, projects)}
        </tr>`
    )
    .join('');
}

function renderGradebookStudentProjectCells(student, projects) {
  return projects
    .map(project => {
      const submission = student.submissions.find(prj => prj.name === project.name);
      if (submission) {
        const grade = formatGrade(submission.status);
        return `<td class="${grade} ${project.type}"><a class="submission" href="${submission.link}">${grade}</a></td>`;
      } else {
        return `<td class="${project.type}"></td>`;
      }
    })
    .join('');
}

function formatGrade(grade) {
  if (grade) {
    if (grade.toLowerCase().indexOf('exceeds') >= 0) {
      return 'EE';
    } else if (grade.toLowerCase().indexOf('unsatisfactory') >= 0) {
      return 'CU';
    } else if (grade.toLowerCase().indexOf('satisfactory') >= 0) {
      return 'CS';
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
