// Reveal-on-scroll animations
const reveals = Array.from(document.querySelectorAll(".reveal"));
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("show"); });
}, { threshold: 0.12 });
reveals.forEach(el => io.observe(el));

// Demo: generate a polished MOM preview (not AI, but high-impact)
const rawNotes = document.getElementById("rawNotes");
const momOut = document.getElementById("momOut");
const makeMOM = document.getElementById("makeMOM");
const clearNotes = document.getElementById("clearNotes");

function escapeHTML(s){
  return (s || "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}

// Small heuristic: try to detect owners/dates from "Owner:" and "Due:"
function extractActionItems(text){
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const items = [];
  for (const l of lines){
    const ownerMatch = l.match(/owner\s*:\s*([^,;]+)/i);
    const dueMatch = l.match(/due\s*:\s*([^,;]+)/i);
    // treat any "to do" / "need" / "will" as candidate action
    if (/(to\s|need|action|follow|draft|send|create|decide)/i.test(l)){
      items.push({
        task: l.replace(/owner\s*:\s*[^,;]+/i,"").replace(/due\s*:\s*[^,;]+/i,"").trim(),
        owner: ownerMatch ? ownerMatch[1].trim() : "MISSING",
        due: dueMatch ? dueMatch[1].trim() : "MISSING"
      });
    }
  }
  return items.slice(0,6);
}

function generatePreview(text){
  const safe = escapeHTML(text);

  const actions = extractActionItems(text);
  const actionLines = actions.length
    ? actions.map((a,i) =>
        `<div class="kv">
          <span class="tag">#${i+1}</span>
          <span class="tag">Owner: ${escapeHTML(a.owner)}</span>
          <span class="tag">Due: ${escapeHTML(a.due)}</span>
        </div>
        <div class="txt" style="margin-top:8px;">${escapeHTML(a.task)}</div>`
      ).join(`<div style="height:10px;"></div>`)
    : `<div class="txt">No clear action items detected. Add lines like “Owner: Sam, Due: Friday”.</div>`;

  const missingCount = actions.filter(a => a.owner==="MISSING" || a.due==="MISSING").length;

  return `
    <div class="block">
      <h4>1) Summary</h4>
      <div class="txt">This meeting covered key deliverables and next steps. Items requiring ownership and timing are captured below for quick follow-through.</div>
    </div>

    <div class="block">
      <h4>2) Key Decisions</h4>
      <div class="txt">MISSING — add explicit decision lines (e.g., “Decision: use Runway for a 5s video”).</div>
    </div>

    <div class="block">
      <h4>3) Action Items (Owner + Due Date)</h4>
      ${actionLines}
      ${missingCount ? `<div style="height:10px;"></div><div class="txt">⚠️ ${missingCount} item(s) missing owner or due date. MinuteMate flags these instead of guessing.</div>` : ``}
    </div>

    <div class="block">
      <h4>4) Risks / Open Questions</h4>
      <div class="txt">• Owner(s) missing for some tasks<br>• Timeline dependencies may slip without due dates<br>• Clarify who generates the AI video and by when</div>
    </div>

    <div class="block">
      <h4>5) Follow-up Messages</h4>
      <div class="txt"><strong>Email:</strong><br>
Subject: Meeting Follow-up — Minutes & Next Steps<br>
Hi team, here are the minutes and action items from today. Please confirm missing owners/due dates so we can lock the plan.</div>
      <div style="height:10px;"></div>
      <div class="txt"><strong>Slack:</strong><br>
Quick recap posted ✅ Please confirm owners/due dates for the open items so we can move fast.</div>
    </div>

    <div class="block">
      <h4>Raw Notes (Reference)</h4>
      <div class="txt">${safe}</div>
    </div>
  `;
}

if (makeMOM && rawNotes && momOut){
  makeMOM.addEventListener("click", () => {
    const text = rawNotes.value.trim();
    if (!text){
      momOut.innerHTML = `<div class="mom-empty"><div class="spark"></div><p class="muted">Paste some notes first.</p></div>`;
      return;
    }
    momOut.innerHTML = generatePreview(text);
    momOut.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

if (clearNotes && rawNotes && momOut){
  clearNotes.addEventListener("click", () => {
    rawNotes.value = "";
    momOut.innerHTML = `<div class="mom-empty"><div class="spark"></div><p class="muted">Cleared. Paste notes and generate again.</p></div>`;
  });
}
