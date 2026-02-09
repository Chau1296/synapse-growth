const store = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const paths = {
  beginner: {
    name: 'Beginner Analyst',
    description: 'Build core fluency in SQL, statistics, and KPI literacy.',
    milestones: ['Complete SQL fundamentals', 'Ship one funnel analysis', 'Explain confidence intervals to a PM']
  },
  analyst: {
    name: 'Product Analyst',
    description: 'Drive decisions with experiments, segmentation, and narrative insights.',
    milestones: ['Design one A/B test', 'Build retention cohorts', 'Write an exec-ready recommendation memo']
  },
  senior: {
    name: 'Senior Analytics Lead',
    description: 'Own governance, modeling strategy, and org-level analytics standards.',
    milestones: ['Define metric dictionary', 'Set data quality SLA', 'Lead quarterly analytics roadmap']
  },
  growth: {
    name: 'Growth Strategist',
    description: 'Connect full lifecycle metrics to compounding SaaS growth loops.',
    milestones: ['Diagnose CAC vs LTV', 'Create expansion playbook', 'Improve NRR with a targeted experiment']
  }
};

const pathButtons = document.getElementById('pathButtons');
const pathDescription = document.getElementById('pathDescription');
const pathMilestones = document.getElementById('pathMilestones');
const pathProgress = document.getElementById('pathProgress');
let activePath = 'beginner';
let pathState = store.get('sg_path_progress', {});

function renderPathButtons() {
  pathButtons.innerHTML = '';
  Object.entries(paths).forEach(([key, value]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = value.name;
    btn.addEventListener('click', () => {
      activePath = key;
      renderPath();
    });
    pathButtons.appendChild(btn);
  });
}

function renderPath() {
  const p = paths[activePath];
  pathDescription.textContent = p.description;
  pathMilestones.innerHTML = '';

  const completed = pathState[activePath] || [];
  p.milestones.forEach((item, idx) => {
    const line = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = completed.includes(idx);
    cb.addEventListener('change', () => {
      const current = new Set(pathState[activePath] || []);
      if (cb.checked) {
        current.add(idx);
      } else {
        current.delete(idx);
      }
      pathState[activePath] = Array.from(current);
      store.set('sg_path_progress', pathState);
      renderPath();
    });

    line.append(cb, document.createTextNode(item));
    pathMilestones.appendChild(line);
  });

  const percent = Math.round((completed.length / p.milestones.length) * 100);
  pathProgress.textContent = `Progress: ${completed.length}/${p.milestones.length} (${percent}%)`;
}

