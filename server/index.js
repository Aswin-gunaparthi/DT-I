import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('../sample'));

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;
const FINDWORK_API_KEY = process.env.FINDWORK_API_KEY;

app.get('/api/jobs', async (req, res) => {
  const skill = req.query.skill;
  if (!skill) return res.status(400).json({ error: 'Skill is required' });

  try {
    const remotiveRes = await axios.get(
      `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(skill)}`
    );

    const remotiveJobs = remotiveRes.data.jobs.map(job => ({
      source: 'Remotive',
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location,
      applyLink: job.url,
      fallback: `https://remotive.com/remote-jobs?search=${encodeURIComponent(skill)}`
    }));

    const adzunaRes = await axios.get(
      'https://api.adzuna.com/v1/api/jobs/in/search/1',
      {
        params: {
          app_id: ADZUNA_APP_ID,
          app_key: ADZUNA_API_KEY,
          what: skill,
          results_per_page: 10
        }
      }
    );

    const adzunaJobs = adzunaRes.data.results.map(job => ({
      source: 'Adzuna',
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      applyLink: job.redirect_url,
      fallback: `https://www.adzuna.in/search?q=${encodeURIComponent(skill)}`
    }));

    const arbeitRes = await axios.get(
      'https://www.arbeitnow.com/api/job-board-api'
    );

    const arbeitJobs = arbeitRes.data.data
      .filter(job =>
        job.tags.join(' ').toLowerCase().includes(skill.toLowerCase())
      )
      .slice(0, 10)
      .map(job => ({
        source: 'Arbeitnow',
        title: job.title,
        company: job.company_name,
        location: job.location,
        applyLink: job.url,
        fallback: 'https://www.arbeitnow.com/jobs'
      }));

    const findworkRes = await axios.get(
      `https://findwork.dev/api/jobs/?search=${encodeURIComponent(skill)}`,
      {
        headers: {
          Authorization: `Token ${FINDWORK_API_KEY}`
        }
      }
    );

    const findworkJobs = findworkRes.data.results.map(job => ({
      source: 'Findwork',
      title: job.role,
      company: job.company_name,
      location: job.location || 'Remote',
      applyLink: job.url,
      fallback: `https://findwork.dev/?search=${encodeURIComponent(skill)}`
    }));

    res.json([
      ...remotiveJobs,
      ...adzunaJobs,
      ...arbeitJobs,
      ...findworkJobs
    ]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching jobs' });
  }
});

app.listen(5000, () => {
  console.log('Server running at http://localhost:5000');
});