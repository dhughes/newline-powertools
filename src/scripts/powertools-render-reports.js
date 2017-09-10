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
    //console.log(data);
    if (sortMethod) {
      // sort data
      data.students.sort(sortMethod);
    }
    if (reverse) {
      data.students.reverse();
    }
    //localStorage.setItem('powertools-gradebook', data);
    gradebookContainer.appendChild(getAsNode(renderGradebookTable(data.students, data.projects)));

    // sort feature
    Array.from(gradebookContainer.querySelectorAll('.sortHeader')).forEach(header => {
      header.addEventListener('click', event => {
        const th = event.target.closest('th');
        renderGradebook(sortStudentProperty(th.getAttribute('data-sortBy'), th.getAttribute('data-type')), !reverse);
      });
    });

    Array.from(document.querySelectorAll('.unit')).forEach(unitHeader => {
      unitHeader.addEventListener('click', event => {
        console.log(event.target.getAttribute('data-unit'));
      });
    });
  }

  function sortStudentProperty(property, type) {
    return (a, b) => {
      // read the property specified
      let aProp = eval(`a.${property}`);
      let bProp = eval(`b.${property}`);

      if (type === 'numeric') {
        aProp = parseFloat(aProp);
        bProp = parseFloat(bProp);

        if (isNaN(aProp)) aProp = -100;
        if (isNaN(bProp)) bProp = -100;
      }

      // sort based on the property
      if (aProp > bProp) return 1;
      else if (aProp < bProp) return -1;
      else return 0;
    };
  }

  //console.log(document.querySelectorAll('.gradeCell'));

  document.querySelectorAll('tbody td').forEach(gradeCell =>
    gradeCell.addEventListener('dblclick', function(event) {
      let selectedRow = event.target.closest('tr');
      if (selectedRow.className.indexOf('onlyVisible') === -1) {
        // hide all rows
        Array.from(document.querySelectorAll('.gradebook-data table tbody tr')).forEach(
          row => (row.className = 'hidden')
        );

        // except this one
        event.target.closest('tr').className += 'onlyVisible';
      } else {
        // show all rows
        Array.from(document.querySelectorAll('.gradebook-data table tbody tr')).forEach(row => (row.className = ''));
      }
    })
  );

  /*
  .addEventListener('dblclick', function(event) {
    console.log(event.target);
  });
   */
}

// const sortStudentsGrade = (a, b) => {
//   if (a.grade > b.grade) return 1;
//   else if (a.grade < b.grade) return -1;
//   else return 0;
// };
//
// const sortStudentName = (a, b) => {
//   if (a.name > b.name) return 1;
//   else if (a.name < b.name) return -1;
//   else return 0;
// };

function renderGradebookTable(students, projects) {
  // <th rowspan="2"><a href="javascript:" class="gradeHeader">Grade</a></th>
  return `
    <div class="gradebook-data">
      <table>
        <thead>
          <tr>
            <th rowspan="2" class="nameHeader sortHeader" data-sortBy="name" data-type="string"><span>Name</span></th>
            ${renderGradesHeaders(Object.keys(students[0].grades))}
            <th rowspan="2" class="gradeHeader projectHeader"><span>Points Needed</span></th>
            <th rowspan="2" class="gradeHeader projectHeader"><span>Ungraded</span></th>
            <th rowspan="2" class="gradeHeader projectHeader"><span>Points Earned</span></th>
            <th rowspan="2" class="gradeHeader projectHeader"><span>Total Required (to 80%)</span></th>
            ${renderGradebookUnitHeaders(projects)}
          </tr>
          <tr>
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

function renderGradesHeaders(units) {
  return units
    .map(
      unit =>
        `<th class="gradeHeader projectHeader sortHeader" data-sortBy="grades['${unit}']" data-type="numeric" rowspan="2">
          <span>${unit}</span>
        </th>`
    )
    .join('');
}

function renderGradebookUnitHeaders(projects) {
  const units = projects.reduce((acc, project) => {
    // this is the current unit for this project
    let projectUnit = project.unit;

    let matchingUnit = acc.filter(unit => unit.unit === projectUnit);

    if (matchingUnit.length) {
      matchingUnit[0].count++;
    } else {
      acc.push({
        unit: projectUnit,
        count: 1
      });
    }

    return acc;
  }, []);

  return units
    .map(
      unit =>
        `<th class="unit projectHeader" colspan="${unit.count}" data-unit="${unit.unit}">
          ${unit.unit}
        </th>`
    )
    .join('');
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
        `<th title="${project.name}" class="${project.type} projectHeader ${project.unit.replace(/\W/g, '')}">
          <a href="${project.link}" target="_blank">${project.name}
        </th>`
    )
    .join('');

  // ${project.type === 'Weekly' ? '(x5)' : ''}</a>
}

function renderGradebookStudentRows(students, projects) {
  /*

  <span>
    ${student.grade}%
  </span>
  ${student.grades.reduce((acc, grade) => acc + `<span>${grade}%</span>`, '')}
   */
  return students
    .map(
      student =>
        `<tr>
          <td><a href="${student.link}">${student.name}</a></td>
          ${renderStudentGrades(student.grades)}
          ${renderStudentPointsNeeded(student, projects)}
          ${renderGradebookStudentProjectCells(student, projects)}
        </tr>`
    )
    .join('');
}

function renderStudentPointsNeeded(student, projects) {
  console.log(student);
  let points = projects
    // filter to the student's own required projects
    .filter(project => student.courses.indexOf(project.courseId) !== -1)
    // reduce these to the points required and earned
    .reduce(
      (acc, project) => {
        // add this to the total required
        acc.required += project.value;
        // has the student successfully completed this project?
        acc.earned +=
          student.submissions.filter(
            submission =>
              project.name === submission.name &&
              (submission.status === 'Complete and satisfactory' || submission.status === 'Exceeds expectations')
          ).length * project.value;
        // are there any ungraded submissions?
        acc.ungraded +=
          student.submissions.filter(
            submission => project.name === submission.name && submission.status === 'Not graded'
          ).length * project.value;

        return acc;
      },
      { earned: 0, required: 0, ungraded: 0 }
    );

  let actuallyRequired = Math.floor(points.required * 0.8);
  let needed = actuallyRequired - points.earned;

  return `
    <td>${needed <= 0 ? 0 : needed}</td>
    <td>${points.ungraded}</td>
    <td>${points.earned}</td>
    <td>${actuallyRequired}</td>`;
}

function renderStudentGrades(grades) {
  return Object.keys(grades)
    .map(key => {
      if (grades[key] !== null) {
        return `
            <td class="gradeCell ${key}">
              ${grades[key]}%
            </td>`;
      } else {
        return `
            <td class="gradeCell ${key} null">
              --
            </td>`;
      }
    })
    .join('');
}

function renderGradebookStudentProjectCells(student, projects) {
  return projects
    .map(project => {
      if (student.courses.indexOf(project.courseId) !== -1) {
        const submission = student.submissions.find(prj => prj.name === project.name);
        if (submission) {
          const grade = formatGrade(submission.status);
          return `<td class="${grade} ${project.type} ${project.unit.replace(
            /\W/g,
            ''
          )}"><a class="submission" href="${submission.link}">${grade}</a></td>`;
        } else {
          return `<td class="${project.type} ${project.unit.replace(/\W/g, '')}"></td>`;
        }
      } else {
        return `
        <td class="${project.type} ${project.unit.replace(/\W/g, '')} null">
          --
        </td>`;
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
