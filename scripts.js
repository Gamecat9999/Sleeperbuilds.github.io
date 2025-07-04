// Tab switching
const tabWant = document.getElementById('tab-want');
const tabMade = document.getElementById('tab-made');
const wantSection = document.getElementById('want-builds');
const madeSection = document.getElementById('made-builds');

tabWant.onclick = () => {
  tabWant.classList.add('active');
  tabMade.classList.remove('active');
  wantSection.classList.add('active');
  madeSection.classList.remove('active');
};
tabMade.onclick = () => {
  tabMade.classList.add('active');
  tabWant.classList.remove('active');
  madeSection.classList.add('active');
  wantSection.classList.remove('active');
};

// Load builds
document.addEventListener('DOMContentLoaded', () => {
  fetch('data/want_to_builds.json')
    .then(res => {
      if (!res.ok) throw new Error('Failed to load want_to_builds.json');
      return res.json();
    })
    .then(data => renderBuilds(data, 'want-builds-list'))
    .catch(err => {
      document.getElementById('want-builds-list').innerHTML = `<p class='error-msg'>Could not load Want-To Builds. Please check your connection or try again later.</p>`;
    });
  fetch('data/fully_made_builds.json')
    .then(res => {
      if (!res.ok) throw new Error('Failed to load fully_made_builds.json');
      return res.json();
    })
    .then(data => renderBuilds(data, 'made-builds-list'))
    .catch(err => {
      document.getElementById('made-builds-list').innerHTML = `<p class='error-msg'>Could not load Fully Made Builds. Please check your connection or try again later.</p>`;
    });
});

let wantBuildsData = [];

function renderBuilds(builds, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  if (!builds.length) {
    container.innerHTML = '<p>No builds yet. Check back soon!</p>';
    return;
  }
  // Save want-to builds data for modal use
  if (containerId === 'want-builds-list') wantBuildsData = builds;
  builds.forEach((build, idx) => {
    const card = document.createElement('div');
    card.className = 'build-card';
    let beforeAfter = '';
    if (build.before_image && build.after_image) {
      beforeAfter = `<div class=\"before-after\">
        <img src=\"${build.before_image}\" alt=\"Before mod\" onerror=\"this.onerror=null;this.src='images/placeholder.jpg'\">
        <img src=\"${build.after_image}\" alt=\"After mod\" onerror=\"this.onerror=null;this.src='images/placeholder.jpg'\">
      </div>`;
    }
    let story = '';
    if (build.story) {
      story = `<div class=\"build-story\">${build.story}</div>`;
    }
    let partsList = '';
    if (containerId === 'want-builds-list') {
      partsList = `<ul class=\"part-list\">${build.parts.map(part => `<li>${part.name} <a class='buy-link' href='${part.link}' target='_blank'>Buy</a></li>`).join('')}</ul>`;
    } else {
      partsList = `<ul class=\"part-list\">${build.parts.map(part => `<li>${part.name}</li>`).join('')}</ul>`;
    }
    let cardContent = `
      <img src=\"${build.image || 'images/placeholder.jpg'}\" alt=\"${build.title}\" onerror=\"this.onerror=null;this.src='images/placeholder.jpg'\">\n      <div class=\"build-title\">${build.title}</div>\n      <div class=\"build-case\"><b>Case:</b> ${build.case || 'Unknown'}</div>\n      <div class=\"tags\">${build.tags.map(tag => `<span class='tag'>${tag}</span>`).join(' ')}</div>\n      ${partsList}\n      <div class=\"build-meta\">\n        <strong>Est. Performance:</strong> ${build.performance} <br>\n        <strong>Est. Cost:</strong> ${build.cost} <br>\n        <strong>Resale Projection:</strong> ${build.resale}<br>\n        <strong>Purpose:</strong> ${build.purpose || ''}\n      </div>\n      ${story}\n    `;
    card.innerHTML = cardContent;
    // Want-To Builds: show modal on click
    if (containerId === 'want-builds-list') {
      card.classList.add('clickable-card');
      card.onclick = () => showWantBuildModal(idx);
      card.title = 'See more about this build idea';
    }
    // Premade builds: clickable if link
    if (containerId === 'made-builds-list' && build.link) {
      card.classList.add('clickable-card');
      card.onclick = () => {
        window.open(build.link, '_blank');
      };
      card.title = 'View this premade build';
    }
    container.appendChild(card);
  });
}

// Modal for Want-To Builds
function showWantBuildModal(idx) {
  const build = wantBuildsData[idx];
  let modal = document.getElementById('want-build-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'want-build-modal';
    modal.className = 'modal-bg';
    modal.innerHTML = `<div class='modal-content'></div>`;
    document.body.appendChild(modal);
  }
  const content = modal.querySelector('.modal-content');
  content.innerHTML = `
    <button class='modal-close' onclick='document.getElementById("want-build-modal").style.display="none"'>&times;</button>
    <img src='${build.image || 'images/placeholder.jpg'}' alt='${build.title}' class='modal-img' onerror='this.onerror=null;this.src="images/placeholder.jpg";'>
    <h2>${build.title}</h2>
    <div class='tags'>${build.tags.map(tag => `<span class='tag'>${tag}</span>`).join(' ')}</div>
    <ul class='part-list'>${build.parts.map(part => `<li>${part.name} <a class='buy-link' href='${part.link}' target='_blank'>Buy</a></li>`).join('')}</ul>
    <div class='build-meta'><strong>Est. Performance:</strong> ${build.performance}<br><strong>Est. Cost:</strong> ${build.cost}<br><strong>Resale Projection:</strong> ${build.resale}</div>
    ${build.story ? `<div class='build-story'>${build.story}</div>` : ''}
  `;
  modal.style.display = 'flex';
}
