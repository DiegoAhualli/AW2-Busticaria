const formLogin = document.getElementById("formLogin");

formLogin.addEventListener("submit", function(evento){

    evento.preventDefault();

    const email = document.getElementById("txtemail").value;

    const password = document.getElementById("txtpassword").value;

    const usuarioGuardado = JSON.parse(
        localStorage.getItem("usuarioRegistrado")
    );

    if(
        usuarioGuardado &&
        email === usuarioGuardado.email &&
        password === usuarioGuardado.password
    ){

        sessionStorage.setItem(
            "usuarioLogueado",
            JSON.stringify(usuarioGuardado)
        );

        window.location.href = "../../home.html";

    } else {

        alert("Email o contraseña incorrectos");

    }

});