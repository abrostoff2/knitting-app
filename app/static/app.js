const statusEl = document.getElementById("status");
const yarnResultsEl = document.getElementById("yarnResults");
const patternResultsEl = document.getElementById("patternResults");

function setStatus(message) {
  statusEl.textContent = message;
}

async function searchYarns() {
  const query = document.getElementById("query").value.trim();
  if (!query) return;

  yarnResultsEl.innerHTML = "";
  patternResultsEl.innerHTML = "";
  setStatus("Searching yarns...");

  try {
    const res = await fetch(`/api/yarns/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const yarns = await res.json();

    if (yarns.length === 0) {
      setStatus("No yarns found.");
      return;
    }
    setStatus(`${yarns.length} yarn(s) found. Click one to see matching patterns.`);

    for (const yarn of yarns) {
      const li = document.createElement("li");
      li.textContent = `${yarn.name} — ${yarn.yarn_company_name ?? "unknown company"}`;
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = `weight: ${yarn.yarn_weight?.name ?? "?"} | rating: ${yarn.rating_average ?? "n/a"}`;
      li.appendChild(meta);
      li.addEventListener("click", () => loadPatterns(yarn.id));
      yarnResultsEl.appendChild(li);
    }
  } catch (err) {
    setStatus(`Error: ${err.message}`);
  }
}

async function loadPatterns(yarnId) {
  patternResultsEl.innerHTML = "";
  setStatus("Fetching similar yarns and patterns (this calls Ravelry ~11 times, may take a few seconds)...");

  try {
    const res = await fetch(`/api/yarns/${yarnId}/patterns`);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();

    setStatus(
      `Source yarn: ${data.source_yarn.name}. Found ${data.similar_yarns.length} similar yarn(s), ${data.patterns.length} pattern(s).`
    );

    for (const pattern of data.patterns) {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = `https://www.ravelry.com/patterns/library/${pattern.permalink}`;
      link.target = "_blank";
      link.textContent = pattern.name;
      li.appendChild(link);

      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = `by ${pattern.designer?.name ?? "unknown"} | free: ${pattern.free ?? "?"} | rating: ${pattern.rating_average ?? "n/a"}`;
      li.appendChild(meta);

      patternResultsEl.appendChild(li);
    }
  } catch (err) {
    setStatus(`Error: ${err.message}`);
  }
}

document.getElementById("searchBtn").addEventListener("click", searchYarns);
document.getElementById("query").addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchYarns();
});
