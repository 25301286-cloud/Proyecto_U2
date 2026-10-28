
// CARRITO DE LA ESCONDIDA

let carrito = [];

// Recuperar productos guardados
try {
    carrito = JSON.parse(localStorage.getItem("carritoLaEscondida")) || [];

    if (!Array.isArray(carrito)) {
        carrito = [];
    }
} catch (error) {
    carrito = [];
}

// ELEMENTOS DEL HTML
const botonesAgregar = document.querySelectorAll(".btn-agregar");
const contadores = document.querySelectorAll(".contador-carrito");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total-carrito");
const cantidadCarrito = document.getElementById("cantidad-carrito");
const vaciarCarrito = document.getElementById("vaciar-carrito");
const mensajeCarrito = document.getElementById("mensaje-carrito");
const mensajeProducto = document.getElementById("mensaje-producto");

// GUARDAR EL CARRITO
function guardarCarrito() {
    localStorage.setItem("carritoLaEscondida", JSON.stringify(carrito));
}

// ACTUALIZAR EL CONTADOR
function actualizarContador() {

    let cantidad = 0;

    carrito.forEach(function(producto) {
        cantidad = cantidad + producto.cantidad;
    });

    contadores.forEach(function(contador) {
        contador.textContent = cantidad;
    });

    if (cantidadCarrito) {
        cantidadCarrito.textContent = cantidad;
    }
}

// SELECCIONAR TIPO DE CARNE
const selectoresCarne = document.querySelectorAll(".tipo-carne");

selectoresCarne.forEach(function(selector) {

    selector.addEventListener("change", function() {

        const grupo = selector.parentElement;
        const boton = grupo.querySelector(".btn-agregar");

        const precioBase = Number(boton.dataset.precio);
        const carneElegida = selector.value.trim().toLowerCase();

        let precioFinal = precioBase;

        // TRIPA CUESTA 5 PESOS ADICIONALES
        if (carneElegida === "tripa") {
            precioFinal = precioBase + 5;
        }

        const precioTexto = grupo.querySelector(".precio-carne");

        if (selector.value === "") {
            precioTexto.textContent = "Desde $" + precioBase;
        } else {
            precioTexto.textContent = "$" + precioFinal;
        }

        selector.classList.remove("campo-invalido");

    });
});

// AGREGAR PRODUCTOS AL CARRITO
botonesAgregar.forEach(function(boton) {

    boton.addEventListener("click", function() {

        let nombre = boton.dataset.nombre;
        let precio = Number(boton.dataset.precio);

        const grupo = boton.parentElement;
        const campo = grupo.querySelector(".cantidad-producto");
        const cantidad = Number(campo.value);

        const selector = grupo.querySelector(".tipo-carne");

        // VERIFICAR EL TIPO DE CARNE
        if (selector) {

            if (selector.value === "") {

                selector.classList.add("campo-invalido");
                selector.focus();

                if (mensajeProducto) {
                    mensajeProducto.textContent =
                        "Selecciona el tipo de carne para " + nombre + ".";
                }

                return;
            }

            nombre = nombre + " - " + selector.value;

            if (selector.value.trim().toLowerCase() === "tripa") {
                precio = precio + 5;
            }
        }

        // VALIDAR CANTIDAD
        if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) {

            campo.focus();

            if (mensajeProducto) {
                mensajeProducto.textContent =
                    "Selecciona una cantidad entre 1 y 99.";
            }

            return;
        }

        // BUSCAR PRODUCTO EXISTENTE
        const encontrado = carrito.find(function(producto) {
            return producto.nombre === nombre;
        });

        if (encontrado) {

            encontrado.cantidad = encontrado.cantidad + cantidad;
            encontrado.precio = precio;

        } else {

            carrito.push({
                nombre: nombre,
                precio: precio,
                cantidad: cantidad
            });

        }

        guardarCarrito();
        actualizarContador();

        campo.value = 1;

        if (mensajeProducto) {
            mensajeProducto.textContent =
                cantidad + " x " + nombre + " agregado al carrito.";
        }

    });
});

