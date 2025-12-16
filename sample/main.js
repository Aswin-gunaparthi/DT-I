async function searchJobs() {
  const skill = document.getElementById('skill').value.trim();
  if (!skill) return alert('Enter a skill');

  const jobsDiv = document.getElementById('jobs');
  jobsDiv.innerHTML = 'Loading jobs...';

  const res = await fetch(`http://localhost:5000/api/jobs?skill=${encodeURIComponent(skill)}`);
  const jobs = await res.json();

  jobsDiv.innerHTML = '';

  jobs.forEach(job => {
    const div = document.createElement('div');
    div.className = 'job';
    div.innerHTML = `
      <h3>${job.title}</h3>
      <p><b>Company:</b> ${job.company}</p>
      <p><b>Location:</b> ${job.location}</p>
      <p class="source">Source: ${job.source}</p>
      <a class="apply" href="#" onclick="applyJob('${job.applyLink}','${job.fallback}')">Apply Now</a>
    `;
    jobsDiv.appendChild(div);
  });
}

function applyJob(applyLink, fallbackLink) {
  if (applyLink && applyLink.startsWith('http')) {
    window.open(applyLink, '_blank');
  } else {
    window.open(fallbackLink, '_blank');
  }
}
