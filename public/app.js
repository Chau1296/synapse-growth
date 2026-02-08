const topicFilter = document.getElementById('topicFilter');
const searchInput = document.getElementById('searchInput');
const panels = Array.from(document.querySelectorAll('.panel'));
const caseList = document.getElementById('caseList');
const quizQuestion = document.getElementById('quizQuestion');
const quizAnswer = document.getElementById('quizAnswer');
const showAnswerBtn = document.getElementById('showAnswerBtn');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');
const projectPromptBtn = document.getElementById('projectPromptBtn');
const projectPromptText = document.getElementById('projectPromptText');
const resultCount = document.getElementById('resultCount');
const sparkLine = document.getElementById('sparkLine');

const sparkMessages = [
  'System sync: ask better questions.',
  'Navigator mode: map metrics to decisions.',
  'Builder mode: convert ideas into SQL.',
  'Strategist mode: frame insights for action.',
  'Probe mode: trace anomalies to root cause.'
];

const caseStudies = [
  {
    title: 'Onboarding Funnel Repair',
    context: 'A B2B SaaS team saw strong trial signup growth but flat activation.',
    actions: 'Mapped step-level funnel, segmented by ICP, and tested an onboarding checklist experiment.',
    impact: 'Activation rose from 27% to 35%; payback period improved through better realization of lead quality.'
  },
  {
    title: 'Churn Risk Forecasting',
    context: 'Customer success could not prioritize outreach effectively.',
    actions: 'Built a weekly churn risk score using product usage decline, support sentiment, and billing events.',
    impact: 'Saved 11 enterprise accounts in one quarter and improved net revenue retention.'
  },
  {
    title: 'Metric Dictionary Rollout',
    context: 'Finance and product reported conflicting MRR values.',
    actions: 'Defined governance owners, canonical SQL models, and dashboard certification rules.',
    impact: 'Removed reporting conflicts and cut executive meeting prep time by 40%.'
  }
];

const quizBank = [
  {
    q: 'Why is median often preferred over mean for SaaS deal-size reporting?',
    a: 'Median is robust to outliers, so a few large deals do not distort the typical customer pattern.'
  },
  {
    q: 'What is one guardrail metric to include in an activation experiment?',
    a: 'Short-term support ticket rate. Activation should improve without increasing onboarding confusion.'
  },
  {
    q: 'What should come first: dashboard building or metric definitions?',
    a: 'Metric definitions first. Dashboards built before definitions become inconsistent quickly.'
  },
  {
    q: 'How does a window function help in retention analysis?',
    a: 'It allows user-level ordering and period comparisons without collapsing rows too early.'
  }
];

const projectPrompts = [
  'Build a full funnel analysis for a SaaS trial flow:\n1) define stage conversion metrics\n2) identify largest drop-off\n3) propose two experiments and expected lift.',
  'Create a retention cohort model:\n1) weekly cohorts\n2) logo vs revenue retention\n3) segment by acquisition channel and interpret differences.',
  'Design a governance starter pack:\n1) critical metrics dictionary\n2) data quality checks\n3) owner map and incident escalation path.',
  'Produce an executive growth memo:\n1) diagnose churn and expansion trends\n2) quantify business impact\n3) prioritize next-quarter analytics roadmap.'
];

let quizIndex = 0;

function renderCases() {
  caseList.innerHTML = '';

  caseStudies.forEach((item) => {
    const wrap = document.createElement('article');
    wrap.className = 'case-item';

    const title = document.createElement('h3');
    title.textContent = item.title;

    const context = document.createElement('p');
    context.textContent = `Context: ${item.context}`;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Reveal approach & impact';

    const detail = document.createElement('p');
    detail.classList.add('is-hidden');
    detail.textContent = `Approach: ${item.actions} Impact: ${item.impact}`;

    btn.addEventListener('click', () => {
      const hidden = detail.classList.contains('is-hidden');
      detail.classList.toggle('is-hidden');
      btn.textContent = hidden ? 'Hide details' : 'Reveal approach & impact';
    });

    wrap.append(title, context, btn, detail);
    caseList.appendChild(wrap);
  });
}

function applyFilters() {
  const topic = topicFilter.value;
  const query = searchInput.value.trim().toLowerCase();

  let visibleCount = 0;

  panels.forEach((panel) => {
    const matchesTopic = topic === 'all' || panel.dataset.topic === topic;
    const panelText = panel.textContent.toLowerCase();
    const matchesQuery = query === '' || panelText.includes(query);
    const visible = matchesTopic && matchesQuery;

    panel.classList.toggle('is-hidden', !visible);

    if (visible) {
      visibleCount += 1;
    }
  });

  resultCount.textContent = `Showing ${visibleCount} card${visibleCount === 1 ? '' : 's'}`;
}

function loadQuiz(index) {
  const item = quizBank[index];
  quizQuestion.textContent = item.q;
  quizAnswer.textContent = '';
}

function nextQuiz() {
  quizIndex = (quizIndex + 1) % quizBank.length;
  loadQuiz(quizIndex);
}

showAnswerBtn.addEventListener('click', () => {
  quizAnswer.textContent = quizBank[quizIndex].a;
});

nextQuestionBtn.addEventListener('click', nextQuiz);

projectPromptBtn.addEventListener('click', () => {
  const choice = projectPrompts[Math.floor(Math.random() * projectPrompts.length)];
  projectPromptText.textContent = choice;
});

topicFilter.addEventListener('change', applyFilters);
searchInput.addEventListener('input', applyFilters);

panels.forEach((panel, index) => {
  panel.style.animationDelay = `${index * 55}ms`;
});

sparkLine.textContent = sparkMessages[Math.floor(Math.random() * sparkMessages.length)];

renderCases();
loadQuiz(quizIndex);
applyFilters();
