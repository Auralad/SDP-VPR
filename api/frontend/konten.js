document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "http://localhost/api/index.php?route=konten";
    const container = document.getElementById("konten-container");

    container.style.maxWidth = "600px";
    container.style.margin = "20px auto";
    container.style.fontFamily = "Arial, sans-serif";

    const listBox = document.createElement("div");
    listBox.style.border = "1px solid #ccc";
    listBox.style.padding = "10px";
    listBox.style.borderRadius = "6px";

    container.appendChild(listBox);

    function renderKonten(konten) {

        konten.forEach(k => {
            const box = document.createElement("div");
            box.style.padding = "8px";
            box.style.borderBottom = "1px solid #eee";

            box.innerHTML = `
                <strong>${k.kartenname}</strong><br>
                Kartennummer: ${k.kartennummer}<br>
                Balance: ${Number(k.balance).toFixed(2)} €
            `;

            listBox.appendChild(box);
        });
    }

    async function loadKonten() {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            renderKonten(data);
        } catch (err) {
            listBox.innerHTML = "Fehler beim Laden der Konten";
            console.error(err);
        }
    }

    loadKonten();
});
