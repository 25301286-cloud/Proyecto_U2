// CARRITO DE LA ESCONDIDA
// El mismo archivo funciona en Inicio, Menu y Carrito.

let carrito = [];

try {
    carrito = JSON.parse(localStorage.getItem("carritoLaEscondida")) || [];
    if (!Array.isArray(carrito)) {
        carrito = [];
    }
} catch (error) {
    carrito = [];
}

const botonesAgregar = document.querySelectorAll(".btn-agregar");
const contadores = document.querySelectorAll(".contador-carrito");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total-carrito");
const cantidadCarrito = document.getElementById("cantidad-carrito");
const vaciarCarrito = document.getElementById("vaciar-carrito");
const mensajeCarrito = document.getElementById("mensaje-carrito");
const mensajeProducto = document.getElementById("mensaje-producto");

function guardarCarrito() {
    localStorage.setItem("carritoLaEscondida", JSON.stringify(carrito));
}

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

// Actualizar el precio al elegir una carne
const selectoresCarne = document.querySelectorAll(".tipo-carne");

selectoresCarne.forEach(function(selector) {
    selector.addEventListener("change", function() {
        const grupo = selector.parentElement;
        const boton = grupo.querySelector(".btn-agregar");
        const precioBase = Number(boton.dataset.precio);
        const carneElegida = selector.value.trim().toLowerCase();
        const precioFinal = precioBase + (carneElegida === "tripa" ? 5 : 0);
        const precioTexto = grupo.querySelector(".precio-carne");

        if (selector.value === "") {
            precioTexto.textContent = "Desde $" + precioBase;
        } else {
            precioTexto.textContent = "$" + precioFinal;
        }

        selector.classList.remove("campo-invalido");
    });
});

// Agregar la cantidad seleccionada de un producto
botonesAgregar.forEach(function(boton) {
    boton.addEventListener("click", function() {
        let nombre = boton.dataset.nombre;
        let precio = Number(boton.dataset.precio);
        const grupo = boton.parentElement;
        const campo = grupo.querySelector(".cantidad-producto");
        const cantidad = Number(campo.value);

        // En antojitos con carne hay que elegirla antes de agregar
        const selector = grupo.querySelector(".tipo-carne");
        if (selector) {
            if (selector.value === "") {
                selector.classList.add("campo-invalido");
                selector.focus();
                if (mensajeProducto) {
                    mensajeProducto.textContent = "Selecciona el tipo de carne para " + nombre + ".";
                }
                return;
            }

            nombre = nombre + " - " + selector.value;
            if (selector.value.trim().toLowerCase() === "tripa") {
                precio = precio + 5;
            }
        }

        // Solo se permiten cantidades entre 1 y 99
        if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) {
            campo.focus();
            if (mensajeProducto) {
                mensajeProducto.textContent = "Selecciona una cantidad entre 1 y 99.";
            }
            return;
        }

        // La misma comida con distinta carne se guarda por separado
        const encontrado = carrito.find(function(producto) {
            return producto.nombre === nombre;
        });

        if (encontrado) {
            encontrado.cantidad = encontrado.cantidad + cantidad;
            encontrado.precio = precio;
        } else {
            carrito.push({ nombre: nombre, precio: precio, cantidad: cantidad });
        }

        guardarCarrito();
        actualizarContador();
        campo.value = 1;

        if (mensajeProducto) {
            mensajeProducto.textContent = cantidad + " x " + nombre + " agregado al carrito.";
        }
    });
});

// Mostrar el carrito en carrito.html
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
        subtotal.textContent = "$" + producto.precio + " x " + producto.cantidad +
            " = $" + producto.precio * producto.cantidad;

        informacion.appendChild(nombre);
        informacion.appendChild(subtotal);

        const controles = document.createElement("div");
        controles.className = "controles-carrito";

        const menos = document.createElement("button");
        menos.type = "button";
        menos.textContent = "-";
        menos.setAttribute("aria-label", "Disminuir " + producto.nombre);
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

        const mas = document.createElement("button");
        mas.type = "button";
        mas.textContent = "+";
        mas.setAttribute("aria-label", "Aumentar " + producto.nombre);
        mas.addEventListener("click", function() {
            producto.cantidad = producto.cantidad + 1;
            guardarCarrito();
            mostrarCarrito();
        });

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
        mensajeCarrito.textContent = "Puedes cambiar las cantidades o quitar productos.";
    }

    vaciarCarrito.disabled = carrito.length === 0;

    // El boton para continuar solo aparece si hay productos
    const continuarPedido = document.getElementById("continuar-pedido");
    if (continuarPedido) {
        continuarPedido.classList.toggle("d-none", carrito.length === 0);
    }
}

if (vaciarCarrito) {
    vaciarCarrito.addEventListener("click", function() {
        carrito = [];
        guardarCarrito();
        mostrarCarrito();
    });
}

actualizarContador();
mostrarCarrito();


