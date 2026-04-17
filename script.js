/* Navigation */
const pageMap = {
    live:      { nav: 'nav-live',      page: 'page-live',      title: 'Vehicle Recognition Feed' },
    logs:      { nav: 'nav-logs',      page: 'page-logs',      title: 'Historical Detection Records' },
    analytics: { nav: 'nav-analytics', page: 'page-analytics', title: 'System Analytics & Reporting' }
};

function showPage(key) {
    Object.entries(pageMap).forEach(([k, v]) => {
        document.getElementById(v.nav).classList.toggle('active', k === key);
        document.getElementById(v.page).classList.toggle('active', k === key);
    });
    document.getElementById('page-title').innerHTML = pageMap[key].title;
    if (key === 'analytics') setTimeout(drawChart, 50);
}

/* Live tab switching */
function switchLiveTab(viewId, el) {
    el.closest('.tabs').querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('view-livefeed').style.display    = viewId === 'livefeed'    ? 'block' : 'none';
    document.getElementById('view-uploadvideo').style.display = viewId === 'uploadvideo' ? 'flex'  : 'none';
}

/* File picker */
function triggerFileSelect() {
    document.getElementById('fileInput').click();
}

function handleFile(input) {
    if (!input.files || !input.files[0]) return;
    const url   = URL.createObjectURL(input.files[0]);
    const video = document.getElementById('uploadedVideo');
    video.src = url;
    video.style.display = 'block';
    document.getElementById('uploadPlaceholder').style.display = 'none';
    document.getElementById('uploadVideoCard').style.cursor    = 'default';
    document.getElementById('uploadVideoCard').onclick         = null;

    // Reset previous results
    document.getElementById('resultSection').classList.remove('active');
    document.getElementById('noPlatesBanner').style.display = 'none';
}

/* Upload and process */
async function uploadAndProcess() {
    const fileInput  = document.getElementById('fileInput');
    const startBtn   = document.getElementById('startBtn');
    const selectBtn  = document.getElementById('selectVideoBtn');
    const overlay    = document.getElementById('processingOverlay');
    const resultSec  = document.getElementById('resultSection');
    const noBanner   = document.getElementById('noPlatesBanner');

    if (!fileInput.files || !fileInput.files[0]) {
        alert('Please select a video file first!');
        return;
    }

    // --- Show loading state ---
    startBtn.disabled  = true;
    startBtn.style.opacity = '0.45';
    startBtn.style.cursor  = 'not-allowed';
    selectBtn.disabled = true;
    selectBtn.style.opacity = '0.45';
    overlay.classList.add('active');
    resultSec.classList.remove('active');
    noBanner.style.display = 'none';

    const formData = new FormData();
    formData.append('video', fileInput.files[0]);

    try {
        const response = await fetch('/upload_video', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Server error during processing.');
        }

        const plates   = data.result  || [];
        const videoUrl = data.video_url || null;

        if (videoUrl) {
            const resultVideo = document.getElementById('resultVideo');
            // Cache-bust so browser loads the fresh file
            resultVideo.src = videoUrl + '?t=' + Date.now();
            resultVideo.load();
            resultSec.classList.add('active');
        }

        if (plates.length === 0) {
            noBanner.style.display = 'flex';
        } else {
            updateLogsTable(plates);
            updateAnalytics(plates.length);
        }

    } catch (err) {
        console.error('ANPR error:', err);
        alert('Processing failed: ' + err.message);
    } finally {
        overlay.classList.remove('active');
        startBtn.disabled  = false;
        startBtn.style.opacity = '1';
        startBtn.style.cursor  = 'pointer';
        selectBtn.disabled = false;
        selectBtn.style.opacity = '1';
    }
}

/* Update Detection Logs table */
function updateLogsTable(plates) {
    const tableBody = document.getElementById('tableBody');
    const noRec = tableBody.querySelector('.no-records');
    if (noRec) noRec.remove();

    plates.forEach(plateInfo => {
        const row = document.createElement('div');
        row.className = 'table-row';
        row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:14px;';

        const ts          = new Date().toLocaleTimeString();
        const plateNumber = plateInfo.split(' (')[0];

        row.innerHTML = `
            <span style="color:#888;width:80px;">${ts}</span>
            <span style="color:#22c55e;font-weight:bold;width:110px;">${plateNumber}</span>
            <span style="flex-grow:1;color:#ccc;">Vehicle Detected</span>
            <span style="width:80px;color:#aaa;">CAM-01</span>
            <button class="export-btn" style="padding:4px 10px;font-size:11px;cursor:pointer;">View</button>
        `;
        tableBody.prepend(row);
    });
}

/* Update Analytics counts */
function updateAnalytics(count) {
    const total  = document.getElementById('statTotal');
    const unique = document.getElementById('statUnique');
    if (total)  total.textContent  = parseInt(total.textContent  || 0) + count;
    if (unique) unique.textContent = parseInt(unique.textContent || 0) + count;
}

/* Init system (Live Feed tab) */
function initSystem() {
    const label = document.getElementById('initLabel');
    const dot   = document.querySelector('.offline-dot');
    label.textContent = 'INITIALIZING...';
    setTimeout(() => {
        label.textContent = 'SYSTEM READY';
        dot.style.background = '#22c55e';
        dot.style.boxShadow  = '0 0 8px #22c55e';
        const badge = document.querySelector('.offline-badge');
        badge.childNodes.forEach(n => {
            if (n.nodeType === 3 && n.textContent.includes('OFFLINE'))
                n.textContent = '\u00a0ONLINE';
        });
    }, 1800);
}

/* Chart */
function drawChart() {
    const card   = document.getElementById('chartCard');
    const canvas = document.getElementById('chartCanvas');
    if (!canvas || !card) return;

    const dpr = window.devicePixelRatio || 1;
    const W   = card.clientWidth - 48;
    const H   = 260;

    canvas.width        = W * dpr;
    canvas.height       = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const padL = 44, padR = 16, padT = 10, padB = 34;
    const cW   = W - padL - padR;
    const cH   = H - padT - padB;
    const yMax = 4;

    ctx.font      = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#4a5e74';
    ctx.textAlign = 'right';

    for (let y = 0; y <= yMax; y++) {
        const cy = padT + cH - (y / yMax) * cH;
        ctx.strokeStyle = 'rgba(255,255,255,.055)';
        ctx.lineWidth   = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(padL, cy); ctx.lineTo(padL + cW, cy); ctx.stroke();
        ctx.fillText(y, padL - 8, cy + 4);
    }

    const cols = 12;
    ctx.textAlign = 'center';
    for (let i = 0; i <= cols; i++) {
        const cx = padL + (i / cols) * cW;
        ctx.strokeStyle = 'rgba(255,255,255,.055)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(cx, padT); ctx.lineTo(cx, padT + cH); ctx.stroke();
        const hr = (i * 2).toString().padStart(2, '0');
        ctx.fillStyle = '#4a5e74';
        ctx.fillText(hr + ':00', cx, padT + cH + 20);
    }

    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255,255,255,.12)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + cH);
    ctx.lineTo(padL + cW, padT + cH);
    ctx.stroke();
}

/* Date badge */
function displayCurrentDate() {
    const el    = document.getElementById('current-date');
    const today = new Date();
    el.textContent = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
}

displayCurrentDate();
window.addEventListener('load',   () => setTimeout(drawChart, 80));
window.addEventListener('resize', drawChart);
