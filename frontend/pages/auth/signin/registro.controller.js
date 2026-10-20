console.log("Registro controller cargado");

const formRegistro = document.getElementById("formRegistro");

formRegistro.addEventListener("submit", function(evento){

    evento.preventDefault();

    console.log("Submit interceptado");

    const nombre = document.getElementById("txtnombre").value;
    const apellido = document.getElementById("txtapellido").value;
    const email = document.getElementById("txtemail").value;
    const password = document.getElementById("txtpassword").value;
    const fechaNacimiento = document.getElementById("txtfechaNacimiento").value;

    const usuario = {
        nombre: nombre,
        apellido: apellido,
        email: email,
        password: password,
        fechaNacimiento: fechaNacimiento
    };

    localStorage.setItem("usuarioRegistrado", JSON.stringify(usuario));

    alert("Usuario registrado correctamente");

    window.location.href = "../login/login.html";
});