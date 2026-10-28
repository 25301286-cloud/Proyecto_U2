
/* CARRITO DE COMPRAS DE LA ESCONDIDA */

let carrito = [];

// Recuperar los productos guardados
try {
    carrito = JSON.parse(localStorage.getItem("carritoLaEscondida")) || [];

    if (!Array.isArray(carrito)) {
        carrito = [];
    }
} catch (error) {
    carrito = [];
}

// Elementos del HTML
const botonesAgregar = document.querySelectorAll(".btn-agregar");
const contadores = document.querySelectorAll(".contador-carrito");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total-carrito");
const cantidadCarrito = document.getElementById("cantidad-carrito");
const vaciarCarrito = document.getElementById("vaciar-carrito");
const mensajeCarrito = document.getElementById("mensaje-carrito");
const mensajeProducto = document.getElementById("mensaje-producto");

// Guardar el carrito
function guardarCarrito() {
    localStorage.setItem("carritoLaEscondida", JSON.stringify(carrito));
}

// Actualizar el contador del encabezado
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

// ACTUALIZAR EL PRECIO SEGUN LA CARNE
const selectoresCarne = document.querySelectorAll(".tipo-carne");

selectoresCarne.forEach(function(selector) {

    selector.addEventListener("change", function() {

        const grupo = selector.parentElement;
        const boton = grupo.querySelector(".btn-agregar");
        const precioBase = Number(boton.dataset.precio);

        const carneElegida = selector.value.trim().toLowerCase();

        let precioFinal = precioBase;

        // La tripa cuesta 5 pesos adicionales
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

        // Revisar si el producto permite elegir carne
        const selector = grupo.querySelector(".tipo-carne");

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

            const carne = selector.value.trim();

            nombre = nombre + " - " + carne;

            // Agregar 5 pesos si elige tripa
            if (carne.toLowerCase() === "tripa") {
                precio = precio + 5;
            }
        }

        // Validar la cantidad
        if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) {

            campo.focus();

            if (mensajeProducto) {
                mensajeProducto.textContent =
                    "Selecciona una cantidad entre 1 y 99.";
            }

            return;
        }

        // Buscar si el producto ya esta en el carrito
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

// MOSTRAR LOS PRODUCTOS DEL CARRITO
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

    // Actualizar el total
    totalCarrito.textContent = "$" + total + " MXN";

    actualizarContador();

    if (carrito.length === 0) {
        mensajeCarrito.textContent = "Tu carrito está vacío.";
    } else {
        mensajeCarrito.textContent =
            "Puedes cambiar las cantidades o quitar productos.";
    }

    vaciarCarrito.disabled = carrito.length === 0;
}

// VACIAR EL CARRITO
if (vaciarCarrito) {

    vaciarCarrito.addEventListener("click", function() {

        carrito = [];

        guardarCarrito();
        mostrarCarrito();
    });
}

// Ejecutar al cargar la pagina
actualizarContador();
mostrarCarrito();