const sqlChallenges = [
  {
    name: 'Weekly Active Users',
    prompt: 'Return weekly active users from events table grouped by week_start.',
    checks: [/select/i, /count\s*\(\s*distinct/i, /from\s+events/i, /group\s+by/i],
    expected: 'Expected shape:\nweek_start | wau\n2026-01-05 | 1204\n2026-01-12 | 1279'
  },
  {
    name: 'Trial to Paid Conversion',
    prompt: 'Calculate conversion rate from trial_started to subscription_started.',
    checks: [/trial_started/i, /subscription_started/i, /(join|case)/i, /(rate|conversion|\/)/i],
    expected: 'Expected shape:\nmonth | trial_users | paid_users | conversion_rate\n2026-01 | 840 | 202 | 24.0%'
  },
  {
    name: '30-day Retention Cohort',
    prompt: 'Build signup cohort retention at day 30.',
    checks: [/cohort|signup/i, /day|date/i, /(join|window|over)/i, /retention|retained/i],
    expected: 'Expected shape:\ncohort_week | users | retained_d30 | retention_rate\n2026-01-06 | 500 | 212 | 42.4%'
  }
];

const sqlChallengeEl = document.getElementById('sqlChallenge');
const sqlQueryEl = document.getElementById('sqlQuery');
const sqlFeedbackEl = document.getElementById('sqlFeedback');
const sqlExpectedEl = document.getElementById('sqlExpected');

function initSqlLab() {
  sqlChallenges.forEach((c, idx) => {
    const option = document.createElement('option');
    option.value = String(idx);
    option.textContent = c.name;
    sqlChallengeEl.appendChild(option);
  });

  function setPrompt() {
    const challenge = sqlChallenges[Number(sqlChallengeEl.value)];
    sqlQueryEl.placeholder = challenge.prompt;
    sqlExpectedEl.textContent = challenge.expected;
  }

  sqlChallengeEl.addEventListener('change', setPrompt);
  setPrompt();

  document.getElementById('runSqlCheck').addEventListener('click', () => {
    const challenge = sqlChallenges[Number(sqlChallengeEl.value)];
    const query = sqlQueryEl.value;
    const hits = challenge.checks.filter((re) => re.test(query)).length;
    const score = Math.round((hits / challenge.checks.length) * 100);

    if (!query.trim()) {
      sqlFeedbackEl.textContent = 'Write a query first.';
      return;
    }

    if (score >= 75) {
      sqlFeedbackEl.textContent = `Pass (${score}): query includes core analytical structure.`;
    } else {
      sqlFeedbackEl.textContent = `Needs revision (${score}): include key entities and aggregation logic from the prompt.`;
    }
  });
}

const caseStage = document.getElementById('caseStage');
const caseIssue = document.getElementById('caseIssue');
const caseConstraint = document.getElementById('caseConstraint');
const caseScenario = document.getElementById('caseScenario');
const caseResponse = document.getElementById('caseResponse');
const caseScore = document.getElementById('caseScore');
const caseModel = document.getElementById('caseModel');

function renderScenario() {
  caseScenario.textContent = `Scenario: A ${caseStage.value} SaaS company faces ${caseIssue.value.toLowerCase()}. Constraint: ${caseConstraint.value || 'not specified'}. Provide diagnosis, metric plan, and first experiment.`;
}

caseStage.addEventListener('change', renderScenario);
caseIssue.addEventListener('change', renderScenario);
caseConstraint.addEventListener('input', renderScenario);

document.getElementById('scoreCase').addEventListener('click', () => {
  const response = caseResponse.value.toLowerCase();
  const rubric = ['hypothesis', 'metric', 'segment', 'experiment', 'risk'];
  const matched = rubric.filter((k) => response.includes(k)).length;
  const lengthScore = response.length > 260 ? 2 : 1;
  const total = Math.min(10, matched * 2 + lengthScore);
  caseScore.textContent = `Case score: ${total}/10`;
  caseModel.textContent = 'Model answer pattern: frame 2 hypotheses, define leading+guardrail metrics, segment high-risk users, run one scoped experiment, and include execution risks.';
});

renderScenario();

const expOut = document.getElementById('experimentOutput');
let latestExperiment = '';

function buildExperimentText() {
  latestExperiment = [
    '# Experiment Plan',
    `Hypothesis: ${document.getElementById('expHypothesis').value || 'N/A'}`,
    `Primary Metric: ${document.getElementById('expPrimaryMetric').value || 'N/A'}`,
    `Guardrail Metric: ${document.getElementById('expGuardrail').value || 'N/A'}`,
    `Target Segment: ${document.getElementById('expSegment').value || 'N/A'}`,
    `Sample Size Assumption: ${document.getElementById('expSample').value || 'N/A'}`,
    'Execution: Define launch window, instrumentation checks, and owner for readout.'
  ].join('\n');
  expOut.textContent = latestExperiment;
}

document.getElementById('buildExperiment').addEventListener('click', buildExperimentText);
document.getElementById('downloadExperiment').addEventListener('click', () => {
  if (!latestExperiment) {
    buildExperimentText();
  }
  const blob = new Blob([latestExperiment], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'experiment-plan.md';
  a.click();
  URL.revokeObjectURL(url);
});

const metricState = store.get('sg_metrics', []);
const historyState = store.get('sg_metric_history', []);
const metricTable = document.getElementById('metricTable');
const metricHistory = document.getElementById('metricHistory');

function renderMetrics() {
  if (!metricState.length) {
    metricTable.innerHTML = '<p class="muted">No metrics yet.</p>';
  } else {
    const rows = metricState
      .map((m) => `<tr><td>${m.name}</td><td>${m.formula}</td><td>${m.owner}</td><td>${m.cadence}</td></tr>`)
      .join('');
    metricTable.innerHTML = `<table class="table"><thead><tr><th>Name</th><th>Formula</th><th>Owner</th><th>Cadence</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  metricHistory.innerHTML = historyState.slice(-5).reverse().map((h) => `<div>${h}</div>`).join('');
}

function addOrUpdateMetric() {
  const name = document.getElementById('metricName').value.trim();
  const owner = document.getElementById('metricOwner').value.trim();
  const formula = document.getElementById('metricFormula').value.trim();
  const cadence = document.getElementById('metricCadence').value.trim();
  const alert = document.getElementById('metricAlert');

  if (!name || !formula) {
    alert.textContent = 'Metric name and formula are required.';
    return;
  }

  const idx = metricState.findIndex((m) => m.name.toLowerCase() === name.toLowerCase());
  const stamp = new Date().toLocaleString();

  if (idx >= 0) {
    const changedFormula = metricState[idx].formula !== formula;
    metricState[idx] = { name, owner, formula, cadence };
    alert.textContent = changedFormula ? 'Updated existing metric. Formula changed alert triggered.' : 'Updated existing metric.';
    historyState.push(`${stamp}: Updated ${name}${changedFormula ? ' (formula changed)' : ''}`);
  } else {
    metricState.push({ name, owner, formula, cadence });
    alert.textContent = 'Added new metric.';
    historyState.push(`${stamp}: Added ${name}`);
  }

  store.set('sg_metrics', metricState);
  store.set('sg_metric_history', historyState);
  renderMetrics();
}

document.getElementById('addMetric').addEventListener('click', addOrUpdateMetric);
renderMetrics();

const dashboards = [
  { name: 'Executive Pulse', role: 'executive', kpis: 'ARR, NRR, payback, gross churn' },
  { name: 'Activation Control Room', role: 'pm', kpis: 'Signup -> activation funnel, time-to-value' },
  { name: 'Analytics QA Monitor', role: 'analyst', kpis: 'Data freshness, null rates, schema drift' },
  { name: 'Customer Health Deck', role: 'cs', kpis: 'Adoption depth, at-risk accounts, expansion signals' }
];

const dashboardCards = document.getElementById('dashboardCards');
const dashboardRole = document.getElementById('dashboardRole');

function renderDashboards() {
  const role = dashboardRole.value;
  const visible = dashboards.filter((d) => role === 'all' || d.role === role);
  dashboardCards.innerHTML = visible
    .map((d) => `<article class="card"><h4>${d.name}</h4><p>Role: ${d.role}</p><p>KPIs: ${d.kpis}</p></article>`)
    .join('');
}

dashboardRole.addEventListener('change', renderDashboards);
renderDashboards();

const practiceBank = {
  easy: [
    { q: 'Define one leading indicator for retention.', keys: ['activation'], explain: 'Leading indicators are early behavior signals, like activation.' }
  ],
  medium: [
    { q: 'How would you diagnose a sudden week-over-week churn spike?', keys: ['segment', 'cohort', 'hypothesis'], explain: 'Start with segmented cohorts and hypotheses before interventions.' }
  ],
  hard: [
    { q: 'Design an experiment to improve NRR without harming gross churn.', keys: ['guardrail', 'expansion', 'risk'], explain: 'Balance expansion goals with churn guardrails and explicit risk checks.' }
  ]
};

let currentPractice = null;
let streak = store.get('sg_streak', 0);
const practicePrompt = document.getElementById('practicePrompt');
const practiceFeedback = document.getElementById('practiceFeedback');
const practiceStreak = document.getElementById('practiceStreak');

function updateStreak() {
  practiceStreak.textContent = `Current streak: ${streak}`;
}

function newPractice() {
  const difficulty = document.getElementById('practiceDifficulty').value;
  const pool = practiceBank[difficulty];
  currentPractice = pool[Math.floor(Math.random() * pool.length)];
  practicePrompt.textContent = currentPractice.q;
  practiceFeedback.textContent = '';
  document.getElementById('practiceAnswer').value = '';
}

document.getElementById('newPractice').addEventListener('click', newPractice);
document.getElementById('submitPractice').addEventListener('click', () => {
  if (!currentPractice) {
    practiceFeedback.textContent = 'Generate a challenge first.';
    return;
  }

  const answer = document.getElementById('practiceAnswer').value.toLowerCase();
  const hits = currentPractice.keys.filter((k) => answer.includes(k)).length;

  if (hits >= 2) {
    streak += 1;
    practiceFeedback.textContent = `Strong answer. ${currentPractice.explain}`;
  } else {
    streak = 0;
    practiceFeedback.textContent = `Needs more depth. Include: ${currentPractice.keys.join(', ')}`;
  }

  store.set('sg_streak', streak);
  updateStreak();
});

newPractice();
updateStreak();

const projects = [
  {
    name: 'Activation Recovery Sprint',
    milestones: ['Instrument funnel events', 'Segment by ICP', 'Propose 2 experiments', 'Readout with impact forecast']
  },
  {
    name: 'Retention Intelligence System',
    milestones: ['Build cohorts', 'Define risk score', 'Set alert thresholds', 'Publish exec summary']
  },
  {
    name: 'Revenue Expansion Map',
    milestones: ['Model NRR drivers', 'Identify expansion pockets', 'Design CS playbook', 'Track quarterly lift']
  }
];

const projectTrack = document.getElementById('projectTrack');
const projectMilestones = document.getElementById('projectMilestones');
const projectProgress = document.getElementById('projectProgress');
let workspace = store.get('sg_workspace', { selected: 0, done: {}, notes: '', memo: '' });

projects.forEach((p, idx) => {
  const opt = document.createElement('option');
  opt.value = String(idx);
  opt.textContent = p.name;
  projectTrack.appendChild(opt);
});

function renderWorkspace() {
  const idx = Number(projectTrack.value || workspace.selected || 0);
  const project = projects[idx];
  const done = new Set(workspace.done[idx] || []);
  projectMilestones.innerHTML = '';

  project.milestones.forEach((m, i) => {
    const line = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = done.has(i);
    cb.addEventListener('change', () => {
      if (cb.checked) {
        done.add(i);
      } else {
        done.delete(i);
      }
      workspace.done[idx] = Array.from(done);
      store.set('sg_workspace', workspace);
      renderWorkspace();
    });
    line.append(cb, document.createTextNode(m));
    projectMilestones.appendChild(line);
  });

  const percent = Math.round((done.size / project.milestones.length) * 100);
  projectProgress.textContent = `Project progress: ${done.size}/${project.milestones.length} (${percent}%)`;
}

projectTrack.value = String(workspace.selected || 0);
document.getElementById('projectNotes').value = workspace.notes || '';
document.getElementById('projectMemo').value = workspace.memo || '';

projectTrack.addEventListener('change', () => {
  workspace.selected = Number(projectTrack.value);
  store.set('sg_workspace', workspace);
  renderWorkspace();
});

document.getElementById('saveProject').addEventListener('click', () => {
  workspace.selected = Number(projectTrack.value);
  workspace.notes = document.getElementById('projectNotes').value;
  workspace.memo = document.getElementById('projectMemo').value;
  store.set('sg_workspace', workspace);
  renderWorkspace();
});

renderWorkspace();

const communityExamples = [
  'Peer review rubric: clarity, causality, metric integrity, actionability.',
  'Sample approach: Start with a metric tree before writing SQL.',
  'Great submissions quantify both upside and risk.'
];

const communityExamplesEl = document.getElementById('communityExamples');
communityExamplesEl.innerHTML = communityExamples.map((e) => `<article class="card"><p>${e}</p></article>`).join('');

const communityPosts = store.get('sg_community', []);
const communityBoard = document.getElementById('communityBoard');

function renderCommunity() {
  if (!communityPosts.length) {
    communityBoard.innerHTML = '<p class="muted">No posts yet.</p>';
    return;
  }
  communityBoard.innerHTML = communityPosts.slice().reverse().map((p) => `<article class="card"><h4>${p.title}</h4><p>${p.body}</p><p class="mono">${p.time}</p></article>`).join('');
}

document.getElementById('postCommunity').addEventListener('click', () => {
  const title = document.getElementById('communityTitle').value.trim();
  const body = document.getElementById('communityPost').value.trim();
  if (!title || !body) {
    return;
  }

  communityPosts.push({ title, body, time: new Date().toLocaleString() });
  store.set('sg_community', communityPosts);
  document.getElementById('communityTitle').value = '';
  document.getElementById('communityPost').value = '';
  renderCommunity();
});

renderCommunity();

const interviewBank = {
  sql: [
    'How would you compute rolling 7-day active users and why use window functions?',
    'Write a query to detect duplicate event ingestion by user and timestamp.'
  ],
  stats: [
    'When would you choose a one-tailed vs two-tailed test in product experiments?',
    'Explain Type I and Type II errors using an onboarding test example.'
  ],
  product: [
    'How do you choose a North Star metric for an early-stage SaaS product?',
    'What is your framework for diagnosing retention decline with limited data?' 
  ]
};

document.getElementById('getInterviewQ').addEventListener('click', () => {
  const topic = document.getElementById('interviewTopic').value;
  const pool = interviewBank[topic];
  const q = pool[Math.floor(Math.random() * pool.length)];
  document.getElementById('interviewQuestion').textContent = q;
});

document.getElementById('genPortfolio').addEventListener('click', () => {
  const domain = document.getElementById('portfolioDomain').value || 'B2B SaaS';
  const stack = document.getElementById('portfolioTool').value || 'SQL + BI';
  document.getElementById('portfolioIdea').textContent = `Portfolio idea: Build a ${domain} growth diagnostics app with ${stack}, including funnel, cohort retention, and expansion opportunity tracker.`;
});

document.getElementById('genBullet').addEventListener('click', () => {
  const action = document.getElementById('resumeAction').value || 'Built a lifecycle analytics model';
  const impact = document.getElementById('resumeImpact').value || 'improved retention insights and enabled faster decisions';
  document.getElementById('resumeBullet').textContent = `${action}, resulting in ${impact}.`;
});

renderPathButtons();
renderPath();
initSqlLab();
