document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-lista");
  const lista = document.getElementById("lista-productos");
  const ordenarBtn = document.getElementById("ordenar-btn");
  const ordenarPrioridadBtn = document.getElementById("ordenar-prioridad");
  const limpiarBtn = document.getElementById("limpiar-btn");
  const busqueda = document.getElementById("busqueda");
  const filtroCategoria = document.getElementById("filtro-categoria");
  const contador = document.getElementById("contador");

  let productos = [];

  function mostrarLista(filtrados = productos) {
    lista.innerHTML = "";

    filtrados.forEach((item, index) => {
      const li = document.createElement("li");
      li.textContent = `${item.cantidad} x ${item.producto} (${item.categoria}) - Prioridad: ${item.prioridad}`;
      li.classList.add(`prioridad-${item.prioridad}`);

      if (item.comprado) li.classList.add("comprado");

      li.addEventListener("click", () => {
        item.comprado = !item.comprado;
        mostrarLista();
      });

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "x";
      btnEliminar.classList.add("eliminar");
      btnEliminar.addEventListener("click", (e) => {
        e.stopPropagation();
        productos.splice(index, 1);
        actualizarCategorias();
        mostrarLista();
      });

      li.appendChild(btnEliminar);
      lista.appendChild(li);
    });

    actualizarContador();
  }

  function actualizarContador() {
    contador.textContent = `Total de productos: ${productos.length}`;
  }

  function actualizarCategorias() {
    const categorias = [...new Set(productos.map(p => p.categoria))];
    filtroCategoria.innerHTML = `<option value="">Todas las categorías</option>`;
    categorias.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      filtroCategoria.appendChild(option);
    });
  }

  async function cargarProductos() {
    try {
      const res = await fetch("https://web-7b2e.onrender.com");
      const data = await res.json();
      productos = data.map(i => ({
        producto: i.nombre_item,
        cantidad: i.cantidad,
        categoria: "General",
        prioridad: "Media",
        comprado: i.comprado === 1
      }));
      actualizarCategorias();
      mostrarLista();
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const producto = document.getElementById("producto").value.trim();
    const categoria = document.getElementById("categoria").value.trim();
    const cantidad = document.getElementById("cantidad").value.trim();
    const prioridad = document.getElementById("prioridad").value;

    if (!producto || !categoria || !cantidad) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const nuevo = { nombre_item: producto, cantidad: cantidad };

    try {
    const res = await fetch("https://web-7b2e.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo)
      });

      const data = await res.json();
      console.log("Producto guardado:", data);

      productos.push({ producto, categoria, cantidad, prioridad, comprado: false });
      actualizarCategorias();
      mostrarLista();
      form.reset();
    } catch (err) {
      console.error(" Error al guardar:", err);
      alert("Error al guardar en la base de datos");
    }
  });

  ordenarBtn.addEventListener("click", () => {
    productos.sort((a, b) => a.producto.localeCompare(b.producto));
    mostrarLista();
  });

  ordenarPrioridadBtn.addEventListener("click", () => {
    const niveles = { Alta: 1, Media: 2, Baja: 3 };
    productos.sort((a, b) => niveles[a.prioridad] - niveles[b.prioridad]);
    mostrarLista();
  });

  limpiarBtn.addEventListener("click", () => {
    if (confirm("¿Seguro que quieres eliminar toda la lista?")) {
      productos = [];
      actualizarCategorias();
      mostrarLista();
    }
  });

  busqueda.addEventListener("input", () => {
    const texto = busqueda.value.toLowerCase();
    const filtrados = productos.filter(p =>
      p.producto.toLowerCase().includes(texto) ||
      p.categoria.toLowerCase().includes(texto)
    );
    mostrarLista(filtrados);
  });

  filtroCategoria.addEventListener("change", () => {
    const categoria = filtroCategoria.value;
    if (categoria === "") {
      mostrarLista();
    } else {
      const filtrados = productos.filter(p => p.categoria === categoria);
      mostrarLista(filtrados);
    }
  });

  cargarProductos();

});
