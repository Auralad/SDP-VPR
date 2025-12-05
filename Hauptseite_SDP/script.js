document.addEventListener('DOMContentLoaded', function () {
    fetch("api.php")
        .then(response => response.json())
        .then(data => {
            console.log("API Data:", data);
        })
        .catch(error => {
            console.error("Error fetching API data:", error);
        });
        
    
    const accounts = [
        { name: 'Girokonto', balance: 1240.55 },
        { name: 'Sparkonto', balance: 5300.00 },
        { name: 'Trading-Konto', balance: 890.12 }
    ];

    const list = document.getElementById('accountsList');

    if (list) {
        list.innerHTML = '';
        accounts.forEach(function (acc) {
            const li = document.createElement('li');
            li.innerHTML = `<span>${acc.name}</span><strong>${acc.balance.toFixed(2)} €</strong>`;
            list.appendChild(li);
        });
    }

    const firstAccount = accounts[0];
    let gehalt = firstAccount.balance;
    let verwendet = 750;
    let verfuegbar = gehalt - verwendet;

    const usedLabelEl = document.getElementById('usedLabel');
    const freeLabelEl = document.getElementById('freeLabel');
    if (usedLabelEl) usedLabelEl.textContent = verwendet.toFixed(2);
    if (freeLabelEl) freeLabelEl.textContent = verfuegbar.toFixed(2);

    
    const canvas = document.getElementById('kreisDiagramm');
    let myPieChart = null;
    if (canvas && typeof Chart !== 'undefined') {
        const ctx = canvas.getContext('2d');
        myPieChart = new Chart(ctx, {
            type: 'pie',
            data: {
               
                labels: ['Verwendet', 'Verfügbar'],
                datasets: [{
                    data: [verwendet, verfuegbar],
                    backgroundColor: ['#e63946', '#4caf50']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    function updateBudget(newGehalt, newVerwendet) {
        gehalt = Number(newGehalt) || 0;
        verwendet = Number(newVerwendet) || 0;
        verfuegbar = gehalt - verwendet;

        if (usedLabelEl) usedLabelEl.textContent = verwendet.toFixed(2);
        if (freeLabelEl) freeLabelEl.textContent = verfuegbar.toFixed(2);

        if (myPieChart) {
            myPieChart.data.datasets[0].data = [verwendet, verfuegbar];
            myPieChart.update();
        }
    }

    window.updateBudget = updateBudget;

    
});
