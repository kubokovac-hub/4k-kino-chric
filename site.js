const schedule = document.querySelector("#schedule");
const pastSchedule = document.querySelector("#past-schedule");
const events = Array.from(schedule.querySelectorAll(".event"));

function updateSchedule() {
  const now = Date.now();
  const upcoming = [];

  for (const event of events) {
    if (event.parentElement === pastSchedule) continue;

    const start = Date.parse(event.querySelector("time").dateTime);
    if (start >= now) {
      upcoming.push(event);
      continue;
    }

    event.classList.remove("next");
    for (const link of event.querySelectorAll("a")) {
      if (link.classList.contains("film-link")) {
        link.remove();
      } else {
        const label = document.createElement("span");
        label.textContent = link.firstChild.textContent.trim();
        link.replaceWith(label);
      }
    }
    pastSchedule.prepend(event);
  }

  for (const [index, event] of upcoming.entries()) {
    event.classList.toggle("next", index === 0);
  }

  const hasPast = pastSchedule.children.length > 0;
  document.querySelector("#historie").hidden = !hasPast;
  document.querySelector("#history-link").hidden = !hasPast || upcoming.length === 0;
  document.querySelector("#no-events").hidden = upcoming.length > 0;
  schedule.hidden = upcoming.length === 0;
}

updateSchedule();
window.setInterval(updateSchedule, 60_000);

const amountControls = document.querySelector("#amounts");
const qr = document.querySelector("#qr-image");
const download = document.querySelector("#qr-download");
const bankHint = document.querySelector("#bank-hint");

function selectAmount(amount) {
  const field = Array.from(amountControls.querySelectorAll("input")).find((input) => input.value === amount);
  if (!field) return;

  field.checked = true;
  const path = `assets/qr-${amount}.png`;
  const custom = amount === "vlastni";
  qr.src = path;
  qr.alt = custom ? "QR platba vstupného · vlastní částka" : `QR platba vstupného · ${amount} Kč`;
  download.href = path;
  download.download = `4k-kino-chric-qr-${amount}.png`;
  bankHint.textContent = custom
    ? "Načtěte QR v bankovní aplikaci a zadejte částku, kterou chcete poslat."
    : `Načtěte QR v bankovní aplikaci. Kód předvyplní ${amount} Kč. Částku můžete v aplikaci změnit.`;
}

amountControls.hidden = false;
amountControls.addEventListener("change", (event) => selectAmount(event.target.value));
schedule.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-amount]");
  if (link && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
    selectAmount(link.dataset.amount);
  }
});

if (navigator.clipboard?.writeText) {
  const copyButton = document.querySelector("#copy-account");
  const account = document.querySelector("#account");
  const status = document.querySelector("#copy-status");
  let resetLabel;

  copyButton.hidden = false;
  copyButton.addEventListener("click", async () => {
    window.clearTimeout(resetLabel);
    try {
      await navigator.clipboard.writeText(account.textContent);
      copyButton.textContent = "Zkopírováno";
      status.textContent = "Číslo účtu je ve schránce.";
    } catch {
      copyButton.textContent = "Zkopírujte ručně";
      status.textContent = "Označte a zkopírujte číslo účtu ručně.";
    }
    resetLabel = window.setTimeout(() => {
      copyButton.textContent = "Kopírovat";
      status.textContent = "";
    }, 3000);
  });
}