// FORMULARIO DEL PEDIDO
// Este bloque se ejecuta solamente en pedido.html.
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
    const botonRevisar = document.querySelector("#revisar-pedido");
    const pedidoVacio = document.querySelector("#pedido-vacio");
    const ayudaFormulario = document.querySelector("#ayuda-formulario");

    // Mostrar los productos que llegaron del carrito
    function mostrarResumenPedido() {
        resumenProductos.innerHTML = "";
        let total = 0;

        carrito.forEach(function(producto) {
            const fila = document.createElement("div");
            fila.className = "linea-resumen";

            const nombre = document.createElement("span");
            nombre.textContent = producto.cantidad + " x " + producto.nombre;

            const precio = document.createElement("strong");
            precio.textContent = "$" + (producto.precio * producto.cantidad);

            fila.appendChild(nombre);
            fila.appendChild(precio);
            resumenProductos.appendChild(fila);
            total = total + producto.precio * producto.cantidad;
        });

        totalPedido.textContent = "$" + total + " MXN";

        // Sin productos no mostramos el formulario ni permitimos continuar
        const carritoVacio = carrito.length === 0;
        formularioPedido.classList.toggle("d-none", carritoVacio);
        pedidoVacio.classList.toggle("d-none", !carritoVacio);
        ayudaFormulario.classList.toggle("d-none", carritoVacio);
        botonRevisar.disabled = carritoVacio;

        if (carritoVacio) {
            avisoResumen.textContent = "Tu carrito está vacío. Agrega alimentos desde el menú.";
        } else {
            avisoResumen.textContent = "";
        }
    }

    // Mostrar la dirección solo cuando sea entrega a domicilio
    function cambiarTipoEntrega() {
        const esDomicilio = tipoEntrega.value === "domicilio";
        grupoDireccion.classList.toggle("d-none", !esDomicilio);
        direccionCliente.required = esDomicilio;

        if (!esDomicilio) {
            direccionCliente.value = "";
            direccionCliente.classList.remove("campo-invalido");
            document.querySelector("#error-direccion-cliente").textContent = "";
        }
    }

    // Validar un campo y mostrar el error debajo
    function validarCampo(campo) {
        if (campo === direccionCliente && !direccionCliente.required) {
            return true;
        }

        let valido = campo.checkValidity();

        if (campo.type !== "checkbox" && campo.required && campo.value.trim() === "") {
            valido = false;
        }

        campo.classList.toggle("campo-invalido", !valido);
        const error = document.getElementById("error-" + campo.id);

        if (error) {
            if (valido) {
                error.textContent = "";
            } else if (campo.id === "nombre-cliente") {
                error.textContent = "Escribe tu nombre (mínimo 3 caracteres).";
            } else if (campo.id === "telefono-cliente") {
                error.textContent = "Escribe un número de 10 dígitos, sin espacios.";
            } else if (campo.id === "tipo-entrega") {
                error.textContent = "Selecciona la forma de entrega.";
            } else if (campo.id === "direccion-cliente") {
                error.textContent = "Escribe una dirección de al menos 8 caracteres.";
            } else if (campo.id === "confirmar-productos") {
                error.textContent = "Debes revisar y confirmar los productos.";
            }
        }

        return valido;
    }

    tipoEntrega.addEventListener("change", cambiarTipoEntrega);

    // Limpiar o mostrar errores al modificar los campos
    const campos = formularioPedido.querySelectorAll("input, select, textarea");
    campos.forEach(function(campo) {
        campo.addEventListener("input", function() {
            if (campo.required) {
                validarCampo(campo);
            }
            confirmacionPedido.classList.add("d-none");
        });

        campo.addEventListener("change", function() {
            if (campo.required) {
                validarCampo(campo);
            }
            confirmacionPedido.classList.add("d-none");
        });
    });

    formularioPedido.addEventListener("submit", function(evento) {
        evento.preventDefault();
        confirmacionPedido.classList.add("d-none");
        mensajeValidacion.textContent = "";

        if (carrito.length === 0) {
            mensajeValidacion.textContent = "Agrega productos al carrito antes de revisar tu pedido.";
            return;
        }

        // Validar los campos obligatorios
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
            mensajeValidacion.textContent = "Revisa los campos marcados antes de continuar.";
            primerError.focus();
            return;
        }

        const nombre = document.querySelector("#nombre-cliente").value.trim();
        const telefono = document.querySelector("#telefono-cliente").value.trim();
        const entrega = tipoEntrega.value === "domicilio" ? "Entrega a domicilio" : "Recoger en el negocio";
        const direccion = direccionCliente.value.trim();
        const indicaciones = document.querySelector("#indicaciones-pedido").value.trim();

        let texto = "Nombre: " + nombre + " | Teléfono: " + telefono + " | Modalidad: " + entrega;

        if (tipoEntrega.value === "domicilio") {
            texto = texto + " | Dirección: " + direccion;
        }
        if (indicaciones !== "") {
            texto = texto + " | Indicaciones: " + indicaciones;
        }

        datosConfirmados.textContent = texto;
        confirmacionPedido.classList.remove("d-none");
        confirmacionPedido.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    cambiarTipoEntrega();
    mostrarResumenPedido();
}