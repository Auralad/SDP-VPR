document.addEventListener("DOMContentLoaded", () => {

    const monate = ["Juni", "Juli", "August", "September", "Oktober"];
    const ausgaben = [1200, 1350, 1100, 1500, 1400];

    const ctx = document.getElementById("monthlyChart");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: monate,
            datasets: [{
                label: "Ausgaben (€)",
                data: ausgaben,
                fill: false,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true }
            }
        }
    });

    const last = ausgaben[ausgaben.length - 1];
    const before = ausgaben[ausgaben.length - 2];
    const diff = last - before;

    const summary = document.getElementById("summaryText");
    summary.textContent =
        diff > 0
            ? `Letzter Monat: +${diff} € mehr Ausgaben als im Vormonat.`
            : `Letzter Monat: ${Math.abs(diff)} € weniger Ausgaben als im Vormonat.`;
});
