document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost/api/index.php?route=transaktionen";

    const container = document.getElementById("transaktionen-container");

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

    function senderText(t) {
        if (t.from_kid !== null) {
            const name = [t.from_forename, t.from_lastname].filter(Boolean).join(" ");
            return name ? `Von: ${name}` : `Kunde #${t.from_kid}`;
        }
        if (t.from_extern !== null) {
            return t.from_extern_name
                ? `Externer: ${t.from_extern_name}`
                : `Externer #${t.from_extern}`;
        }
        return "Unbekannt";
    }

    function receiverText(t) {
        if (t.to_kid !== null) {
            const name = [t.to_forename, t.to_lastname].filter(Boolean).join(" ");
            return name ? `An: ${name}` : `Kunde #${t.to_kid}`;
        }
        if (t.to_extern !== null) {
            return t.to_extern_name
                ? `Externer: ${t.to_extern_name}`
                : `Externer #${t.to_extern}`;
        }
        return "Unbekannt";
    }

    function renderTransactions(data) {
        listBox.innerHTML = "<h3>All deine Transaktionen auf einen Blick</h3>";

        function formatDate(val) {
            if (!val && val !== 0) return "";
            const s = String(val).trim();
            if (/^\d+$/.test(s)) {
                const n = Number(s);
                const ms = s.length === 10 ? n * 1000 : n;
                return new Date(ms).toLocaleString();
            }
            const d = new Date(s);
            return isNaN(d.getTime()) ? s : d.toLocaleString();
        }

        data.forEach(t => {
            const box = document.createElement("div");
            box.style.padding = "8px";
            box.style.borderBottom = "1px solid #eee";

            box.innerHTML = `
                <strong>${senderText(t)}</strong> ➜ ${receiverText(t)}<br>
                Betrag: ${t.trans_value} €<br>
                Datum: ${formatDate(t.trans_date)}<br>
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

    async function searchContacts(query) {
        const res = await fetch(`${API_URL}&q=${encodeURIComponent(query)}`);
        return await res.json();
    }
    function setupAutocomplete(inputEl, listEl) {
        let selected = { kid: null, extern: null };

        inputEl.addEventListener("input", async () => {
            const q = inputEl.value.trim();
            listEl.innerHTML = "";
            selected = { kid: null, extern: null };

            if (q.length < 2) return;

            const results = await searchContacts(q);

            results.forEach(r => {
                const div = document.createElement("div");
                div.textContent = r.label + (r.type === "intern" ? " (intern)" : " (extern)");
                div.style.cursor = "pointer";
                div.style.padding = "4px";

                div.onclick = () => {
                    inputEl.value = r.label;
                    listEl.innerHTML = "";

                    if (r.type === "intern") {
                        selected.kid = r.id;
                    } else {
                        selected.extern = r.id;
                    }
                };

                listEl.appendChild(div);
            });
        });

        return () => selected;
    }

    formBox.innerHTML = `
<h3>Neue Transaktion</h3>
<form id="transForm">

    <label>Von Konto:</label><br>
    <select name="from_kid" required>
        <option value="">-- bitte wählen --</option>
        <option value="107">VISA</option>
        <option value="101">MasterCard</option>
        <option value="106">Sparkasse</option>
    </select>
    <br><br>

    <label>Empfänger:</label><br>
    <input id="receiverInput" placeholder="Empfänger" autocomplete="off"><br>
    <div id="receiverSuggestions"></div><br>

    <input placeholder="Betrag" name="trans_value" required><br><br>
    <input placeholder="Nachricht" name="trans_message"><br><br>

    <button type="submit">Speichern</button>
</form>
`;


//    const getSender = setupAutocomplete(
//        document.getElementById("senderInput"),//.style.display="none",
//        document.getElementById("senderSuggestions")//.style.display="none"
//    );

    const getReceiver = setupAutocomplete(
        document.getElementById("receiverInput"),
        document.getElementById("receiverSuggestions")
    );

    

    document.getElementById("transForm").addEventListener("submit", async e => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const fromKid = parseInt(formData.get("from_kid"), 10);
        const selectedReceiver = getReceiver();

        if (!fromKid) {
            alert("Bitte ein Konto auswählen.");
            return;
        }

        if (selectedReceiver.kid === null && selectedReceiver.extern === null) {
            alert("Bitte einen Empfänger auswählen.");
            return;
        }

        let rawAmount = formData.get("trans_value") ?? "";
        rawAmount = String(rawAmount).replace(",", ".").trim();
        const amount = parseFloat(rawAmount);

        if (isNaN(amount) || amount <= 0) {
            alert("Bitte einen gültigen Betrag größer als 0 eingeben.");
            return;
        }

        const payload = {
            from_kid: fromKid,
            from_extern: null,
            to_kid: selectedReceiver.kid,
            to_extern: selectedReceiver.extern,
            trans_value: amount,
            trans_message: formData.get("trans_message") || null
        };

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            e.target.reset();
            loadTransactions();
            alert(`Transaktion über ${amount.toFixed(2)} € wurde erfolgreich durchgeführt!`);
        } catch (error) {
            console.error('Fehler beim Speichern der Transaktion:', error);
            alert("Fehler beim Durchführen der Transaktion. Bitte versuchen Sie es erneut.");
        }
    });

    loadTransactions();
    window.addEventListener('transaktionNeugeladen', loadTransactions);
});
