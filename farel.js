const QUALITY_PTS = { "Common": 1, "Good": 2, "Sturdy": 3, "Rare": 4, "Perfect": 5, "Scarce": 6, "Epic": 8, "Legendary": 10, "Immortal": 14, "Myth": 20, "Eternal": 28, "Celestial": 36 };
const ELIXIR_VALS = { "HP": 21500, "Attack": 215, "Critical Damage": 0.01, "Talisman Damage": 0.001, "Skill Damage": 0.002 };
const UNITS = { "-": 1, "K": 1e3, "M": 1e6, "B": 1e9, "T": 1e12, "Qa": 1e15 };

let e1HistoryData = [];

window.onload = () => {
    initUnitSelects();
    initElixirInputs();
    showSection('wings');
};

function initUnitSelects() {
    document.querySelectorAll('.unit-select').forEach(sel => {
        Object.keys(UNITS).forEach(u => {
            let opt = document.createElement('option');
            opt.value = u; opt.innerText = u;
            sel.appendChild(opt);
        });
    });
}

function initElixirInputs() {
    const e1Box = document.getElementById('e1-inputs');
    const e2Box = document.getElementById('c2-stock-inputs');
    const e2Prior = document.getElementById('c2-prior');

    Object.keys(QUALITY_PTS).forEach(q => {
        let opt = document.createElement('option');
        opt.value = q; opt.innerText = q;
        e2Prior.appendChild(opt);

        [e1Box, e2Box].forEach(box => {
            let div = document.createElement('div');
            div.className = 'flex-row';
            div.style.alignItems = "center";
            div.innerHTML = `<label style="width:110px; margin:0">${q}</label><input type="number" id="${box.id.includes('e1') ? 'e1-' : 'e2-'}${q}" value="0" style="margin:5px 0">`;
            box.appendChild(div);
        });
    });
    e2Prior.value = "Perfect";
}

function showSection(id) {
    document.querySelectorAll('.tool-section').forEach(s => s.style.display = 'none');
    const target = document.getElementById(id);
    target.style.display = 'block';
}

function togglePercent() {
    let char = document.getElementById('abs-type').value.includes("Damage") ? "%" : "";
    document.getElementById('abs-sym1').innerText = char;
    document.getElementById('abs-sym2').innerText = char;
}

function calculateWings() {
    let p = parseFloat(document.getElementById('wings-percent').value) || 0;
    let lvl = parseInt(document.getElementById('wings-level').value) || 1;
    let r = parseInt(document.getElementById('wings-rarity').value);
    let denom = (0.05 + (lvl-1)/18000) * (1 + (r-5)*0.1) * 6.25 * ((r-5)/7);
    let res = denom !== 0 ? (p / denom) / 100 : 0;
    document.getElementById('res-wings').innerText = res.toFixed(4).replace('.', ',');
}

function calculateAbsorb() {
    let abs = (parseFloat(document.getElementById('abs-val').value) || 0) * UNITS[document.getElementById('abs-unit').value];
    let maxAbs = (parseFloat(document.getElementById('abs-max').value) || 0) * UNITS[document.getElementById('abs-max-unit').value];
    let type = document.getElementById('abs-type').value;
    let res = Math.ceil(Math.max(0, (maxAbs - abs) / ELIXIR_VALS[type]));
    document.getElementById('res-abs').innerText = res.toLocaleString('id-ID') + " PTS";
}

function addE1History() {
    let type = document.getElementById('e1-type').value;
    let sub = 0;
    Object.keys(QUALITY_PTS).forEach(q => sub += (parseInt(document.getElementById('e1-'+q).value) || 0) * QUALITY_PTS[q]);
    if(sub > 0) {
        e1HistoryData.push({type, sub});
        updateE1Display();
        Object.keys(QUALITY_PTS).forEach(q => document.getElementById('e1-'+q).value = 0);
    }
}

function updateE1Display() {
    let hist = document.getElementById('e1-history');
    hist.innerHTML = ""; let gt = 0;
    e1HistoryData.forEach(i => {
        hist.innerHTML += `<div>[${i.type}] : ${i.sub.toLocaleString('id-ID')}</div>`;
        gt += i.sub;
    });
    document.getElementById('e1-total').innerText = "Grand Total: " + gt.toLocaleString('id-ID') + " PTS";
}

function resetE1() { e1HistoryData = []; updateE1Display(); }

function calculateOptimizer() {
    let target = (parseFloat(document.getElementById('c2-target').value) || 0) * UNITS[document.getElementById('c2-t-unit').value];
    let prior = document.getElementById('c2-prior').value;
    let dir = document.getElementById('c2-dir').value;
    let qs = Object.keys(QUALITY_PTS);
    let idx = qs.indexOf(prior);
    
    let order = dir === "Up" ? qs.slice(idx).concat(qs.slice(0, idx).reverse()) :
                dir === "Down" ? qs.slice(0, idx + 1).reverse().concat(qs.slice(idx + 1)) :
                [prior, ...qs.filter(q => q !== prior)];

    let rem = target; let used = {};
    order.forEach(q => {
        if(rem <= 0) return;
        let pval = QUALITY_PTS[q];
        let stock = parseInt(document.getElementById('e2-'+q).value) || 0;
        let needed = Math.floor(rem / pval);
        let actual = Math.min(needed, stock);
        if(actual > 0) { used[q] = actual; rem -= (actual * pval); }
        if(rem > 0 && rem < pval && (stock - actual) > 0) { used[q] = (used[q] || 0) + 1; rem -= pval; }
    });

    let resDiv = document.getElementById('c2-res-list');
    resDiv.innerHTML = "";
    Object.entries(used).forEach(([k, v]) => resDiv.innerHTML += `<div>${k.padEnd(12)} : ${v.toLocaleString('id-ID')}</div>`);
    
    let status = document.getElementById('c2-status');
    if(rem > 0) { 
        status.innerText = "Missing: " + Math.ceil(rem).toLocaleString('id-ID') + " PTS"; 
        status.style.background = "#450a0a"; status.style.color = "#f87171";
    } else { 
        status.innerText = "Target Reached!"; 
        status.style.background = "#064e3b"; status.style.color = "#34d399";
    }
// AUTO CALCULATE WINGS
document.querySelectorAll('#wings input, #wings select')
.forEach(el => {
    el.addEventListener('input', () => {
        calculateWings();
    });
});}