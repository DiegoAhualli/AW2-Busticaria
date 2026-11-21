
(function () {

    const formLogin = document.getElementById('formLogin');

    // La validación de credenciales se realiza exclusivamente en el backend.
    formLogin.addEventListener('submit', async function (evento) {

        evento.preventDefault();

        const email = document.getElementById('txtemail').value.trim();
        const password = document.getElementById('txtpassword').value;

        const boton = formLogin.querySelector('button[type="submit"]');

        boton.disabled = true;

        try {

            // Cada intento reemplaza cualquier sesión previa de la pestaña.
            sessionStorage.removeItem('usuarioLogueado');
            sessionStorage.removeItem('tokenBusticaria');

            const respuesta = await fetch('/api/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                alert(datos.mensaje || 'No se pudo iniciar sesión');
                return;
            }

            if (typeof datos.token !== 'string' || !datos.token) {
                alert('El servidor no devolvió una sesión válida');
                return;
            }

            // Sólo se persisten los datos públicos devueltos por la API.
            sessionStorage.setItem(
                'usuarioLogueado',
                JSON.stringify(datos.usuario)
            );

            // sessionStorage limita el JWT a la pestaña actual.
            sessionStorage.setItem('tokenBusticaria', datos.token);

            window.location.href = '/pages/home.html';

        } catch (error) {

            console.error('Error de conexión:', error);
            alert('No se pudo conectar con el servidor');

        } finally {

            boton.disabled = false;
        }
    });

})();
