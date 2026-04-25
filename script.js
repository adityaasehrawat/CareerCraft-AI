let currentStep = 1;
const TOTAL_STEPS = 5;
let eduCount = 0, expCount = 0, projCount = 0;
let skills = [];
let photoData = '';
let currentTheme = 'violet';
const STORAGE_KEY = 'careercraft_v2';

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type;
  void t.offsetWidth;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function saveToStorage() {
  const data = {
    personal: {
      fullName: val('fullName'), jobTitle: val('jobTitle'), email: val('email'),
      phone: val('phone'), location: val('location'), website: val('website'),
      github: val('github'), dob: val('dob'), summary: val('summary'),
    },
    education: collectEducation(),
    experience: collectExperience(),
    skills,
    languages: val('languages'),
    achievements: val('achievements'),
    projects: collectProjects(),
    theme: currentTheme,
    photo: photoData,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function updateScore() {
  let score = 0;
  if (val('fullName')) score += 15;
  if (val('email')) score += 10;
  if (val('jobTitle')) score += 5;
  if (val('phone')) score += 5;
  if (val('summary')) score += 10;
  const edu = collectEducation().filter(e => e.school);
  if (edu.length) score += 10;
  const exp = collectExperience().filter(e => e.company);
  if (exp.length) score += 15;
  if (skills.length >= 3) score += 10;
  else if (skills.length > 0) score += 5;
  const proj = collectProjects().filter(p => p.name);
  if (proj.length) score += 15;
  if (val('achievements')) score += 5;

  const fill = document.getElementById('completionFill');
  document.getElementById('scoreVal').textContent = score + '%';
  fill.style.width = score + '%';
  if (score < 40) fill.style.background = 'linear-gradient(90deg,#f43f5e,#fb923c)';
  else if (score < 70) fill.style.background = 'linear-gradient(90deg,#f97316,#facc15)';
  else fill.style.background = 'linear-gradient(90deg,#10b981,#06b6d4)';
}

function goToStep(n) {
  if (n < 1 || n > TOTAL_STEPS) return;
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.step').forEach(s => {
    s.classList.remove('active');
    if (parseInt(s.dataset.step) < n) s.classList.add('completed');
    else s.classList.remove('completed');
  });
  document.querySelectorAll('.step-line').forEach((line, i) => {
    line.classList.toggle('completed', i < n - 1);
  });
  document.getElementById('step-' + n).classList.add('active');
  document.querySelector(`.step[data-step="${n}"]`).classList.add('active');
  currentStep = n;
  saveToStorage();
  updatePreview();
}

document.querySelectorAll('.step').forEach(s => {
  s.addEventListener('click', () => goToStep(parseInt(s.dataset.step)));
  s.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') goToStep(parseInt(s.dataset.step));
  });
});

function addEducationEntry(data = {}) {
  eduCount++;
  const id = eduCount;
  const card = document.createElement('div');
  card.className = 'entry-card';
  card.id = 'edu-' + id;
  card.innerHTML = `
    <div class="entry-card-header">
      <span class="entry-card-number"><i class="fa-solid fa-graduation-cap"></i> Education #${id}</span>
      <button class="entry-remove" onclick="removeEntry('edu-${id}')"><i class="fa-solid fa-trash"></i></button>
    </div>
    <div class="form-row">
      <div class="form-group"><label>School / University</label>
        <input type="text" class="edu-school" placeholder="e.g. Chitkara University" value="${data.school||''}" maxlength="80"/></div>
      <div class="form-group"><label>Degree / Program</label>
        <input type="text" class="edu-degree" placeholder="e.g. B.Tech Computer Science" value="${data.degree||''}" maxlength="80"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Start Year</label>
        <input type="text" class="edu-start" placeholder="e.g. 2021" value="${data.start||''}" maxlength="10"/></div>
      <div class="form-group"><label>End Year / Expected</label>
        <input type="text" class="edu-end" placeholder="e.g. 2025" value="${data.end||''}" maxlength="10"/></div>
    </div>
    <div class="form-group"><label>Grade / CGPA</label>
      <input type="text" class="edu-grade" placeholder="e.g. 9.1 / 10" value="${data.grade||''}" maxlength="30"/></div>`;
  document.getElementById('educationList').appendChild(card);
  attachAutoSave(card);
}

function collectEducation() {
  return [...document.querySelectorAll('#educationList .entry-card')].map(c => ({
    school: c.querySelector('.edu-school')?.value.trim() || '',
    degree: c.querySelector('.edu-degree')?.value.trim() || '',
    start:  c.querySelector('.edu-start')?.value.trim() || '',
    end:    c.querySelector('.edu-end')?.value.trim() || '',
    grade:  c.querySelector('.edu-grade')?.value.trim() || '',
  }));
}