// MOSTRAR CARRITO
function mostrarCarrito() {

    if (!listaCarrito) {
        return;
    }

    listaCarrito.innerHTML = "";

    let total = 0;

    carrito.forEach(function(producto, indice) {

        total = total + producto.precio * producto.cantidad;

        const fila = document.createElement("div");
        fila.className = "producto-carrito";

        const informacion = document.createElement("div");

        const nombre = document.createElement("strong");
        nombre.textContent = producto.nombre;

        const subtotal = document.createElement("span");

        subtotal.textContent =
            "$" + producto.precio + " x " + producto.cantidad +
            " = $" + (producto.precio * producto.cantidad);

        informacion.appendChild(nombre);
        informacion.appendChild(subtotal);

        const controles = document.createElement("div");
        controles.className = "controles-carrito";

        // DISMINUIR CANTIDAD
        const menos = document.createElement("button");
        menos.type = "button";
        menos.textContent = "-";

        menos.setAttribute(
            "aria-label",
            "Disminuir " + producto.nombre
        );

        menos.addEventListener("click", function() {

            producto.cantidad = producto.cantidad - 1;

            if (producto.cantidad === 0) {
                carrito.splice(indice, 1);
            }

            guardarCarrito();
            mostrarCarrito();

        });

        const numero = document.createElement("span");
        numero.textContent = producto.cantidad;

        // AUMENTAR CANTIDAD
        const mas = document.createElement("button");
        mas.type = "button";
        mas.textContent = "+";

        mas.setAttribute(
            "aria-label",
            "Aumentar " + producto.nombre
        );

        mas.addEventListener("click", function() {

            producto.cantidad = producto.cantidad + 1;

            guardarCarrito();
            mostrarCarrito();

        });

        // QUITAR PRODUCTO
        const quitar = document.createElement("button");
        quitar.type = "button";
        quitar.textContent = "Quitar";

        quitar.addEventListener("click", function() {

            carrito.splice(indice, 1);

            guardarCarrito();
            mostrarCarrito();

        });

        controles.appendChild(menos);
        controles.appendChild(numero);
        controles.appendChild(mas);
        controles.appendChild(quitar);

        fila.appendChild(informacion);
        fila.appendChild(controles);

        listaCarrito.appendChild(fila);

    });

    totalCarrito.textContent = "$" + total + " MXN";

    actualizarContador();

    if (carrito.length === 0) {
        mensajeCarrito.textContent = "Tu carrito está vacío.";
    } else {
        mensajeCarrito.textContent =
            "Puedes cambiar las cantidades o quitar productos.";
    }

    vaciarCarrito.disabled = carrito.length === 0;

    // MOSTRAR CONTINUAR SOLO CON PRODUCTOS
    const continuarPedido = document.getElementById("continuar-pedido");

    if (continuarPedido) {

        continuarPedido.classList.toggle(
            "d-none",
            carrito.length === 0
        );

    }
}

// VACIAR CARRITO
if (vaciarCarrito) {

    vaciarCarrito.addEventListener("click", function() {

        carrito = [];

        guardarCarrito();
        mostrarCarrito();

    });
}

// INICIAR CONTADOR Y CARRITO
actualizarContador();
mostrarCarrito();


// FORMULARIO DEL PEDIDO
const formularioPedido = document.querySelector("#formulario-pedido");

