const statusEl = document.getElementById('status');
const latestPriceEl = document.getElementById('latestPrice');
const dailyChangeEl = document.getElementById('dailyChange');
const rangeHighEl = document.getElementById('rangeHigh');
const rangeLowEl = document.getElementById('rangeLow');
const rangeSelect = document.getElementById('rangeSelect');
const refreshBtn = document.getElementById('refreshBtn');

const RANGE_DAYS = {
  '1m': 31,
  '3m': 93,
  '6m': 186,
  '1y': 366,
  '3y': 1096,
  '5y': 1827
};

let chart;

function formatUsd(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);
}

function parseCsv(csv) {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) {
    return [];
  }

  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const [date, open, high, low, close] = lines[i].split(',');
    const closeNum = Number(close);
    if (!date || Number.isNaN(closeNum)) {
      continue;
    }
    rows.push({
      date,
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: closeNum
    });
  }

  return rows;
}

function toDisplayDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function filterByRange(rows, rangeKey) {
  const days = RANGE_DAYS[rangeKey] || RANGE_DAYS['6m'];
  return rows.slice(-days);
}

function updateStats(rows) {
  const latest = rows[rows.length - 1];
  const previous = rows[rows.length - 2] || latest;

  const change = latest.close - previous.close;
  const changePct = previous.close === 0 ? 0 : (change / previous.close) * 100;

  const highs = rows.map((row) => row.high);
  const lows = rows.map((row) => row.low);

  latestPriceEl.textContent = formatUsd(latest.close);

  dailyChangeEl.classList.remove('up', 'down');
  dailyChangeEl.classList.add(change >= 0 ? 'up' : 'down');
  dailyChangeEl.textContent = `${change >= 0 ? '+' : ''}${formatUsd(change)} (${changePct.toFixed(2)}%)`;

  rangeHighEl.textContent = formatUsd(Math.max(...highs));
  rangeLowEl.textContent = formatUsd(Math.min(...lows));
}

function renderChart(rows) {
  const labels = rows.map((row) => toDisplayDate(row.date));
  const data = rows.map((row) => row.close);

  if (chart) {
    chart.destroy();
  }

  const ctx = document.getElementById('goldChart');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Gold Price (USD/oz)',
          data,
          borderColor: '#c98900',
          borderWidth: 2.5,
          pointRadius: 0,
          pointHitRadius: 12,
          fill: true,
          tension: 0.24,
          backgroundColor: (context) => {
            const { chart: chartCtx } = context;
            const { ctx, chartArea } = chartCtx;
            if (!chartArea) {
              return 'rgba(201, 137, 0, 0.26)';
            }
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(201, 137, 0, 0.38)');
            gradient.addColorStop(1, 'rgba(201, 137, 0, 0.02)');
            return gradient;
          }
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            boxWidth: 12
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (ctx) => ` ${formatUsd(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 8,
            autoSkip: true
          },
          grid: {
            color: 'rgba(18, 18, 18, 0.06)'
          }
        },
        y: {
          ticks: {
            callback: (value) => formatUsd(value)
          },
          grid: {
            color: 'rgba(18, 18, 18, 0.06)'
          }
        }
      }
    }
  });
}

async function loadData() {
  statusEl.textContent = 'Loading data...';
  refreshBtn.disabled = true;

  try {
    const response = await fetch('https://stooq.com/q/d/l/?s=gc.f&i=d', {
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error(`Data fetch failed: ${response.status}`);
    }

    const csv = await response.text();
    const parsed = parseCsv(csv);
    if (!parsed.length) {
      throw new Error('No data rows returned from source');
    }

    const rows = filterByRange(parsed, rangeSelect.value);
    updateStats(rows);
    renderChart(rows);

    const last = rows[rows.length - 1];
    statusEl.textContent = `Updated: ${toDisplayDate(last.date)} (${rows.length} points)`;
  } catch (error) {
    statusEl.textContent = `Error loading data: ${error.message}`;
  } finally {
    refreshBtn.disabled = false;
  }
}

rangeSelect.addEventListener('change', loadData);
refreshBtn.addEventListener('click', loadData);

loadData();
