const campus = {
  "A": {
    naam: "Gebouw A",
    label: "Onderwijs",
    verdiepingen: {
      1: [{code: "A1.01", vleugel: "Links"}, {code: "A1.02", vleugel: "Rechts"}],
      2: [{code: "A2.05", vleugel: "Midden"}, {code: "A2.08", vleugel : "Midden"}],
      3: [{code: "A3.12"}, {code: "A3.15"}]
    }
  },
  "B": {
    naam: "Gebouw B",
    label: "Onderwijs",
    verdiepingen: {
      1: [{code: "B1.24", vleugel: "Links"}, {code: "B1.25", vleugel: "Rechts"}],
      2: [{code: "B2.10", vleugel: "Links"}, {code: "B2.14"}]
    }
  },
  "T": {
    naam: "Gebouw T",
    label: "Techniek",
    verdiepingen: {
      1: [{code: "T1.05"}, {code: "T1.12"}],
      2: [{code: "T2.15"}, {code: "T2.20"}],
      3: [{code: "T3.20"}],
      4: [{code: "T4.17", vleugel: "Rechtervleugel"}, {code: "T4.18", vleugel: "Rechtervleugel"}]
    }
  },
  "C": {
    naam: "Gebouw C",
    label: "Communicatie",
    verdiepingen: {
      1: [{code: "C1.03"}, {code: "C1.08"}],
      2: [{code: "C2.05"}]
    }
  },
  "X": {
    naam: "Gebouw X",
    label: "Journalistiek",
    verdiepingen: {
      1: [{code: "X1.10"}, {code: "X1.22"}],
      2: [{code: "X2.07"}],
      3: [{code: "X3.14"}]
    }
  }
};

let currentStep = 0;
let selected = { gebouw: null, verdieping: null, lokaal: null };
const steps = ["home", "gebouw", "verdieping", "lokaal"];

function showStep(stepIndex) {
  steps.forEach((step, i) => {
    document.getElementById(step).style.display = i === stepIndex ? "block" : "none";
  });
  currentStep = stepIndex;
  updateStep();
}

function goBack() {
  if (currentStep > 0) showStep(currentStep - 1);
}

function goNext() {
  if (currentStep < 3) showStep(currentStep + 1);
}

function updateStep() {
  switch (currentStep) {
    case 1: renderGebouwen(); break;
    case 2: renderVerdiepingen(); break;
    case 3: renderLokalen(); break;
  }
  updateBreadcrumb();
}


function renderGebouwen() {
  const container = document.getElementById("gebouwen-list");
  container.innerHTML = "";
  Object.keys(campus).forEach(code => {
    const gebouw = campus[code];
    const card = document.createElement("div");
    card.className = "step-card" + (selected.gebouw === code ? " selected" : "");
    card.innerHTML = `<div class="code">${code}</div><div class="label">${gebouw.naam}</div>`;
    card.onclick = () => {
      selected.gebouw = code;
      renderGebouwen();
      goNext();
    };
    container.appendChild(card);
  });
}

function renderVerdiepingen() {
  const container = document.getElementById("verdiepingen-list");
  container.innerHTML = "";
  
  if (!selected.gebouw || !campus[selected.gebouw]) {
    container.innerHTML = "<p>Geen verdiepingen gevonden.</p>";
    return;
  }
  
  const verdiepingen = Object.keys(campus[selected.gebouw].verdiepingen)
    .map(v => parseInt(v))
    .sort((a, b) => a - b);
    
  verdiepingen.forEach(v => {
    const card = document.createElement("div");
    card.className = "step-card" + (selected.verdieping === v ? " selected" : "");
    card.innerHTML = `<div class="code">Verdieping ${v}</div>`;
    card.onclick = () => {
      selected.verdieping = v;
      renderVerdiepingen();
      goNext();
    };
    container.appendChild(card);
  });
}

