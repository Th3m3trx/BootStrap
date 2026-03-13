const STAT_LABELS = {
  hp: "Health",
  mana: "Mana",
  attackDamage: "Attack Damage",
  abilityPower: "Ability Power",
  attackSpeed: "Attack Speed",
  armor: "Armor",
  magicResist: "Magic Resist",
  moveSpeed: "Move Speed",
  abilityHaste: "Ability Haste",
  critChance: "Crit Chance",
  lethality: "Lethality",
  magicPenFlat: "Magic Pen (Flat)",
};

const CHAMPIONS = [
  {
    name: "Ahri",
    stats: {
      hp: 590,
      mana: 418,
      attackDamage: 53,
      abilityPower: 0,
      attackSpeed: 0.668,
      armor: 21,
      magicResist: 30,
      moveSpeed: 330,
      abilityHaste: 0,
      critChance: 0,
      lethality: 0,
      magicPenFlat: 0,
    },
  },
  {
    name: "Jinx",
    stats: {
      hp: 630,
      mana: 260,
      attackDamage: 59,
      abilityPower: 0,
      attackSpeed: 0.625,
      armor: 26,
      magicResist: 30,
      moveSpeed: 325,
      abilityHaste: 0,
      critChance: 0,
      lethality: 0,
      magicPenFlat: 0,
    },
  },
  {
    name: "Garen",
    stats: {
      hp: 690,
      mana: 0,
      attackDamage: 69,
      abilityPower: 0,
      attackSpeed: 0.625,
      armor: 38,
      magicResist: 32,
      moveSpeed: 340,
      abilityHaste: 0,
      critChance: 0,
      lethality: 0,
      magicPenFlat: 0,
    },
  },
  {
    name: "Lee Sin",
    stats: {
      hp: 645,
      mana: 200,
      attackDamage: 69,
      abilityPower: 0,
      attackSpeed: 0.651,
      armor: 36,
      magicResist: 32,
      moveSpeed: 345,
      abilityHaste: 0,
      critChance: 0,
      lethality: 0,
      magicPenFlat: 0,
    },
  },
  {
    name: "Lux",
    stats: {
      hp: 560,
      mana: 480,
      attackDamage: 54,
      abilityPower: 0,
      attackSpeed: 0.669,
      armor: 21,
      magicResist: 30,
      moveSpeed: 330,
      abilityHaste: 0,
      critChance: 0,
      lethality: 0,
      magicPenFlat: 0,
    },
  },
];

const MODIFIERS = {
  items: [
    { name: "Rabadon's Deathcap", add: { abilityPower: 140 } },
    { name: "Infinity Edge", add: { attackDamage: 80, critChance: 25 } },
    { name: "Stormsurge", add: { abilityPower: 95, moveSpeed: 4 } },
    { name: "Black Cleaver", add: { attackDamage: 40, hp: 400, abilityHaste: 20 } },
    { name: "Youmuu's Ghostblade", add: { attackDamage: 60, lethality: 18, moveSpeed: 4 } },
    { name: "Zhonya's Hourglass", add: { abilityPower: 105, armor: 50 } },
  ],
  dragons: [
    { name: "Infernal Dragon Soul", addPercent: { attackDamage: 0.18, abilityPower: 0.18 } },
    { name: "Mountain Dragon Soul", addPercent: { armor: 0.12, magicResist: 0.12 } },
    { name: "Cloud Dragon Soul", addPercent: { moveSpeed: 0.07 } },
    { name: "Hextech Dragon Soul", add: { abilityHaste: 15, attackSpeed: 0.1 } },
  ],
  buffs: [
    { name: "Baron Nashor Buff", add: { attackDamage: 40, abilityPower: 40 } },
    { name: "Elixir of Sorcery", add: { abilityPower: 50 } },
    { name: "Conqueror (Fully Stacked)", addPercent: { attackDamage: 0.05, abilityPower: 0.05 } },
    { name: "Lethal Tempo (Stacked)", addPercent: { attackSpeed: 0.25 } },
  ],
};

const state = {
  selectedChampion: CHAMPIONS[0].name,
  selectedLevel: 18,
  selectedModifiers: new Set(),
  customModifiers: [],
};

const championSelect = document.querySelector("#championSelect");
const championLevel = document.querySelector("#championLevel");
const statTableBody = document.querySelector("#statTableBody");
const activeEffects = document.querySelector("#activeEffects");
const customStat = document.querySelector("#customStat");
const customList = document.querySelector("#customList");

function buildChampionOptions() {
  CHAMPIONS.forEach((champion) => {
    const option = document.createElement("option");
    option.value = champion.name;
    option.textContent = champion.name;
    championSelect.append(option);
  });
}

function buildModifierSection(containerId, entries, type) {
  const container = document.querySelector(`#${containerId}`);
  entries.forEach((entry, index) => {
    const id = `${type}-${index}`;
    const wrapper = document.createElement("label");
    wrapper.className = "modifier-chip";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.dataset.modifierId = id;

    const text = document.createElement("span");
    text.textContent = entry.name;

    wrapper.append(input, text);
    container.append(wrapper);

    input.addEventListener("change", () => {
      if (input.checked) {
        state.selectedModifiers.add(id);
      } else {
        state.selectedModifiers.delete(id);
      }
      render();
    });
  });
}

