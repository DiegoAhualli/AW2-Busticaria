
(function () {

    const formRegistro = document.getElementById('formRegistro');

    // El backend valida los campos, evita duplicados y genera el hash Bcrypt.
    formRegistro.addEventListener('submit', async function (evento) {

        evento.preventDefault();

        const nombre = document.getElementById('txtnombre').value.trim();
        const apellido = document.getElementById('txtapellido').value.trim();
        const email = document.getElementById('txtemail').value.trim();
        const password = document.getElementById('txtpassword').value;

        const boton = formRegistro.querySelector('button[type="submit"]');

        boton.disabled = true;

        try {

            const respuesta = await fetch('/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    apellido,
                    email,
                    password
                })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                alert(datos.mensaje || 'No se pudo registrar el usuario');
                return;
            }

            // Elimina el formato de registro local usado por la versión anterior.
            localStorage.removeItem('usuarioRegistrado');

            alert('Usuario registrado correctamente. Iniciá sesión para continuar.');

            window.location.href = '/pages/auth/login/login.html';

        } catch (error) {

            console.error('Error de conexión:', error);
            alert('No se pudo conectar con el servidor');

        } finally {

            boton.disabled = false;
        }
    });

})();
