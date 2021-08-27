import { Prenda } from "./Constructor.js"
import { PrendaVendida } from "./Constructor.js"
import { InfoArticulo } from "./Constructor.js"

//Tomando datos por evento submit del form de compras (el que se utiliza para ingresar la mercadería)
let miFormularioCompras = document.getElementById("formCompras");
if (miFormularioCompras) {
	miFormularioCompras.addEventListener("submit", validarFormularioCompras);
};

function validarFormularioCompras(e) {

	e.preventDefault();

	const articulo = document.getElementById("artIngresado").value,
		nombre = document.getElementById("nombreArt").value,
		tipoPrenda = document.getElementById("prend").value,
		almacen = document.getElementById("almacen").value,
		unidades = document.getElementById("cantidad").value,
		precioCompra = document.getElementById("costo").value,
		precioVenta = document.getElementById("precioVta").value;


	const prenda = new Prenda(articulo, nombre, tipoPrenda, almacen, unidades, precioCompra, precioVenta);

	agregar(prenda);

};

//Array declarado como constante. Se inicializa con datos del localSotrage "o" se inicializa vacío. Según el caso
const existencias = JSON.parse(localStorage.getItem("arrayExistencias")) || [];

//Función para subir al localStorage lo que se genera en la función que sigue (en la que ingresa la mercadería).
const guardarLocal = (clave, valor) => { localStorage.setItem(clave, valor) };

//Función para agregar objetos al array existencias a partir del evento que se toma del html compras. Antes de agregar elementos con
//push, primero, con el metodo some, evalua si algún objeto existe previamente y en ese caso lo modifica con forEach. Caso contrario,
//con push, se agrega al array. Por último se sube al localStorage con el nombre de clave "arrayExistencias" 
function agregar(prenda) {
	if (existencias.some(item => item.articulo == prenda.articulo)) {
		existencias.forEach(item => {
			if (prenda.articulo == item.articulo) {
				item.unidades = prenda.unidades + item.unidades;
				item.precioCompra = (((item.unidades - prenda.unidades) * item.precioCompra) + (prenda.unidades * prenda.precioCompra)) / item.unidades;
				item.precioCompra = item.precioCompra.toFixed(2);
			}
		})
	} else {
		existencias.push(prenda);
	}

	guardarLocal("arrayExistencias", JSON.stringify(existencias));
}


//CÓDIGO PARA HTML VENTAS
//En este bloque es donde está lo que me está trabando en este momento (hasta la linea 68)
$("#btnAgregar").on("click", function (e) {
	e.preventDefault();

	$("#agregando").append(`<div class="form-group">
								<input type="text" id="artVend" placeholder="Artículo" class="form-control">
							</div>
							<div class="form-group">
								<input type="number" id="cantVend" step="0.01" placeholder="Cantidad vendida"
									class="form-control">
							</div>`);
})


//Tomando datos evento submit por form ventas
let miFormularioVentas = document.getElementById("formVenta");

if (miFormularioVentas) {
	miFormularioVentas.addEventListener("submit", validarFormularioVentas);
}

function validarFormularioVentas(e) {

	e.preventDefault();

	const fechaVta = document.getElementById("fechaVta").value,
		articulo = document.getElementById("artVend").value,
		cantidad = document.getElementById("cantVend").value,
		formaPago = $('input[name="formaDePago"]:checked').val(),
		totalVta = 0;

	const venta = new PrendaVendida(fechaVta, articulo, cantidad, formaPago, totalVta);

	registrarVenta(venta);

};

//Array para registrar ventas y función para subirlas al localStorage para después poder filtrar por fechas, por artículo, etc.
const ventasDiarias = JSON.parse(localStorage.getItem("arrayVentas")) || []
const guardarVentasLocal = (clave, valor) => { localStorage.setItem(clave, valor) };