if (formularioPedido) {

    const tipoEntrega = document.querySelector("#tipo-entrega");
    const grupoDireccion = document.querySelector("#grupo-direccion");
    const direccionCliente = document.querySelector("#direccion-cliente");

    const avisoResumen = document.querySelector("#aviso-resumen");
    const resumenProductos = document.querySelector("#resumen-productos");
    const totalPedido = document.querySelector("#total-pedido");

    const mensajeValidacion = document.querySelector("#mensaje-validacion");
    const confirmacionPedido = document.querySelector("#confirmacion-pedido");
    const datosConfirmados = document.querySelector("#datos-confirmados");

    // NUMERO DE WHATSAPP DEL NEGOCIO
    const numeroNegocio = "525585109332";
    const enlaceWhatsapp = document.querySelector("#enviar-whatsapp");

    const botonRevisar = document.querySelector("#revisar-pedido");
    const pedidoVacio = document.querySelector("#pedido-vacio");
    const ayudaFormulario = document.querySelector("#ayuda-formulario");

    // MOSTRAR RESUMEN DEL CARRITO
    function mostrarResumenPedido() {

        resumenProductos.innerHTML = "";

        let total = 0;

        carrito.forEach(function(producto) {

            const fila = document.createElement("div");
            fila.className = "linea-resumen";

            const nombre = document.createElement("span");
            nombre.textContent =
                producto.cantidad + " x " + producto.nombre;

            const precio = document.createElement("strong");
            precio.textContent =
                "$" + (producto.precio * producto.cantidad);

            fila.appendChild(nombre);
            fila.appendChild(precio);

            resumenProductos.appendChild(fila);

            total = total + producto.precio * producto.cantidad;

        });

        totalPedido.textContent = "$" + total + " MXN";

        // OCULTAR FORMULARIO SI NO HAY PRODUCTOS
        const carritoVacio = carrito.length === 0;

        formularioPedido.classList.toggle("d-none", carritoVacio);
        pedidoVacio.classList.toggle("d-none", !carritoVacio);
        ayudaFormulario.classList.toggle("d-none", carritoVacio);

        botonRevisar.disabled = carritoVacio;

        if (carritoVacio) {

            avisoResumen.textContent =
                "Tu carrito está vacío. Agrega alimentos desde el menú.";

        } else {

            avisoResumen.textContent = "";

        }
    }

    // MOSTRAR DIRECCION SOLO PARA DOMICILIO
    function cambiarTipoEntrega() {

        const esDomicilio = tipoEntrega.value === "domicilio";

        grupoDireccion.classList.toggle("d-none", !esDomicilio);

        direccionCliente.required = esDomicilio;

        if (!esDomicilio) {

            direccionCliente.value = "";
            direccionCliente.classList.remove("campo-invalido");

            document.querySelector(
                "#error-direccion-cliente"
            ).textContent = "";

        }
    }

    // VALIDAR CAMPOS DEL FORMULARIO
    function validarCampo(campo) {

        if (campo === direccionCliente && !direccionCliente.required) {
            return true;
        }

        let valido = campo.checkValidity();

        if (campo.type !== "checkbox" &&
            campo.required &&
            campo.value.trim() === "") {

            valido = false;

        }

        campo.classList.toggle("campo-invalido", !valido);

        const error = document.getElementById("error-" + campo.id);

        if (error) {

            if (valido) {

                error.textContent = "";

            } else if (campo.id === "nombre-cliente") {

                error.textContent =
                    "Escribe tu nombre (mínimo 3 caracteres).";

            } else if (campo.id === "telefono-cliente") {

                error.textContent =
                    "Escribe un número de 10 dígitos, sin espacios.";

            } else if (campo.id === "tipo-entrega") {

                error.textContent =
                    "Selecciona la forma de entrega.";

            } else if (campo.id === "direccion-cliente") {

                error.textContent =
                    "Escribe una dirección de al menos 8 caracteres.";

            } else if (campo.id === "confirmar-productos") {

                error.textContent =
                    "Debes revisar y confirmar los productos.";

            }
        }

        return valido;
    }

    // CAMBIAR ENTRE RECOLECCION Y DOMICILIO
    tipoEntrega.addEventListener("change", cambiarTipoEntrega);

    // VALIDACIONES DINAMICAS
    const campos = formularioPedido.querySelectorAll(
        "input, select, textarea"
    );

    campos.forEach(function(campo) {

        campo.addEventListener("input", function() {

            if (campo.required) {
                validarCampo(campo);
            }

            // SI MODIFICA DATOS, DEBE REVISAR DE NUEVO
            confirmacionPedido.classList.add("d-none");
            enlaceWhatsapp.removeAttribute("href");

        });

        campo.addEventListener("change", function() {

            if (campo.required) {
                validarCampo(campo);
            }

            confirmacionPedido.classList.add("d-none");
            enlaceWhatsapp.removeAttribute("href");

        });

    });

    // REVISAR DATOS DEL PEDIDO
    formularioPedido.addEventListener("submit", function(evento) {

        evento.preventDefault();

        confirmacionPedido.classList.add("d-none");
        mensajeValidacion.textContent = "";

        // EVITAR PEDIDOS VACIOS
        if (carrito.length === 0) {

            mensajeValidacion.textContent =
                "Agrega productos al carrito antes de revisar tu pedido.";

            return;
        }

        // REVISAR CAMPOS OBLIGATORIOS
        const obligatorios = formularioPedido.querySelectorAll("[required]");

        let formularioCorrecto = true;
        let primerError = null;

        obligatorios.forEach(function(campo) {

            if (!validarCampo(campo)) {

                formularioCorrecto = false;

                if (!primerError) {
                    primerError = campo;
                }

            }

        });

        if (!formularioCorrecto) {

            mensajeValidacion.textContent =
                "Revisa los campos marcados antes de continuar.";

            primerError.focus();

            return;
        }

        // OBTENER DATOS DEL CLIENTE
        const nombre = document.querySelector(
            "#nombre-cliente"
        ).value.trim();

        const telefono = document.querySelector(
            "#telefono-cliente"
        ).value.trim();

        const entrega = tipoEntrega.value === "domicilio"
            ? "Entrega a domicilio"
            : "Recoger en el negocio";

        const direccion = direccionCliente.value.trim();

        const indicaciones = document.querySelector(
            "#indicaciones-pedido"
        ).value.trim();

        // MOSTRAR DATOS PARA REVISION
        let texto =
            "Nombre: " + nombre +
            " | Teléfono: " + telefono +
            " | Modalidad: " + entrega;

        if (tipoEntrega.value === "domicilio") {
            texto = texto + " | Dirección: " + direccion;
        }

        if (indicaciones !== "") {
            texto = texto + " | Indicaciones: " + indicaciones;
        }

        datosConfirmados.textContent = texto;

        // PREPARAR MENSAJE PARA WHATSAPP
        let mensaje =
            "Hola, quiero hacer un pedido en La Escondida:\n\n";

        let suma = 0;

        carrito.forEach(function(producto) {

            const subtotal =
                producto.precio * producto.cantidad;

            suma = suma + subtotal;

            mensaje = mensaje +
                "- " + producto.cantidad +
                " x " + producto.nombre +
                " ($" + producto.precio + " c/u): $" +
                subtotal + "\n";

        });

        mensaje = mensaje +
            "\nTotal de productos: $" + suma + " MXN";

        mensaje = mensaje +
            "\n\nNombre: " + nombre;

        mensaje = mensaje +
            "\nTelefono: " + telefono;

        mensaje = mensaje +
            "\nEntrega: " + entrega;

        if (tipoEntrega.value === "domicilio") {

            mensaje = mensaje +
                "\nDireccion: " + direccion;

            mensaje = mensaje +
                "\nCosto de envio: por confirmar";

        }

        if (indicaciones !== "") {

            mensaje = mensaje +
                "\nIndicaciones: " + indicaciones;

        }

        mensaje = mensaje +
            "\n\nPor favor, confirmame disponibilidad y total final. Gracias.";

        // CREAR ENLACE DE WHATSAPP
        enlaceWhatsapp.href =
            "https://wa.me/" + numeroNegocio +
            "?text=" + encodeURIComponent(mensaje);

        // MOSTRAR BOTON DE WHATSAPP
        confirmacionPedido.classList.remove("d-none");

        confirmacionPedido.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

        // NO VACIAMOS EL CARRITO AL ABRIR WHATSAPP
    });

    // INICIAR FORMULARIO
    cambiarTipoEntrega();
    mostrarResumenPedido();

}



