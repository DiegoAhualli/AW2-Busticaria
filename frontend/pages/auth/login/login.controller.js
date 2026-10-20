(function () {
    const formLogin = document.getElementById('formLogin');

    formLogin.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        const email = document.getElementById('txtemail').value.trim();
        const password = document.getElementById('txtpassword').value;
        const boton = formLogin.querySelector('button[type="submit"]');

        boton.disabled = true;

        try {
            const respuesta = await fetch('/api/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                alert(datos.mensaje || 'No se pudo iniciar sesión');
                return;
            }

            // Guardamos los datos públicos del usuario, nunca su contraseña.
            sessionStorage.setItem('usuarioLogueado', JSON.stringify(datos.usuario));
            localStorage.removeItem('usuarioRegistrado'); // Limpiar datos viejos de AW1.
            window.location.href = '/pages/home.html';
        } catch (error) {
            console.error('Error de conexión:', error);
            alert('No se pudo conectar con el servidor');
        } finally {
            boton.disabled = false;
        }
    });
})();
