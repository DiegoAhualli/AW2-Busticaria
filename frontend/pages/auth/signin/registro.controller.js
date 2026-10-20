
(function () {

    // Controlador del formulario de registro de usuarios.
    // En AW1 guardábamos los datos directamente en localStorage.
    // Ahora utilizamos el backend de Express para registrar los usuarios en usuarios.json.

    const formRegistro = document.getElementById('formRegistro');

    // Capturamos el evento submit cuando el usuario presiona Registrarse.
    formRegistro.addEventListener('submit', async function (evento) {

        // Evitamos que el formulario recargue la página automáticamente.
        evento.preventDefault();

        // Obtenemos los datos ingresados en los campos del formulario.
        // trim() elimina los espacios innecesarios al principio y al final.
        const nombre = document.getElementById('txtnombre').value.trim();
        const apellido = document.getElementById('txtapellido').value.trim();
        const email = document.getElementById('txtemail').value.trim();
        const password = document.getElementById('txtpassword').value;

        const boton = formRegistro.querySelector('button[type="submit"]');

        // Deshabilitamos el botón mientras se procesa el registro
        // para evitar enviar varias solicitudes seguidas.
        boton.disabled = true;

        try {

            // Enviamos los datos al endpoint POST /api/usuarios.
            // Express se encarga de validar los campos, comprobar que el email
            // no esté repetido y guardar el usuario en el archivo JSON.
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

            // Convertimos la respuesta del servidor a un objeto JavaScript.
            const datos = await respuesta.json();

            // Si la solicitud no fue exitosa, mostramos el mensaje
            // devuelto por Express, por ejemplo cuando un email ya existe.
            if (!respuesta.ok) {
                alert(datos.mensaje || 'No se pudo registrar el usuario');
                return;
            }

            // Eliminamos los datos de registro que podían haber quedado
            // en localStorage desde la primera versión de Busticaria.
            localStorage.removeItem('usuarioRegistrado');

            // Informamos el resultado y enviamos al usuario al login.
            // El registro no inicia sesión automáticamente.
            alert('Usuario registrado correctamente. Iniciá sesión para continuar.');

            window.location.href = '/pages/auth/login/login.html';

        } catch (error) {

            // Este bloque controla problemas de conexión con el servidor.
            console.error('Error de conexión:', error);
            alert('No se pudo conectar con el servidor');

        } finally {

            // Haya funcionado o no la solicitud, volvemos a habilitar el botón.
            boton.disabled = false;
        }
    });

})();