function addExperienceEntry(data = {}) {
  expCount++;
  const id = expCount;
  const card = document.createElement('div');
  card.className = 'entry-card';
  card.id = 'exp-' + id;
  card.innerHTML = `
    <div class="entry-card-header">
      <span class="entry-card-number"><i class="fa-solid fa-briefcase"></i> Experience #${id}</span>
      <button class="entry-remove" onclick="removeEntry('exp-${id}')"><i class="fa-solid fa-trash"></i></button>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Company / Organization</label>
        <input type="text" class="exp-company" placeholder="e.g. Google" value="${data.company||''}" maxlength="80"/></div>
      <div class="form-group"><label>Role / Position</label>
        <input type="text" class="exp-role" placeholder="e.g. Software Engineer Intern" value="${data.role||''}" maxlength="80"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Start Date</label>
        <input type="text" class="exp-start" placeholder="e.g. June 2024" value="${data.start||''}" maxlength="30"/></div>
      <div class="form-group"><label>End Date</label>
        <input type="text" class="exp-end" placeholder="e.g. Aug 2024 or Present" value="${data.end||''}" maxlength="30"/></div>
    </div>
    <div class="form-group"><label>Description</label>
      <textarea class="exp-desc" rows="3" placeholder="Describe your responsibilities and achievements…" maxlength="400">${data.desc||''}</textarea></div>`;
  document.getElementById('experienceList').appendChild(card);
  attachAutoSave(card);
}

function collectExperience() {
  return [...document.querySelectorAll('#experienceList .entry-card')].map(c => ({
    company: c.querySelector('.exp-company')?.value.trim() || '',
    role:    c.querySelector('.exp-role')?.value.trim() || '',
    start:   c.querySelector('.exp-start')?.value.trim() || '',
    end:     c.querySelector('.exp-end')?.value.trim() || '',
    desc:    c.querySelector('.exp-desc')?.value.trim() || '',
  }));
}

function addProjectEntry(data = {}) {
  projCount++;
  const id = projCount;
  const card = document.createElement('div');
  card.className = 'entry-card';
  card.id = 'proj-' + id;
  card.innerHTML = `
    <div class="entry-card-header">
      <span class="entry-card-number"><i class="fa-solid fa-code"></i> Project #${id}</span>
      <button class="entry-remove" onclick="removeEntry('proj-${id}')"><i class="fa-solid fa-trash"></i></button>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Project Name</label>
        <input type="text" class="proj-name" placeholder="e.g. Smart Resume Builder" value="${data.name||''}" maxlength="80"/></div>
      <div class="form-group"><label>Technologies Used</label>
        <input type="text" class="proj-tech" placeholder="e.g. React, Node.js, MongoDB" value="${data.tech||''}" maxlength="100"/></div>
    </div>
    <div class="form-group"><label>Description</label>
      <textarea class="proj-desc" rows="3" placeholder="Describe what the project does and your role…" maxlength="400">${data.desc||''}</textarea></div>
    <div class="form-group"><label>Project / GitHub Link</label>
      <input type="url" class="proj-link" placeholder="https://github.com/aditya/project" value="${data.link||''}"/></div>`;
  document.getElementById('projectList').appendChild(card);
  attachAutoSave(card);
}

function collectProjects() {
  return [...document.querySelectorAll('#projectList .entry-card')].map(c => ({
    name: c.querySelector('.proj-name')?.value.trim() || '',
    tech: c.querySelector('.proj-tech')?.value.trim() || '',
    desc: c.querySelector('.proj-desc')?.value.trim() || '',
    link: c.querySelector('.proj-link')?.value.trim() || '',
  }));
}

function removeEntry(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.opacity = '0';
  el.style.transform = 'scale(0.95)';
  el.style.transition = 'all 0.2s ease';
  setTimeout(() => { el.remove(); saveToStorage(); updatePreview(); }, 200);
}

function addSkill() {
  const input = document.getElementById('skillInput');
  const category = document.getElementById('skillCategory').value;
  const name = input.value.trim();
  if (!name) { showToast('Enter a skill name', 'error'); return; }
  if (skills.some(s => s.name.toLowerCase() === name.toLowerCase())) {
    showToast('Already added!', 'error'); return;
  }
  skills.push({ name, category });
  input.value = '';
  renderSkillTags();
  saveToStorage();
  updatePreview();
}

function removeSkill(i) {
  skills.splice(i, 1);
  renderSkillTags();
  saveToStorage();
  updatePreview();
}

function renderSkillTags() {
  const c = document.getElementById('skillsContainer');
  c.innerHTML = '';
  skills.forEach((s, i) => {
    const tag = document.createElement('div');
    tag.className = 'skill-tag';
    tag.innerHTML = `<span>${escapeHtml(s.name)}</span><button class="remove-skill" onclick="removeSkill(${i})">×</button>`;
    c.appendChild(tag);
  });
}

