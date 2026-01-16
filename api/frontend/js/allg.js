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
        if (t.from_kid !== null) {
            const name = [t.from_forename, t.from_lastname].filter(Boolean).join(" ");
            return name ? `Kunde: ${name}` : `Kunde #${t.from_kid}`;
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
            return name ? `Kunde: ${name}` : `Kunde #${t.to_kid}`;
        }
        if (t.to_extern !== null) {
            return t.to_extern_name
                ? `Externer: ${t.to_extern_name}`
                : `Externer #${t.to_extern}`;
        }
        return "Unbekannt";
    }


    function renderTransactions(data) {
        listBox.innerHTML = "<h3>Test</h3>";

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
        const res = await fetch(`/api/transaktionen/search?q=${encodeURIComponent(query)}`);
        return res.json();
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
    const getSender = setupAutocomplete(
        document.getElementById("senderInput"),
        document.getElementById("senderSuggestions")
    );

    const getReceiver = setupAutocomplete(
        document.getElementById("receiverInput"),
        document.getElementById("receiverSuggestions")
    );

    formBox.innerHTML = `
    <h3>Neue Transaktion</h3>
    <form id="transForm">
        <input id="senderInput" placeholder="Sender" autocomplete="off"><br>
        <div id="senderSuggestions"></div><br>

        <input id="receiverInput" placeholder="Empfänger" autocomplete="off"><br>
        <div id="receiverSuggestions"></div><br>

        <input placeholder="Betrag" name="trans_value" required><br><br>
        <input placeholder="Nachricht" name="trans_message"><br><br>

        <button type="submit">Speichern</button>
    </form>
    `;

    function parseIdField(val) {
        if (val === null || val === "" || val === undefined) return null;
        const n = parseInt(String(val).trim(), 10);
        return isNaN(n) ? null : n;
    }

    function classifyId(n) {
        if (n === null) return { kid: null, extern: null };
        if (n >= 100 && n <= 199) return { kid: n, extern: null };
        if (n >= 200 && n <= 299) return { kid: null, extern: n };
        return { kid: null, extern: null };
    }

    document.getElementById("transForm").addEventListener("submit", async e => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const fromId = parseIdField(formData.get("sender"));
        const toId = parseIdField(formData.get("empfaenger"));

        const fromClass = classifyId(fromId);
        const toClass = classifyId(toId);

        let rawAmount = formData.get("trans_value") ?? "";
        rawAmount = String(rawAmount).replace(",", ".").trim();
        const amount = rawAmount === "" ? null : parseFloat(rawAmount);

        if (amount === null || isNaN(amount)) {
            alert("Ungültiger Betrag.");
            return;
        }

        if ((fromId !== null && fromClass.kid === null && fromClass.extern === null) ||
            (toId !== null && toClass.kid === null && toClass.extern === null)) {
            alert("Sender/Empfänger-ID außerhalb des erlaubten Bereichs (100-199 intern, 200-299 extern).");
            return;
        }

        const payload = {
            from_kid: fromClass.kid,
            from_extern: fromClass.extern,
            to_kid: toClass.kid,
            to_extern: toClass.extern,
            trans_value: amount,
            trans_message: formData.get("trans_message") || null
        };

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