//Declaración e inicializacion de variable para usar en la función de registrar Venta
let totalVenta = 0;
//Función para pasar vtas. Toma los datos del form de ventas con los que se instancia el objeto que se pasa como parámetro. Evalua que el artículo 
//exista (a partir del stock generado en compras) y por un lado modifica el stock del localstorage y crea otro array con datos de la vta para después
//usarlo como datos para hacer informes diversos
function registrarVenta(venta) {
	if (existencias.some(item => item.articulo == venta.articulo)) {
		existencias.forEach(item => {
			if (venta.articulo == item.articulo) {
				if ((item.unidades - venta.cantidad) >= 0) {
					item.unidades = item.unidades - venta.cantidad;
					if (venta.formaPago === "EF") {
						totalVenta = (item.precioVenta * venta.cantidad) * 0.90;
					} else {
						totalVenta = (item.precioVenta * venta.cantidad)
					}
					venta.totalVta = totalVenta;
					ventasDiarias.push(venta);
					guardarVentasLocal("arrayVentas", JSON.stringify(ventasDiarias));
					$("#divVenta").prepend(`<div id="parrafoInfo" class="col-md-6 text-center alert alert-success" role="alert">
											<p><strong>El total a cobrar por la venta de ${venta.cantidad} unidad/es de la ${item.tipoPrenda} ${item.nombre} es $${totalVenta}</strong></p>
											<button type="button" class="btn btn-secondary" id="btnCerrarInfo">Cerrar</button>											
											</div>`);
					$("#btnCerrarInfo").click(() => {
						$("#parrafoInfo").slideUp(800);
					});
				} else {
					$("#divVenta").prepend(`<div id="parrafoAler" class="col-md-6 text-center alert alert-danger" role="alert" >
											<p>No hay suficiente stock del artículo ${venta.articulo}, no se puede realizar la venta</p>
											<button type="button" class="btn btn-secondary" id="btnCerrarInfo1">Cerrar</button>
											</div>`);
					$("#btnCerrarInfo1").click(() => {
						$("#parrafoAler").slideUp(800);
					})
				}
			}
		})
	}
	guardarLocal("arrayExistencias", JSON.stringify(existencias));
}
//Jquery a partir del after de Fran, para desplegar el formulario de ventas
let contador = 0;
const crearFormVta = () => {
	$("#btn_abrir_formVta").click(() => {
		$(".formParaVenta").slideToggle(800);

		contador++
		if (contador % 2 != 0) {
			$("#btn_abrir_formVta").html("Cerrar Formulario");
		} else {
			$("#btn_abrir_formVta").html("Venta");
		}

	})
}
crearFormVta();




//Form de la sección ventas que arroja, por código o por nombre, info de los artículos existentes
let formInfo = document.getElementById("formInfo");

if (formInfo) {
	formInfo.addEventListener("submit", validarFormularioInfo);
}

function validarFormularioInfo(e) {

	e.preventDefault();

	const articulo = document.getElementById("artInfo").value,
		nombreArt = document.getElementById("nombreInfo").value;


	const consultaArt = new InfoArticulo(articulo, nombreArt);

	registrarConsulta(consultaArt);
}

function registrarConsulta(consultaArt) {
	if (existencias.some(item => (item.articulo == consultaArt.articulo) || (item.nombre == consultaArt.nombreArt))) {
		existencias.forEach(item => {
			if ((item.articulo == consultaArt.articulo) || (item.nombre == consultaArt.nombreArt)) {
				$("#divInfo").prepend(`<div id="pInfo" class="col-md-6 text-center alert alert-success" role="alert">
										<p>El artículo ${item.nombre}, código ${item.articulo}, se encuentra en el almacen ${item.almacen} y hay disponibles ${item.unidades} unidades. Precio: $${item.precioVenta}</p>
										<button id="btnA" class="btn btn-primary btn-block">Cerrar</button>
										</div>`);
				$("#btnA").click(() => {
					$("#pInfo").fadeOut(800);
				});
			}
		})
	} else {
		$("#divInfo").prepend(`<div id="pAlert" class="col-md-6 text-center alert alert-danger" role="alert">
								<p>El artículo consultado no existe</p>
								<button type="button" class="btn btn-primary btn-block" id="btnA" >Cerrar</button>
								</div>`);
		$("#btnA").click(() => {
			$("#pAlert").fadeOut(800);
		});
	}
};


//Jquery a partir del after de Fran, para desplegar el formulario de info
const crearFormInfo = () => {
	$("#btn_abrir_form").click(() => {
		$(".formInfoArt").slideToggle(800);

		contador++
		if (contador % 2 != 0) {
			$("#btn_abrir_form").html("Cerrar Formulario");
		} else {
			$("#btn_abrir_form").html("Información Artículo");
		}

	})
}
crearFormInfo();



/*
//Desafío complementario
//Se crea la función ordenarMenorAMayor para luego ejecutarla y ordenar el array productos por precio de vta,
//de menos a mayor
function ordenarMenorAMayor() {
	productos.sort((a, b) => {
		if (a.precioVenta < b.precioVenta) {
			return -1;
		}
	})
}

ordenarMenorAMayor();
*/













