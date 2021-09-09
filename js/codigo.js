import { Prenda } from "./Constructor.js"
import { PrendaVendida } from "./Constructor.js"
import { InfoArticulo } from "./Constructor.js"
import { FacturaCompra } from "./Constructor.js"
import { FacturaVenta } from "./Constructor.js"
import { Cliente } from "./Constructor.js"



function ordenarPorFecha(arrayOrdenar) {
	arrayOrdenar.sort((a, b) => {
		if (a.fecha < b.fecha) {
			return -1;
		}
	})
}




$(document).ready(function () {


	//Se usa archivo Json para completar select de html compras
	$.ajax({
		method: "GET",
		url: "data/datosProveedores.json",
		dataType: "json",
		success: function (data) {
			for (let i = 0; i < data.length; i++) {
				$("#selectProv").append(`
										<option value="${i}">${data[i].nombre}</option>
										`);


			};
		}
	});

	//Función que toma valores del DOM para instanciar objetos que se pushean a dos arrays distintos, el de existencias y el de existencias para info
	//de factura de compra
	$("#formCompraDetalle").on("submit", function (e) {
		e.preventDefault();
		if ($("#inputCantidad").val() != "" && $("#inputCodArticulo").val() != "" && $("#inputNomArticulo").val() != "" && $("#inputPrenda").val() != "" && $("#inputAlmacen").val() != "" && $("#inputPCosto").val() != "" && $("#inputPVenta").val() != "") {
			const unidades = $("#inputCantidad").val(),
				articulo = $("#inputCodArticulo").val(),
				nombre = $("#inputNomArticulo").val(),
				tipoPrenda = $("#inputPrenda").val(),
				almacen = $("#inputAlmacen").val(),
				precioCompra = $("#inputPCosto").val(),
				precioVenta = $("#inputPVenta").val();

			const prenda = new Prenda(unidades, articulo, nombre, tipoPrenda, almacen, precioCompra, precioVenta);

			const prendaTabla = new Prenda(unidades, articulo, nombre, tipoPrenda, almacen, precioCompra, precioVenta);

			existenciasTabla.push(prendaTabla);

			armarTabla();
			agregar(prenda);
			mostrar();

			$("#formCompraDetalle")[0].reset();
		} else {
			$("#alerta").fadeIn(800, function () {
				$("#alerta").fadeOut(1500);
			})
		}
	});

	//Función para ir pintando el total de la factura de compra
	function mostrar() {
		let conteoTotal = 0;

		existenciasTabla.forEach(item => {
			conteoTotal += item["total"];
		})
		$("#inputMostrarTotal").val(`${conteoTotal}`)
	}

	//funcion que genera stock de mercadería en base a factura de compra
	function agregar(prenda) {
		if (existencias.some(item => item.articulo == prenda.articulo)) {
			existencias.forEach(item => {
				if (prenda.articulo == item.articulo) {
					item.unidades = prenda.unidades + item.unidades;
					item.precioCompra = (((item.unidades - prenda.unidades) * item.precioCompra) + (prenda.unidades * prenda.precioCompra)) / item.unidades;
					item.precioCompra = Number(item.precioCompra.toFixed(2));
					item.precioVenta = prenda.precioVenta;
				}
			})
		} else {
			existencias.push(prenda);
		}
		guardarLocal("arrayExistencias", JSON.stringify(existencias));
	}

	//Función para pintar en factura de compra
	function armarTabla() {
		$("#tableCompra").empty();

		existenciasTabla.forEach(function (detalle, indice) {
			$("#tableCompra").append(`<tr id="trId${indice}">
									<td>${detalle.unidades}</td>
									<td>${detalle.articulo}</td>
									<td>${detalle.nombre}</td>
									<td>${detalle.tipoPrenda}</td>
									<td>${detalle.almacen}</td>
									<td>${detalle.precioCompra}</td>
									<td>${detalle.precioVenta}</td>
									<td>${detalle.total}</td>
									<td><input type="button" class="borrar btn btn-danger" value="Eliminar" /></td>
									</tr>`);

		});
	};

	//Función para eliminar articulos pintados en DOM (en la factura antes de guardarla) que impacta en existencias(stock) 
	$(function () {
		$("#tableCompra").on("click", ".borrar", function (e) {
			e.preventDefault();

			let datoArticulo = $(this).closest("tr").children()[1].textContent;
			let datoCantidad = $(this).closest("tr").children()[0].textContent;
			let datoPrecio = $(this).closest("tr").children()[5].textContent;

			if (existenciasTabla.some(item => item.articulo == datoArticulo)) {
				existenciasTabla = existenciasTabla.filter(item => item.articulo != datoArticulo);
			}

			$(this).closest('tr').remove();

			if (existencias.some(item => item.articulo == datoArticulo)) {
				existencias.forEach(item => {
					if (item.articulo == datoArticulo && item.unidades > datoCantidad) {
						item.precioCompra = ((item.unidades * item.precioCompra) - (datoCantidad * datoPrecio)) / (item.unidades - datoCantidad);
						item.precioCompra = Number(item.precioCompra.toFixed(2));
						item.unidades = item.unidades - datoCantidad;
					} else if (item.articulo == datoArticulo && item.unidades == datoCantidad) {
						existencias = existencias.filter(item => item.articulo != datoArticulo);
					}
				})
			}
			guardarLocal("arrayExistencias", JSON.stringify(existencias));
		});
	});

	//funcion para guardar datos de factura de compra (inputs con datos proveedor y total y array de productos comprados)
	$("#botonGuardarFactura").on("click", function (e) {
		e.preventDefault();

		let totalFactura = 0;//variable para calcular total de la factura de compra y alojar como elemento del objeto

		if ($("#selectProv").val() > 0 && $("#inputNumFactura").val() != "" && $("#inputFecha").val() != "" && existenciasTabla != "" && $("#inputPago").val() != "") {
			const id = $("#selectProv").val(),
				proveedor = $("#selectProv option:selected").text(),
				numeroFact = $("#inputNumFactura").val(),
				fecha = $("#inputFecha").val(),
				detalle = existenciasTabla;

			existenciasTabla.forEach(item => {
				totalFactura += item["total"];
			})
			const totalCompra = totalFactura,
				pago = $("#inputPago").val();

			const factCompra = new FacturaCompra(id, proveedor, numeroFact, fecha, detalle, totalCompra, pago);
			facturasCompra.push(factCompra);

			$("#formDatosCompra")[0].reset();
			$("#formCompraDetalle")[0].reset();
			$("#formPago")[0].reset();

			localStorage.setItem("facturasDeCompra", JSON.stringify(facturasCompra));




			$("#tablaCompra tr:gt(0)").remove();

			$("#infoFactCompra").append(`<div id="div2">
										<h4>Proveedor: ${factCompra.proveedor} / Factura nº: ${factCompra.numeroFact} / Total: $${factCompra.totalCompra} / Pago: $${factCompra.pago}<h4>
										<p>Chequear información y "Confirmar"</p>
										</div>
										`);

			$("#factCompra").fadeOut(800, function () {
				$("#resultado").fadeIn(800);
			});

			$("#seccionConsultaProv").fadeOut(800);


			function vaciar() {
				existenciasTabla = [];
			}
			vaciar();

		} else {
			$("#alerta").fadeIn(800, function () {
				$("#alerta").fadeOut(1500);
			})
		}
	});

	//click que muestra facturas de cada proveedor, saldo pendiente de cada una y saldo total adeudado
	$("#btnConsultaProv").on("click", function (e) {
		e.preventDefault();

		const id = $("#idConsultaProv").val();
		const facturasCompraProv = JSON.parse(localStorage.getItem("facturasDeCompra"));

		arrayTempInfoProv = facturasCompraProv.filter(factura => factura.id == id);

		ordenarPorFecha(arrayTempInfoProv);

		$("#tableInfoProv").empty();

		let creditoCompra = 0;
		let debitocompra = 0;
		let totalSaldo = 0;

		arrayTempInfoProv.forEach(function (detalle, i) {
			let pendiente = detalle.totalCompra - detalle.pago;
			creditoCompra += detalle["totalCompra"];
			debitocompra += detalle["pago"];
			totalSaldo = creditoCompra - debitocompra;

			$("#tableInfoProv").append(`<tr>
										<td>${detalle.fecha}</td>
										<td>${detalle.numeroFact}</td>
										<td>${detalle.totalCompra}</td>
										<td>${detalle.pago}</td>
										<td id="pId${i}">${pendiente} </td>
										</tr>`);

			$("#totalPend").val(totalSaldo);
		});

		$("#factCompra").fadeOut(400);
	});


	$("#idConsultaProv").change(function (e) {
		const idP = $("#idConsultaProv").val();
		if (facturasCompra.some(item => item.id == idP)) {
			facturasCompra.forEach(item => {
				if (item.id == idP) {
					$("#nombreConsultaProv").val(item.proveedor);
				}
			});
		};
	});


	$("#btnPagarProv").on("click", function (e) {
		e.preventDefault();
		const id = $("#idConsultaProv").val();
		let montoP = Number($("#idPagoSaldo").val());

		ordenarPorFecha(facturasCompra)

		while (montoP > 0) {
			let facturaPendiente = facturasCompra.find(item => item.id == id && (item.totalCompra - item.pago) > 0)
			let saldo = facturaPendiente.totalCompra - facturaPendiente.pago;
			if (montoP <= saldo) {
				facturaPendiente.pago = facturaPendiente.pago + montoP;
				montoP = montoP - montoP;
			} else if (montoP > saldo) {
				facturaPendiente.pago = facturaPendiente.pago + saldo;
				montoP = montoP - saldo
			}
		};

		$("#formPagoSaldoP")[0].reset();

		localStorage.setItem("facturasDeCompra", JSON.stringify(facturasCompra));

		const facturasCompraProv = JSON.parse(localStorage.getItem("facturasDeCompra"));

		arrayTempInfoProv = facturasCompraProv.filter(factura => factura.id == id);

		ordenarPorFecha(arrayTempInfoProv);

		$("#tableInfoProv").empty();

		let creditoCompra = 0;
		let debitocompra = 0;
		let totalSaldo = 0;

		arrayTempInfoProv.forEach(function (detalle, i) {
			let pendiente = detalle.totalCompra - detalle.pago;
			creditoCompra += detalle["totalCompra"];
			debitocompra += detalle["pago"];
			totalSaldo = creditoCompra - debitocompra;

			$("#tableInfoProv").append(`<tr>
										<td>${detalle.fecha}</td>
										<td>${detalle.numeroFact}</td>
										<td>${detalle.totalCompra}</td>
										<td>${detalle.pago}</td>
										<td id="pId${i}">${pendiente} </td>
										</tr>`);

			$("#totalPend").val(totalSaldo);
		});
	});

	$("#btnLimpiarConsultaProv").on("click", function (e) {
		e.preventDefault();

		$("#formPagoSaldoP")[0].reset();
		$("#formConsulta")[0].reset();
		$("#tablaInfoProv tr:gt(0)").remove();
		$("#factCompra").fadeIn(400);
	});

	//Botón para confimar y traer nuevamente a la vista los campos para seguir ingresando una nueva factura
	$("#btnConfirmarPago").on("click", function (e) {
		e.preventDefault();

		$("#div2").remove();

		$("#resultado").fadeOut(700);

		$("#factCompra").fadeIn(1000);

		$("#inputPagoProv")[0].reset();

		$("#seccionConsultaProv").fadeIn(1000);

	});

	//Función para autocompletar con info de existencias si existe y con placeholder cuando no existe el articulo
	$("#inputCodArticulo").change(function (e) {
		const codigo = $("#inputCodArticulo").val();
		if (existencias.some(item => item.articulo == codigo)) {
			existencias.forEach(item => {
				if (item.articulo == codigo) {
					$("#inputNomArticulo").val(item.nombre);
					$("#inputPrenda").val(item.tipoPrenda);
					$("#inputAlmacen").val(item.almacen);
					$("#inputPCosto").val(item.precioCompra);
					$("#inputPVenta").val(item.precioVenta);
				}
			})
		} else {
			$("#inputNomArticulo").attr("placeholder", "ej: Viena");
			$("#inputPrenda").attr("placeholder", "Ej: Remera");
			$("#inputAlmacen").attr("placeholder", "Ej: 1");
			$("#inputPCosto").attr("placeholder", "Ej: 550");
			$("#inputPVenta").attr("placeholder", "Ej: 1100");
		}
	});

	/*
		//Prueba para filtar por fecha y sacar totales de compra en base a ese parámetro, los mismo puede aplicarse a proveedor. Habría que ver como buscar
		//según el artículo, en que factura tuvo movimiento (compra o venta)
		let facturasDeCompraLStorage = JSON.parse(localStorage.getItem("facturasDeCompra"));
		//console.log(facturasDeCompraLStorage);
		
		const filtro2 = facturasDeCompraLStorage.filter(factura => factura.proveedor == "WUPPER JEANS")
		console.log(filtro2)
		//const filtro1 = facturasDeCompraLStorage.filter(factura => factura.fecha >= "2021-09-01" && factura.fecha <= "2021-09-30")
		//console.log(filtro1);
		let totales = 0;
		let pagos = 0;
		filtro2.forEach(item => {
			totales += item["totalCompra"];
			pagos += item["pago"];
			let saldo = totales - pagos;
			console.log(saldo)
		})
		//console.log(comprasMes);
	*/


	//------------------------------------------------------------------------------------
	//Codigo para HTML Ventas!!!
	//------------------------------------------------------------------------------------

	//captura de inputs en seccion vta para instanciar objeto venta que se pushea a array temporal
	$("#formVtaDetalle").on("submit", function (e) {
		e.preventDefault();

		if ($("#inputCantVta").val() != "" && $("#inputCodArtVta").val() != "" && $("#inputNomArtVta").val() != "" && $("#inputPVta").val() != "") {

			const cantidad = $("#inputCantVta").val(),
				articulo = $("#inputCodArtVta").val(),
				nombre = $("#inputNomArtVta").val(),
				pUnit = $("#inputPVta").val();

			const venta = new PrendaVendida(cantidad, articulo, nombre, pUnit);

			arrayTemporalVta.push(venta);

			modificarExistencias(venta);
			pintarTablaVta();

			$("#formVtaDetalle")[0].reset();
		} else {
			$("#alertaVta").fadeIn(800, function () {
				$("#alertaVta").fadeOut(1500);
			})
		}
	});



	//Funcion que modifica el stock en el localStorage
	function modificarExistencias(venta) {
		if (existencias.some(item => item.articulo == venta.articulo)) {
			existencias.forEach(item => {
				if (item.articulo == venta.articulo) {
					if ((item.unidades - venta.cantidad) >= 0) {
						item.unidades = item.unidades - venta.cantidad
					} else {
						alert("No hay stock, acá iría algo por DOM")
					}
				}
			})
		}
		guardarLocal("arrayExistencias", JSON.stringify(existencias));
	};

	//Funcion para cargar más articulos en la factura de vta
	function pintarTablaVta() {
		$("#tableVenta").empty();
		arrayTemporalVta.forEach(function (detalle, indice) {
			$("#tableVenta").append(`<tr id="trIdVta${indice}">
									<td>${detalle.cantidad}</td>										
									<td>${detalle.articulo}</td>
									<td>${detalle.nombre}</td>
									<td>${detalle.pUnit}</td>
									<td>${detalle.total}</td>
									<td><input type="button" class="borrarVta btn btn-danger" value="Eliminar" /></td>
									</tr>`)
		});
	}

	//captura de inputs para rellenar el resto automaticamente
	$("#inputCodArtVta").change(function (e) {
		const codigoV = $("#inputCodArtVta").val();
		if (existencias.some(item => item.articulo == codigoV)) {
			existencias.forEach(item => {
				if (item.articulo == codigoV) {
					$("#inputNomArtVta").val(item.nombre);
					$("#inputPVta").val(item.precioVenta);
				}
			})
		} else {
			$("#inputNomArtVta").attr("placeholder", "ej: Viena");
			$("#inputPVta").attr("placeholder", "ej: $1500");
		}
	});
	//captura de inputs para rellenar el resto automaticamente
	$("#inputNomArtVta").keyup(function (e) {
		const nombreV = $("#inputNomArtVta").val().toUpperCase();

		if (existencias.some(item => item.nombre == nombreV)) {
			existencias.forEach(item => {
				if (item.nombre == nombreV) {
					$("#inputCodArtVta").val(item.articulo);
					$("#inputPVta").val(item.precioVenta);
				}
			})
		} else {
			$("#inputCodArtVta").attr("placeholder", "ej: 01-1000");
			$("#inputPVta").attr("placeholder", "ej: $1500");
		}
	});

	//Función para borrar carga de articulos a vender
	$(function () {
		$("#tableVenta").on("click", ".borrarVta", function (e) {
			e.preventDefault();

			let datoArticuloVta = $(this).closest("tr").children()[1].textContent;
			let datoCantidadVta = Number($(this).closest("tr").children()[0].textContent);


			if (arrayTemporalVta.some(item => item.articulo == datoArticuloVta)) {
				arrayTemporalVta = arrayTemporalVta.filter(item => item.articulo != datoArticuloVta);
			}

			$(this).closest('tr').remove();

			if (existencias.some(item => item.articulo == datoArticuloVta)) {
				existencias.forEach(item => {
					if (item.articulo == datoArticuloVta) {
						item.unidades = item.unidades + datoCantidadVta;
					};
				})
			}
			guardarLocal("arrayExistencias", JSON.stringify(existencias));
		});
	});

	//Función que genera array para localStorage (guarda la factura de vta) y que resetea el array temporal de ventas
	$("#botGuardarFactVta").on("click", function (e) {
		e.preventDefault();

		let totalFacturaVta = 0;//variable para calcular total de la factura de Vta y alojar como elemento del objeto

		if ($("#inputNumCliente").val() != "" && $("#inputNomCliente").val() != "" && $("#inputNumTicket").val() != "" && arrayTemporalVta != "" && $("#inputFechaVta").val() != "" && $('input[name="formaDePago"]:checked').val()) {
			const id = $("#inputNumCliente").val(),
				cliente = $("#inputNomCliente").val(),
				ticket = $("#inputNumTicket").val(),
				fecha = $("#inputFechaVta").val(),
				detalleVta = arrayTemporalVta;

			arrayTemporalVta.forEach(item => {
				totalFacturaVta += item["total"];
			})

			if ($('input[name="formaDePago"]:checked').val() === "EF") {
				totalFacturaVta = totalFacturaVta * 0.9
			}

			const total = totalFacturaVta,
				formaDePago = $('input[name="formaDePago"]:checked').val();

			const factVta = new FacturaVenta(id, cliente, ticket, fecha, detalleVta, total, formaDePago);
			facturasVta.push(factVta);

			$("#formDatosVta")[0].reset();
			$("#formVtaDetalle")[0].reset();

			localStorage.setItem("facturasDeVenta", JSON.stringify(facturasVta));

			$("#infoFactVta").append(`<div id="div1">
									<h5>Cliente: ${factVta.cliente} / Ticket: ${factVta.ticket} / Total: $${factVta.total}</h5>
									<p id="detVta"><strong>Detalle:</strong></p>
									<p>Forma de Pago: ${factVta.formaDePago}</p>
									<button id="btnOk" type="submit" class="btn btn-secondary">Confirmar</button>	
									</div>								
									`);
			if ($('input[name="formaDePago"]:checked').val() === "EF") {
				for (let i = 0; i < arrayTemporalVta.length; i++) {
					$("#detVta").append(`
										<p class="mt-2">${arrayTemporalVta[i].cantidad} articulo/s ${arrayTemporalVta[i].nombre} por $${arrayTemporalVta[i].total} menos 10%</p>
										`);
				}
			} else {
				for (let i = 0; i < arrayTemporalVta.length; i++) {
					$("#detVta").append(`
										<p class="mt-2">${arrayTemporalVta[i].cantidad} articulo/s ${arrayTemporalVta[i].nombre} por $${arrayTemporalVta[i].total}</p>
										`);
				}
			}

			$("#formFactVta").fadeOut(800, function () {
				$("#resultadoVta").fadeIn(800);
			});

			$("#tablaVenta tr:gt(0)").remove();
			$('input[name="formaDePago"]').prop('checked', false)

			function vaciar() {
				arrayTemporalVta = [];
			}
			vaciar();

		} else {
			$("#alertaVta").fadeIn(800, function () {
				$("#alertaVta").fadeOut(1500);
			})
		}

		$("#btnOk").click(() => {
			$("#div1").empty();

			$("#resultadoVta").fadeOut(800, function () {
				$("#formFactVta").fadeIn(800);
			});
		});

	});







	//------------------------------------------------------------------------------------
	//Codigo para HTML Clientes!!!
	//------------------------------------------------------------------------------------

	//Captura de inptus para generar objeto cliente que se pushea a array temporal
	$("#formAltaCliente").on("submit", function (e) {
		e.preventDefault();

		if ($("#inputIdCliente").val() != "" && $("#inputNombreCliente").val() != "" && $("#inputApellidoCliente").val() != "" && $("#inputTelefono").val() != "") {

			const id = $("#inputIdCliente").val(),
				nombre = $("#inputNombreCliente").val(),
				apellido = $("#inputApellidoCliente").val(),
				telefono = $("#inputTelefono").val(),
				saldo = 0;

			const cliente = new Cliente(id, nombre, apellido, telefono, saldo);

			arrayTemporalClientes.push(cliente);


			pintarDatos();

			$("#formAltaCliente")[0].reset();

		} else {
			alert("debe completar todos los campos!!")//Acá falta generar evento en el DOM
		}
	});

	//Pintando tabla de clientes para luego enviar!!
	function pintarDatos() {
		$("#tableCliente").empty();
		arrayTemporalClientes.forEach(function (detalle, indice) {
			$("#tableCliente").append(`<tr id="trIdC${indice}">
									<td>${detalle.id}</td>										
									<td>${detalle.nombre}</td>
									<td>${detalle.apellido}</td>
									<td>${detalle.telefono}</td>
									<td><input type="button" class="borrarCliente btn btn-danger" value="Eliminar" /></td>
									</tr>`)
		});
	}

	//Funcion para eliminar clientes antes de guardarlos
	$(function () {
		$("#tableCliente").on("click", ".borrarCliente", function (e) {
			e.preventDefault();

			let datoId = Number($(this).closest("tr").children()[0].textContent);
			console.log(arrayTemporalClientes);
			if (arrayTemporalClientes.some(item => item.id == datoId)) {
				arrayTemporalClientes = arrayTemporalClientes.filter(item => item.id != datoId);
			}

			$(this).closest('tr').remove();
			console.log(arrayTemporalClientes);
		});
	});





});


