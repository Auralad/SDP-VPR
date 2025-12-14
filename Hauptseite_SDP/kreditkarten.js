document.addEventListener("DOMContentLoaded", () => {

    const karten = [
        { name: "Visa Gold", number: "**** **** **** 1234", limit: 5000 },
        { name: "Mastercard", number: "**** **** **** 5678", limit: 3000 },
        { name: "Amex", number: "**** **** **** 9012", limit: 8000 }
    ];

    const list = document.getElementById("kartenList");
    list.innerHTML = "";

    karten.forEach(card => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>
                <strong>${card.name}</strong><br>
                ${card.number}
            </span>
            <span>${card.limit} € Limit</span>
        `;
        list.appendChild(li);
    });
});