function renderLokalen() {
  const container = document.getElementById("lokalen-list");
  container.innerHTML = "";
  
  if (!selected.gebouw || selected.verdieping === null) {
    container.innerHTML = "<p>Selecteer eerst een verdieping.</p>";
    return;
  }
  
  const lokalen = campus[selected.gebouw]?.verdiepingen[selected.verdieping] || [];
  
  lokalen.forEach(lokaal => {
    const card = document.createElement("div");
    card.className = "step-card" + (selected.lokaal?.code === lokaal.code ? " selected" : "");
    card.innerHTML = `
      <div class="code">${lokaal.code}</div>
      ${lokaal.vleugel ? `<div class="label">${lokaal.vleugel}</div>` : ""}
    `;
    card.onclick = () => {
      selected.lokaal = lokaal;
      renderLokalen();
    };
    container.appendChild(card);
  });
}

function startRoute() {
  if (selected.lokaal) {
    const path = `gebouw ${selected.gebouw}, verdieping ${selected.verdieping} - ${selected.lokaal.code}`;
    alert(`Route starten naar ${path}! `);
  }
}

function getSearchableItems() {
  const items = [];
  
  Object.keys(campus).forEach(code => {
    items.push({
      type: "gebouw",
      code: `Gebouw ${code}`,
      label: campus[code].label,
      gebouwData: code
    });
  });
  
  Object.keys(campus).forEach(gebouwCode => {
    Object.keys(campus[gebouwCode].verdiepingen).forEach(vdCode => {
      const verdieping = parseInt(vdCode);
      campus[gebouwCode].verdiepingen[vdCode].forEach(lokaal => {
        items.push({
          type: "lokaal",
          code: lokaal.code,
          gebouw: gebouwCode,
          verdieping,
          vleugel: lokaal.vleugel
        });
      });
    });
  });
  
  return items;
}

function updateBreadcrumb() {
  const bc = document.getElementById("breadcrumb");
  const bcGebouw = document.getElementById("bc-gebouw");
  const bcVerdieping = document.getElementById("bc-verdieping");
  const bcLokaal = document.getElementById("bc-lokaal");
  
  if (currentStep === 0) {
    bc.style.display = "none";
    return;
  }
  
  bc.style.display = "block";
  
  if (currentStep >= 2 && selected.gebouw) {
    bcGebouw.textContent = campus[selected.gebouw]?.naam || selected.gebouw;
    bcGebouw.className = "step-link";
    bcGebouw.onclick = () => showStep(2);
  } else {
    bcGebouw.textContent = "";
  }
  
  if (currentStep === 3 && selected.verdieping !== null) {
    bcVerdieping.textContent = `Verdieping ${selected.verdieping}`;
    bcVerdieping.className = "step-link";
    bcVerdieping.onclick = () => showStep(3);
  } else {
    bcVerdieping.textContent = "";
  }
 
  bcLokaal.textContent = "";
}

function renderResults(list) {
  const resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";
  if (list.length === 0 && document.getElementById("searchInput").value.trim() !== "") {
    resultsEl.innerHTML = "<p>Geen resultaten gevonden.</p>";
    return;
  }
  
  list.forEach(item => {
    const card = document.createElement("article");
    card.className = "result-card";
    
    if (item.type === "lokaal") {
      card.innerHTML = `
        <div class="result-code">${item.code}</div>
        <div class="result-meta">
          <span>${item.gebouw.naam}</span> · <span>Verdieping ${item.verdieping}</span>
          ${item.vleugel ? ` · <span>${item.vleugel}</span>` : ""}
        </div>
      `;
      card.onclick = () => {
        selected.gebouw = item.gebouw;
        selected.verdieping = item.verdieping;
        selected.lokaal = item;
        showStep(3);
        renderLokalen();
      };
    } else {
      card.innerHTML = `<div class="result-code">${item.code}</div><div class="result-meta">${item.label}</div>`;
      card.onclick = () => {
        selected.gebouw = item.gebouwData;
        showStep(2);
        renderGebouwen();
      };
    }
    resultsEl.appendChild(card);
  });
}

function filterSpaces(query) {
  const q = query.trim().toLowerCase();
  if (!q) return renderResults([]);
  
  const allItems = getSearchableItems();
  const matches = allItems.filter(item => 
    item.code.toLowerCase().includes(q) ||
    item.gebouw?.toLowerCase().includes(q)
  );
  renderResults(matches);
}


document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", e => filterSpaces(e.target.value));
  renderResults([]);
});