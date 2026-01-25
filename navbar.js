document.addEventListener("DOMContentLoaded", () => {

/* wird später mit php ersetzt */
    const isLoggedIn = false; // true = eingeloggt

    const userArea = document.getElementById("userArea");

    if (isLoggedIn) {
        userArea.innerHTML = `
            <div class="dropdown">
                <button class="user-btn">
                    <img src="https://via.placeholder.com/32">
                    Max Mustermann ▾
                </button>
                <div class="dropdown-content">
                    <a href="#">Profil</a>
                    <a href="#">Einstellungen</a>
                    <a href="#">Logout</a>
                </div>
            </div>
        `;
    } else {
        userArea.innerHTML = `
            <div class="auth-buttons">
                <a href="login.html">Login</a>
                <a href="register.html">Registrieren</a>
            </div>
        `;
    }

});
