const navbar = document.getElementById("navbar");

const usuarioLogueado = sessionStorage.getItem("usuarioLogueado");

let basePath = "";
let logoPath = "../assets/img/logo.webp";

if (window.location.pathname.includes("/pages/auth/")) {
    basePath = "../../";
    logoPath = "../../../assets/img/logo.webp";
} else if (window.location.pathname.includes("/pages/categories/")) {
    basePath = "../";
    logoPath = "../../assets/img/logo.webp";
} else if (window.location.pathname.includes("/pages/carrito/")) {
    basePath = "../";
    logoPath = "../../assets/img/logo.webp";
}

let linksNavbar = "";

const paginaActual = window.location.pathname;

if (paginaActual.includes("/auth/login/")) {

    linksNavbar = `
        <li class="nav-item">
            <a class="nav-link" href="${basePath}auth/signin/registro.html">
                Registrarse
            </a>
        </li>
    `;

} else if (paginaActual.includes("/auth/signin/")) {

    linksNavbar = `
        <li class="nav-item">
            <a class="nav-link" href="${basePath}auth/login/login.html">
                Login
            </a>
        </li>
    `;

} else {

    linksNavbar = `
        <li class="nav-item">
            <a class="nav-link" href="${basePath}home.html">Home</a>
        </li>

        <li class="nav-item">
            <a class="nav-link" href="${basePath}categories/categoria-ropa.html">Ropa</a>
        </li>

        <li class="nav-item">
            <a class="nav-link" href="${basePath}categories/categoria-tecnologia.html">Tecnología</a>
        </li>

        <li class="nav-item">
            <a class="nav-link" href="${basePath}categories/categoria-hogar.html">Hogar</a>
        </li>
    `;

    if (usuarioLogueado) {
        linksNavbar += `
            <li class="nav-item">
                <a class="nav-link d-flex align-items-center gap-2" href="${basePath}carrito/carrito.html">
                    <svg xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-cart"
                        viewBox="0 0 16 16">
                        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                    </svg>
                    Carrito
                </a>
            </li>

            <li class="nav-item">
                <button class="btn btn-outline-danger ms-lg-3 d-flex align-items-center gap-2" id="btnLogout">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                        <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                    </svg>
                    Cerrar sesión
                </button>
            </li>
        `;
    } else {
        linksNavbar += `
            <li class="nav-item">
                <a class="nav-link" href="${basePath}auth/login/login.html">
                    Login
                </a>
            </li>
        `;
    }
}

navbar.innerHTML = `
    <nav class="navbar navbar-expand-lg bg-body-tertiary fixed-top">
        <div class="container-fluid">
            <a class="navbar-brand" href="${basePath}home.html">
                <img src="${logoPath}" alt="Busticaria" height="80">
            </a>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    ${linksNavbar}
                </ul>
            </div>
        </div>
    </nav>
`;

const btnLogout = document.getElementById("btnLogout");

if (btnLogout) {
    btnLogout.addEventListener("click", function () {
        sessionStorage.removeItem("usuarioLogueado");
        window.location.href = `${basePath}auth/login/login.html`;
    });
}