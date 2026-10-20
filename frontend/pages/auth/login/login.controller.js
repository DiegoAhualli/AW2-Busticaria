
(function () {

    // Controlador del inicio de sesión.
    // Las credenciales se validan en Express consultando usuarios.json.
    // A diferencia de AW1, ya no comparamos la contraseña con localStorage.

    const formLogin = document.getElementById('formLogin');

    // Capturamos el envío del formulario de login.
    formLogin.addEventListener('submit', async function (evento) {

        // Evitamos que el navegador recargue la página al enviar el formulario.
        evento.preventDefault();

        // Recuperamos el email y la contraseña ingresados.
        const email = document.getElementById('txtemail').value.trim();
        const password = document.getElementById('txtpassword').value;

        const boton = formLogin.querySelector('button[type="submit"]');

        // Deshabilitamos el botón mientras esperamos la respuesta
        // para evitar varios intentos simultáneos desde el formulario.
        boton.disabled = true;

        try {

            // Enviamos las credenciales a la ruta de login del backend.
            // Express busca el usuario, verifica la contraseña y controla
            // que la cuenta esté activa antes de permitir el ingreso.
            const respuesta = await fetch('/api/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            // Leemos la respuesta que devuelve Express.
            const datos = await respuesta.json();

            // Si el login falla, mostramos el mensaje del servidor
            // y no guardamos ninguna sesión nueva.
            if (!respuesta.ok) {
                alert(datos.mensaje || 'No se pudo iniciar sesión');
                return;
            }

            // Guardamos los datos públicos del usuario en sessionStorage.
            // Incluimos su ID porque después lo necesitamos para asociar
            // las órdenes de compra con el usuario correspondiente.
            // No guardamos la contraseña dentro de la sesión.
            sessionStorage.setItem(
                'usuarioLogueado',
                JSON.stringify(datos.usuario)
            );

            // Limpiamos los datos que podían quedar del login anterior de AW1.
            localStorage.removeItem('usuarioRegistrado');

            // Si las credenciales son correctas, redirigimos al Home.
            window.location.href = '/pages/home.html';

        } catch (error) {

            // Avisamos si ocurre un problema al comunicarnos con el servidor.
            console.error('Error de conexión:', error);
            alert('No se pudo conectar con el servidor');

        } finally {

            // Habilitamos nuevamente el botón cuando termina la solicitud.
            boton.disabled = false;
        }
    });

})();
