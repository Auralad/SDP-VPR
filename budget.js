document.addEventListener('DOMContentLoaded', function () {

    const API_URL = "http://localhost/api/index.php?route=konten";
    const canvas = document.getElementById('kreisDiagramm');

    fetch(API_URL)
        .then(res => res.json())
        .then(accounts => {

            if (!Array.isArray(accounts) || accounts.length === 0) {
                console.error("Keine Konten vorhanden");
                return;
            }

            // 🔹 Labels & Werte
            const labels = accounts.map(acc => acc.kartenname);
            const values = accounts.map(acc => Number(acc.balance));

            // 🔹 Gesamtbetrag
            const total = values.reduce((a, b) => a + b, 0);

            // 🔹 Farben automatisch
            const colors = labels.map((_, i) =>
                `hsl(${i * 360 / labels.length}, 70%, 55%)`
            );

            // 🔹 Pie Chart
            if (canvas && typeof Chart !== 'undefined') {
                const ctx = canvas.getContext('2d');

                new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: values,
                            backgroundColor: colors
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        const value = context.raw;
                                        const percent = ((value / total) * 100).toFixed(1);
                                        return `${context.label}: ${percent}%`;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        })
        .catch(err => console.error("API Fehler:", err));
});