// FORMULARIO DE CONTACTO - COMMIT 08
const formularioContacto = document.querySelector("#formulario-contacto");

if (formularioContacto) {
    const camposContacto = formularioContacto.querySelectorAll("[required]");
    const avisoContacto = document.querySelector("#contacto-aviso");
    const confirmacionContacto = document.querySelector("#contacto-confirmacion");
    const enlaceContacto = document.querySelector("#contacto-enviar");

    function validarContacto(campo) {
        const valido = campo.checkValidity() && campo.value.trim() !== "";
        campo.classList.toggle("campo-invalido", !valido);
        const aviso = document.getElementById("error-" + campo.id);
        aviso.textContent = valido ? "" : "Completa correctamente este campo.";
        return valido;
    }

    camposContacto.forEach(function(campo) {
        campo.addEventListener("input", function() {
            validarContacto(campo);
            confirmacionContacto.classList.add("d-none");
            enlaceContacto.removeAttribute("href");
        });
        campo.addEventListener("change", function() {
            validarContacto(campo);
            confirmacionContacto.classList.add("d-none");
            enlaceContacto.removeAttribute("href");
        });
    });

    formularioContacto.addEventListener("submit", function(evento) {
        evento.preventDefault();
        avisoContacto.textContent = "";
        confirmacionContacto.classList.add("d-none");

        let correcto = true;
        let primerError = null;
        camposContacto.forEach(function(campo) {
            if (!validarContacto(campo)) {
                correcto = false;
                if (!primerError) primerError = campo;
            }
        });

        if (!correcto) {
            avisoContacto.textContent = "Revisa los campos marcados antes de continuar.";
            primerError.focus();
            return;
        }

        const nombre = document.querySelector("#contacto-nombre").value.trim();
        const telefono = document.querySelector("#contacto-telefono").value.trim();
        const asunto = document.querySelector("#contacto-asunto").value;
        const mensaje = document.querySelector("#contacto-mensaje").value.trim();

        const texto = "Hola, tengo una consulta para La Escondida.\n\n" +
            "Nombre: " + nombre + "\nTelefono: " + telefono +
            "\nAsunto: " + asunto + "\nMensaje: " + mensaje;

        enlaceContacto.href = "https://wa.me/525585109332?text=" + encodeURIComponent(texto);
        confirmacionContacto.classList.remove("d-none");
    });
}
