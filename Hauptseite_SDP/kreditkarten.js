document.addEventListener("DOMContentLoaded", () => {

    const cards = [
        { name: "Volksbank", number: "**** **** **** 1234", limit: 5000 },
        { name: "Mastercard", number: "**** **** **** 5678", limit: 3000 },
        { name: "Sparkasse", number: "**** **** **** 9012", limit: 8000 }
    ];

    const list = document.getElementById("cardList");
    list.innerHTML = "";

    cards.forEach(card => {
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