function attachAutoSave(parent = document) {
  parent.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('input', () => { saveToStorage(); updatePreview(); updateScore(); });
  });
}

attachAutoSave(document.getElementById('step-1'));
attachAutoSave(document.getElementById('step-4'));

document.getElementById('summary').addEventListener('input', function () {
  document.getElementById('summaryCount').textContent = this.value.length;
});

document.getElementById('addSkillBtn').addEventListener('click', addSkill);
document.getElementById('skillInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
});
document.getElementById('addEducationBtn').addEventListener('click', () => addEducationEntry());
document.getElementById('addExpBtn').addEventListener('click', () => addExperienceEntry());
document.getElementById('addProjectBtn').addEventListener('click', () => addProjectEntry());

document.getElementById('photoUploadArea').addEventListener('click', () => {
  document.getElementById('photoInput').click();
});
document.getElementById('photoInput').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    photoData = e.target.result;
    const circle = document.getElementById('photoCircle');
    circle.innerHTML = `<img src="${photoData}" alt="Photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
    const rp = document.getElementById('rp-photo');
    rp.src = photoData;
    rp.style.display = 'block';
    saveToStorage();
  };
  reader.readAsDataURL(file);
});

document.querySelectorAll('.theme-dot').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.theme-dot').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTheme = btn.dataset.theme;
    document.getElementById('resumePreview').dataset.theme = currentTheme;
    saveToStorage();
    showToast('Theme updated!', 'success');
  });
});

function updatePreview() {
  const name    = val('fullName');
  const title   = val('jobTitle');
  const email   = val('email');
  const phone   = val('phone');
  const loc     = val('location');
  const web     = val('website');
  const github  = val('github');
  const summary = val('summary');
  const langs   = val('languages');
  const achieve = val('achievements');

  document.getElementById('rp-name').textContent  = name    || 'Your Name';
  document.getElementById('rp-title').textContent = title   || 'Your Job Title';
  document.getElementById('rp-summary').textContent = summary || 'Your professional summary will appear here…';

  const contact = document.getElementById('rp-contact');
  contact.innerHTML = [
    email ? `<span><i class="fa-solid fa-envelope"></i> ${escapeHtml(email)}</span>` : '',
    phone ? `<span><i class="fa-solid fa-phone"></i> ${escapeHtml(phone)}</span>` : '',
    loc   ? `<span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(loc)}</span>` : '',
  ].join('');

  const links = document.getElementById('rp-links');
  links.innerHTML = [
    web    ? `<span><i class="fa-solid fa-link"></i> ${escapeHtml(web)}</span>` : '',
    github ? `<span><i class="fa-brands fa-github"></i> ${escapeHtml(github)}</span>` : '',
  ].join('');

  const eduBody = document.getElementById('rp-education');
  const eduData = collectEducation();
  if (!eduData.length || eduData.every(e => !e.school && !e.degree)) {
    eduBody.innerHTML = '<p class="rp-placeholder">Education details will appear here…</p>';
  } else {
    eduBody.innerHTML = eduData.map(e => `
      <div class="rp-edu-entry">
        <div class="rp-school">${escapeHtml(e.school || 'Institution')}</div>
        <div class="rp-degree">${escapeHtml(e.degree || 'Degree')}</div>
        <div class="rp-meta">
          ${(e.start || e.end) ? `<span>${escapeHtml(e.start)} – ${escapeHtml(e.end)}</span>` : ''}
          ${e.grade ? `<span>CGPA: ${escapeHtml(e.grade)}</span>` : ''}
        </div>
      </div>`).join('');
  }

  const expBody = document.getElementById('rp-experience');
  const expData = collectExperience();
  if (!expData.length || expData.every(e => !e.company && !e.role)) {
    expBody.innerHTML = '<p class="rp-placeholder">Work experience will appear here…</p>';
  } else {
    expBody.innerHTML = expData.map(e => `
      <div class="rp-exp-entry">
        <div class="rp-company">${escapeHtml(e.company || 'Company')}</div>
        <div class="rp-role">${escapeHtml(e.role || 'Role')}</div>
        <div class="rp-meta">${(e.start || e.end) ? `<span>${escapeHtml(e.start)} – ${escapeHtml(e.end)}</span>` : ''}</div>
        ${e.desc ? `<div class="rp-desc">${escapeHtml(e.desc)}</div>` : ''}
      </div>`).join('');
  }

  const skillsBody = document.getElementById('rp-skills');
  if (!skills.length) {
    skillsBody.innerHTML = '<p class="rp-placeholder">Your skills will appear here…</p>';
  } else {
    let html = `<div class="rp-skills-grid">${skills.map(s => `<span class="rp-skill-badge">${escapeHtml(s.name)}</span>`).join('')}</div>`;
    if (langs) html += `<p class="rp-lang-text" style="margin-top:0.4rem;"><strong>Languages:</strong> ${escapeHtml(langs)}</p>`;
    skillsBody.innerHTML = html;
  }

  const projBody = document.getElementById('rp-projects');
  const projData = collectProjects();
  if (!projData.length || projData.every(p => !p.name)) {
    projBody.innerHTML = '<p class="rp-placeholder">Project details will appear here…</p>';
  } else {
    projBody.innerHTML = projData.map(p => `
      <div class="rp-project-entry">
        <div class="rp-project-name">${escapeHtml(p.name || 'Project')}</div>
        ${p.tech ? `<div class="rp-project-tech">${escapeHtml(p.tech)}</div>` : ''}
        ${p.desc ? `<div class="rp-desc">${escapeHtml(p.desc)}</div>` : ''}
        ${p.link ? `<div class="rp-project-link"><a href="${escapeHtml(p.link)}" target="_blank">${escapeHtml(p.link)}</a></div>` : ''}
      </div>`).join('');
  }

  const achBody = document.getElementById('rp-achievements');
  if (achieve) {
    achBody.innerHTML = `<p class="rp-achieve-text">${escapeHtml(achieve)}</p>`;
  } else {
    achBody.innerHTML = '<p class="rp-placeholder">Achievements will appear here…</p>';
  }

  updateScore();
}

document.getElementById('downloadBtn').addEventListener('click', async () => {
  const btn = document.getElementById('downloadBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating…';
  try {
    const preview = document.getElementById('resumePreview');
    const canvas = await html2canvas(preview, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW  = pageW;
    const imgH  = (canvas.height * pageW) / canvas.width;
    const imgData = canvas.toDataURL('image/png');
    let yPos = 0, remaining = imgH;
    while (remaining > 0) {
      pdf.addImage(imgData, 'PNG', 0, -yPos, imgW, imgH);
      remaining -= pageH;
      yPos += pageH;
      if (remaining > 0) pdf.addPage();
    }
    const name = val('fullName') || 'Resume';
    pdf.save(`${name.replace(/\s+/g, '_')}_Resume.pdf`);
    showToast('PDF downloaded!', 'success');
  } catch (err) {
    console.error(err);
    showToast('Could not generate PDF. Try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-download"></i> Download PDF';
  }
});

document.getElementById('finishBtn').addEventListener('click', () => {
  saveToStorage();
  updatePreview();
  showToast('Resume ready! Download it now.', 'success');
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Reset all data? This cannot be undone.')) return;
  localStorage.removeItem(STORAGE_KEY);
  ['fullName','jobTitle','email','phone','location','website','github','dob','summary','languages','achievements'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('summaryCount').textContent = '0';
  document.getElementById('educationList').innerHTML = '';
  document.getElementById('experienceList').innerHTML = '';
  document.getElementById('projectList').innerHTML = '';
  document.getElementById('photoCircle').innerHTML = '<i class="fa-solid fa-camera"></i><span>Photo</span>';
  document.getElementById('rp-photo').style.display = 'none';
  eduCount = 0; expCount = 0; projCount = 0;
  skills = [];
  photoData = '';
  renderSkillTags();
  goToStep(1);
  updatePreview();
  showToast('All data cleared.', '');
});

function restoreData() {
  const data = loadFromStorage();
  if (!data) return;
  const p = data.personal || {};
  ['fullName','jobTitle','email','phone','location','website','github','dob','summary'].forEach(f => {
    const el = document.getElementById(f);
    if (el && p[f]) el.value = p[f];
  });
  if (p.summary) document.getElementById('summaryCount').textContent = p.summary.length;
  (data.education || []).forEach(e => addEducationEntry(e));
  (data.experience || []).forEach(e => addExperienceEntry(e));
  skills = data.skills || [];
  renderSkillTags();
  if (data.languages) document.getElementById('languages').value = data.languages;
  if (data.achievements) document.getElementById('achievements').value = data.achievements;
  (data.projects || []).forEach(p => addProjectEntry(p));
  if (data.theme) {
    currentTheme = data.theme;
    document.getElementById('resumePreview').dataset.theme = currentTheme;
    document.querySelectorAll('.theme-dot').forEach(b => {
      b.classList.toggle('active', b.dataset.theme === currentTheme);
    });
  }
  if (data.photo) {
    photoData = data.photo;
    const circle = document.getElementById('photoCircle');
    circle.innerHTML = `<img src="${photoData}" alt="Photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
    const rp = document.getElementById('rp-photo');
    rp.src = photoData;
    rp.style.display = 'block';
  }
  updatePreview();
}

restoreData();
updatePreview();
