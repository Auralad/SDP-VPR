document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "/api/transaktionen";

    const container = document.createElement("div");
    container.style.maxWidth = "600px";
    container.style.margin = "20px auto";
    container.style.fontFamily = "Arial, sans-serif";

    const listBox = document.createElement("div");
    listBox.style.border = "1px solid #ccc";
    listBox.style.padding = "10px";
    listBox.style.marginBottom = "20px";
    listBox.style.borderRadius = "6px";

    const formBox = document.createElement("div");
    formBox.style.border = "1px solid #ccc";
    formBox.style.padding = "10px";
    formBox.style.borderRadius = "6px";

    container.appendChild(listBox);
    container.appendChild(formBox);
    document.body.appendChild(container);

    function senderText(t) {
        if (t.from_kid !== null) return `Kunde #${t.from_kid}`;
        if (t.from_extern !== null) return `Externer Kunde #${t.from_extern}`;
        return "Unbekannt";
    }

    function receiverText(t) {
        if (t.to_kid !== null) return `Kunde #${t.to_kid}`;
        if (t.to_extern !== null) return `Externer Kunde #${t.to_extern}`;
        return "Unbekannt";
    }

    function renderTransactions(data) {
        listBox.innerHTML = "<h3>Transaktionen</h3>";

        data.forEach(t => {
            const box = document.createElement("div");
            box.style.padding = "8px";
            box.style.borderBottom = "1px solid #eee";

            box.innerHTML = `
                <strong>${senderText(t)}</strong> ➜ ${receiverText(t)}<br>
                Betrag: ${t.trans_value} €<br>
                Datum: ${t.trans_date}<br>
                <em>${t.trans_message}</em>
            `;

            listBox.appendChild(box);
        });
    }

    async function loadTransactions() {
        const res = await fetch(API_URL);
        const data = await res.json();
        renderTransactions(data);
    }

    formBox.innerHTML = `
        <h3>Neue Transaktion</h3>
        <form id="transForm">
            <input placeholder="from_kid" name="from_kid"><br><br>
            <input placeholder="from_extern" name="from_extern"><br><br>
            <input placeholder="to_kid" name="to_kid"><br><br>
            <input placeholder="to_extern" name="to_extern"><br><br>
            <input placeholder="Betrag" name="trans_value" required><br><br>
            <input placeholder="Datum (YYYY-MM-DD)" name="trans_date" required><br><br>
            <input placeholder="Nachricht" name="trans_message"><br><br>
            <button type="submit">Speichern</button>
        </form>
    `;

    document.getElementById("transForm").addEventListener("submit", async e => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const payload = {};
        formData.forEach((value, key) => {
            payload[key] = value === "" ? null : value;
        });

        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        e.target.reset();
        loadTransactions();
    });

    loadTransactions();
});