function buildCustomStatOptions() {
  Object.entries(STAT_LABELS).forEach(([stat, label]) => {
    const option = document.createElement("option");
    option.value = stat;
    option.textContent = label;
    customStat.append(option);
  });
}

function getChampionStats() {
  const champion = CHAMPIONS.find((entry) => entry.name === state.selectedChampion);
  const stats = structuredClone(champion.stats);
  const multiplier = 1 + (state.selectedLevel - 1) * 0.035;

  ["hp", "mana", "attackDamage", "armor", "magicResist"].forEach((stat) => {
    stats[stat] *= multiplier;
  });

  return stats;
}

function applyModifier(target, modifier) {
  if (modifier.add) {
    Object.entries(modifier.add).forEach(([stat, value]) => {
      target[stat] += value;
    });
  }

  if (modifier.addPercent) {
    Object.entries(modifier.addPercent).forEach(([stat, value]) => {
      target[stat] += target[stat] * value;
    });
  }
}

function collectActiveModifiers() {
  const selected = [];
  Object.entries(MODIFIERS).forEach(([type, list]) => {
    list.forEach((modifier, index) => {
      const id = `${type}-${index}`;
      if (state.selectedModifiers.has(id)) {
        selected.push(modifier);
      }
    });
  });
  return [...selected, ...state.customModifiers];
}

function computeStats() {
  const base = getChampionStats();
  const final = structuredClone(base);
  const active = collectActiveModifiers();
  active.forEach((modifier) => applyModifier(final, modifier));
  return { base, final, active };
}

function formatStat(stat, value) {
  if (["attackSpeed"].includes(stat)) return value.toFixed(3);
  if (["critChance"].includes(stat)) return `${value.toFixed(1)}%`;
  return value.toFixed(1);
}

function renderStatTable(base, final) {
  statTableBody.innerHTML = "";
  Object.keys(STAT_LABELS).forEach((stat) => {
    const delta = final[stat] - base[stat];
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${STAT_LABELS[stat]}</td>
      <td>${formatStat(stat, base[stat])}</td>
      <td>${formatStat(stat, final[stat])}</td>
      <td class="${delta >= 0 ? "text-success" : "text-danger"}">${delta >= 0 ? "+" : ""}${formatStat(stat, delta)}</td>
    `;
    statTableBody.append(row);
  });
}

function renderActiveEffects(active) {
  activeEffects.innerHTML = "";
  if (!active.length) {
    const li = document.createElement("li");
    li.className = "list-group-item bg-black text-secondary border-secondary";
    li.textContent = "No effects selected yet.";
    activeEffects.append(li);
    return;
  }

  active.forEach((modifier) => {
    const li = document.createElement("li");
    li.className = "list-group-item bg-black text-light border-secondary";
    li.textContent = modifier.name;
    activeEffects.append(li);
  });
}

function renderCustomModifiers() {
  customList.innerHTML = "";

  state.customModifiers.forEach((modifier, index) => {
    const stat = Object.keys(modifier.add || modifier.addPercent || {})[0];
    const amount = modifier.add?.[stat] ?? modifier.addPercent?.[stat] ?? 0;

    const li = document.createElement("li");
    li.className = "list-group-item bg-black text-light border-secondary d-flex justify-content-between";
    li.innerHTML = `<span>${modifier.name}: ${STAT_LABELS[stat]} ${amount}</span>`;

    const button = document.createElement("button");
    button.className = "btn btn-sm btn-outline-danger";
    button.textContent = "Remove";
    button.addEventListener("click", () => {
      state.customModifiers.splice(index, 1);
      render();
    });

    li.append(button);
    customList.append(li);
  });
}

function exportCsv(base, final) {
  const headers = ["Stat", "Base", "Final", "Delta"];
  const rows = Object.keys(STAT_LABELS).map((stat) => {
    const delta = final[stat] - base[stat];
    return [STAT_LABELS[stat], base[stat], final[stat], delta];
  });

  const csvText = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.selectedChampion.toLowerCase()}-stat-impact.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function render() {
  const { base, final, active } = computeStats();
  renderStatTable(base, final);
  renderActiveEffects(active);
  renderCustomModifiers();
}

buildChampionOptions();
buildModifierSection("itemList", MODIFIERS.items, "items");
buildModifierSection("dragonList", MODIFIERS.dragons, "dragons");
buildModifierSection("buffList", MODIFIERS.buffs, "buffs");
buildCustomStatOptions();
render();

championSelect.addEventListener("change", (event) => {
  state.selectedChampion = event.target.value;
  render();
});

championLevel.addEventListener("change", (event) => {
  const level = Number(event.target.value);
  state.selectedLevel = Math.min(18, Math.max(1, Number.isNaN(level) ? 18 : level));
  event.target.value = state.selectedLevel;
});

document.querySelector("#customModifierForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#customName").value.trim();
  const stat = document.querySelector("#customStat").value;
  const amount = Number(document.querySelector("#customAmount").value);

  if (!name || Number.isNaN(amount)) {
    return;
  }

  state.customModifiers.push({ name, add: { [stat]: amount } });
  event.target.reset();
  render();
});

document.querySelector("#resetBtn").addEventListener("click", () => {
  state.selectedModifiers.clear();
  state.customModifiers = [];
  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.checked = false;
  });
  render();
});

document.querySelector("#exportBtn").addEventListener("click", () => {
  const { base, final } = computeStats();
  exportCsv(base, final);
});