let existencias = JSON.parse(localStorage.getItem("arrayExistencias")) || [];
const facturasCompra = JSON.parse(localStorage.getItem("facturasDeCompra")) || [];
const facturasVta = JSON.parse(localStorage.getItem("facturasDeVenta")) || [];
let existenciasTabla = [];
let arrayTemporalVta = [];
let arrayTemporalClientes = [];
let arrayTempInfoProv = [];
const guardarLocal = (clave, valor) => { localStorage.setItem(clave, valor) };

//Desplegar inputs para registrar vta
let contador = 0;
const crearFormVta = () => {
	$("#btn_abrir_formVta").click(() => {
		$("#formFactVta").slideToggle(900);

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


////Desplegar inputs para consultar info
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
}
*/



//------------------------------------------------------------------------------------
//Hecho para desafío Ajax, lo guardo porque no se va a usar de esa manera!!!
//------------------------------------------------------------------------------------

//Desafío Ajax!!!
//Se simula ingreso de clientes a base de datos
/*
const URL = "https://jsonplaceholder.typicode.com/posts";
const infoAlta = arrayTemporalClientes;
$("#btnGuardarJsonCliente").click(() => {
	$.ajax({
		method: "POST",
		url: URL,
		data: infoAlta,
		success: function () {
			$("#alta").append(`<p>La clienta ${infoAlta[0].nombre} ${infoAlta[0].apellido} se ingresó a la base de datos exitosamente</p>`)
		}
	})
});
*/