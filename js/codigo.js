import { Prenda } from "./Constructor.js"
import { PrendaVendida } from "./Constructor.js"
import { InfoArticulo } from "./Constructor.js"
import { FacturaCompra } from "./Constructor.js"
import { FacturaVenta } from "./Constructor.js"
import { Cliente } from "./Constructor.js"
import { RegistradorDebHabCP } from "./Constructor.js"
import { Caja1 } from "./Constructor.js"


//Funciones para ordenar arrays según diversos criterios
function ordenarPorFecha(arrayOrdenar) {
	arrayOrdenar.sort((a, b) => {
		if (a.fecha < b.fecha) {
			return -1;
		}
	})
};

function ordenarPorId(arrayOrdenar) {
	arrayOrdenar.sort((a, b) => {
		if (a.id < b.id) {
			return -1;
		};
	});
};

function ordenarAlf(arrayOrdenar) {
	arrayOrdenar.sort((a, b) => {
		if (a.apellido < b.apellido) {
			return -1;
		};
	});
};

function ordenarPorSaldo(arrayOrdenar) {
	arrayOrdenar.sort((a, b) => {
		if (a.saldo > b.saldo) {
			return -1;
		};
	});
};

//funcion para subir al localStorage
const guardarLocal = (clave, valor) => { localStorage.setItem(clave, valor) };

//arrays vinculados al local Storage y arrays temporales
let existencias = JSON.parse(localStorage.getItem("arrayExistencias")) || [];
const facturasCompra = JSON.parse(localStorage.getItem("facturasDeCompra")) || [];
const facturasVta = JSON.parse(localStorage.getItem("facturasDeVenta")) || [];
let registrador = JSON.parse(localStorage.getItem("registrosDebHabCP")) || [];
let arrayClientes = JSON.parse(localStorage.getItem("clientes")) || [];
let arrayCaja1 = JSON.parse(localStorage.getItem("caja1")) || [];
let arrayCaja2 = JSON.parse(localStorage.getItem("caja2")) || [];
let contadorTicket = JSON.parse(localStorage.getItem("contadorTicket")) || 0; //variable para numerar tickets

let existenciasTabla = [];
let arrayTemporalVta = [];
let arrayTempInfoProv = [];
let arrayTempRegP = [];
let arrayTempRegC = [];
let arrayTempInfoC = [];
let arrayTemporalBusqueda = [];
let arrayTempDiario = [];


//toooooodo lo demás!!! Perdón Tony!!!!!!
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
									<td><input type="button" class="borrar btn btn-danger" id="${indice}" value="Eliminar" /></td>
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
			let id = this.id;


			if (existenciasTabla.some(item => item.articulo == datoArticulo)) {
				delete existenciasTabla[id];
				//existenciasTabla = existenciasTabla.filter(item => item.articulo != datoArticulo);
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


			const debe = totalFactura,
				haber = $("#inputPago").val(),
				clase = "p";

			const inputReg = new RegistradorDebHabCP(fecha, id, debe, haber, clase)
			registrador.push(inputReg);

			const descripcion = "Pago a proveedores";

			const movimiento = new Caja1(fecha, descripcion, 0, pago, -pago);
			arrayCaja2.push(movimiento);
			guardarLocal("caja2", JSON.stringify(arrayCaja2));

			$("#formDatosCompra")[0].reset();
			$("#formCompraDetalle")[0].reset();
			$("#formPago")[0].reset();

			localStorage.setItem("facturasDeCompra", JSON.stringify(facturasCompra));
			guardarLocal("registrosDebHabCP", JSON.stringify(registrador));

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
			$("#seccionConsultaCtaP").fadeOut(800);


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
		$("#seccionConsultaCtaP").fadeOut(400);
	});

	//Captura de id que muestra según cada proveedor, el saldo adeudado, los creditos y débitos. Solo consulta!!
	$("#btnConsCtaP").on("click", function (e) {
		e.preventDefault();

		const id = $("#idConsultaCtaP").val();
		const movRegP = JSON.parse(localStorage.getItem("registrosDebHabCP"));

		arrayTempRegP = movRegP.filter(item => item.id == id && item.clase == "P");

		ordenarPorFecha(arrayTempRegP);

		$("#tableInfoCtaP").empty();

		let debe = 0;
		let haber = 0;
		let totalDeuda = 0;


		arrayTempRegP.forEach(function (detalle) {
			debe += detalle["debe"];
			haber += detalle["haber"];
			totalDeuda = debe - haber;

			$("#tableInfoCtaP").append(`<tr>
											<td>${detalle.fecha}</td>																							
											<td>${detalle.debe}</td>					
											<td>${detalle.haber}</td>
										</tr>`);
			$("#saldoCtaP").val(totalDeuda);
		});

		$("#factCompra").fadeOut(400);
		$("#seccionConsultaProv").fadeOut(400);

	})

	//Funciónes para completar datos proveedor en base al id
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

	$("#idConsultaCtaP").change(function (e) {
		const idP = $("#idConsultaCtaP").val();
		if (facturasCompra.some(item => item.id == idP)) {
			facturasCompra.forEach(item => {
				if (item.id == idP) {
					$("#ctaProv").val(item.proveedor);
				}
			});
		};
	});

	//Función que captura id de proveedor y monto abonado. Ordena por fecha las facturas de ese proveedor y descuenta de los saldos 
	//pendientes (desde la más vieja en adelante) el monto abonado.
	$("#btnPagarProv").on("click", function (e) {
		e.preventDefault();

		if ($("#idPagoSaldo").val() != "" && $("#fechaPagoSaldo").val() != "") {
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



			localStorage.setItem("facturasDeCompra", JSON.stringify(facturasCompra));

			//Generar array con datos del pago y alojar en localstorage
			const fecha = $("#fechaPagoSaldo").val(),
				debe = 0,
				haber = Number($("#idPagoSaldo").val()),
				clase = "p";

			const inputReg = new RegistradorDebHabCP(fecha, id, debe, haber, clase);
			registrador.push(inputReg);
			guardarLocal("registrosDebHabCP", JSON.stringify(registrador));


			const movimiento = new Caja1(fecha, "Pago a proveedores", 0, haber, -haber);
			arrayCaja2.push(movimiento);
			guardarLocal("caja2", JSON.stringify(arrayCaja2));

			$("#formPagoSaldoP")[0].reset();


			//Actualizacion en tabla en base a los pagos registrados
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
		} else {
			alert("Debe completar todos los datos antes de confirmar el pago")
		}
	});

	//botones limpiar después de consulta
	$("#btnLimpiarConsultaProv").on("click", function (e) {
		e.preventDefault();

		$("#formPagoSaldoP")[0].reset();
		$("#formConsulta")[0].reset();
		$("#tablaInfoProv tr:gt(0)").remove();
		$("#factCompra").fadeIn(400);
		$("#seccionConsultaCtaP").fadeIn(1500);

	});

	$("#btnLimpConsultaCtaP").on("click", function (e) {
		e.preventDefault();

		$("#formConsultaCtaP")[0].reset();
		$("#formSaldoP")[0].reset();
		$("#tablaInfoCtaP tr:gt(0)").remove();
		$("#factCompra").fadeIn(800);
		$("#seccionConsultaProv").fadeIn(500);
	});

	//Botón para confimar y traer nuevamente a la vista los campos para seguir ingresando una nueva factura
	$("#btnConfirmarPago").on("click", function (e) {
		e.preventDefault();

		$("#div2").remove();

		$("#resultado").fadeOut(700);

		$("#factCompra").fadeIn(1000);

		$("#inputPagoProv")[0].reset();

		$("#seccionConsultaProv").fadeIn(1000);

		$("#seccionConsultaCtaP").fadeIn(800);


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
			calTotal();

			$("#formVtaDetalle")[0].reset();
		} else {
			$("#alertaVta").fadeIn(500, function () {
				$("#alertaVta").fadeOut(500);
			})
		}
	});

	//funcion para ir calculando total de fact de vta
	function calTotal() {
		let sumaTotal = 0;
		let sumaEfect = 0;

		arrayTemporalVta.forEach(item => {
			sumaTotal += item["cantidad"] * item["pUnit"];
			sumaEfect = sumaTotal * 0.9;
		})

		$("#inputMostarTotalVta").val(`${sumaTotal}`);
		$("#inputMostarTotalVtaE").val(`${sumaEfect}`);

	}

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
									<td><input type="button" class="borrarVta btn btn-danger" id="${indice}" value="Eliminar" /></td>
									</tr>`)
		});
	}

	//captura de inputs para rellenar el resto automaticamente (ingresando el código)
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
			alert(`El artículo ingresado no existe, consulte en "Información Artículo"`);
			$("#inputNomArtVta").attr("placeholder", "ej: Viena");
			$("#inputPVta").attr("placeholder", "ej: $1500");
			$("#inputNomArtVta").val("");
			$("#inputPVta").val("");
		}
	});

	//captura de inputs para rellenar el resto automaticamente (ingresando el nombre)
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
			alert(`El artículo ingresado no existe, consulte en "Información Artículo"`);
			$("#inputCodArtVta").attr("placeholder", "ej: 01-1000");
			$("#inputPVta").attr("placeholder", "ej: $1500");
			$("#inputCodArtVta").val("");
			$("#inputPVta").val("");
		}
	});

	//captura de input id para rellenar datos clientes
	$("#inputNumCliente").keyup(function (e) {
		e.preventDefault()
		const idC = $("#inputNumCliente").val();

		if (arrayClientes.some(item => item.id == idC)) {
			arrayClientes.forEach(item => {
				if (item.id == idC) {
					$("#inputNomCliente").val(`${item.nombre} ${item.apellido}`)
				}
			})
		} else {
			alert("El id de cliente no existe, ingrese información válida o genere alta de un nuevo cliente")
		}
	});

	//Función para borrar carga de articulos a vender. Modifica local de existencias y monto total (input) de factura
	$(function () {
		$("#tableVenta").on("click", ".borrarVta", function (e) {
			e.preventDefault();

			let datoArticuloVta = $(this).closest("tr").children()[1].textContent;
			let datoCantidadVta = Number($(this).closest("tr").children()[0].textContent);
			let totalResta = Number($(this).closest("tr").children()[4].textContent);
			let totalPrev = Number($("#inputMostarTotalVta").val());
			let total = totalPrev - totalResta;
			let totalE = total * 0.9;
			let id = this.id;


			$("#inputMostarTotalVta").val(`${total}`);
			$("#inputMostarTotalVtaE").val(`${totalE}`);

			if (arrayTemporalVta.some(item => item.articulo == datoArticuloVta)) {
				delete arrayTemporalVta[id];
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
		contadorTicket++;

		if ($("#inputNumCliente").val() != "" && $("#inputNomCliente").val() != "" && arrayTemporalVta != "" && $("#inputFechaVta").val() != "" && $('input[name="formaDePago"]:checked').val() && $("#pagoVta").val() != "") {

			$("#inputNumTicket").val(contadorTicket);

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
				formaDePago = $('input[name="formaDePago"]:checked').val(),
				pago = $("#pagoVta").val();

			const factVta = new FacturaVenta(id, cliente, ticket, fecha, detalleVta, total, formaDePago, pago);
			facturasVta.push(factVta);

			const debe = pago,
				haber = total,
				clase = "c";

			const inputReg = new RegistradorDebHabCP(fecha, id, debe, haber, clase);
			registrador.push(inputReg);
			guardarLocal("registrosDebHabCP", JSON.stringify(registrador));



			let diferencia = total - pago;

			if (arrayClientes.some(item => item.id == id)) {
				arrayClientes.forEach(item => {
					if (item.id == id) {
						item.saldo = item.saldo + diferencia
					}
				})
			}
			localStorage.setItem("clientes", JSON.stringify(arrayClientes));


			if (formaDePago != "TJ") {
				const descripcion = "venta",
					haberC = 0,
					saldoCaja = debe - haberC;
				const movimiento = new Caja1(fecha, descripcion, debe, haberC, saldoCaja);
				arrayCaja1.push(movimiento);
				guardarLocal("caja1", JSON.stringify(arrayCaja1));
			}





			$("#datosCierreVta")[0].reset();
			$("#formDatosVta")[0].reset();
			$("#formVtaDetalle")[0].reset();

			$("#infoFactVta").append(`<div id="div1">
									<h5>Cliente: ${factVta.cliente} / Ticket: ${factVta.ticket} / Total: $${factVta.total}</h5>
									<p id="detVta"><strong>Detalle:</strong></p>
									<p>Pago: $${factVta.pago} / Forma de Pago: ${factVta.formaDePago}</p>
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

			guardarLocal("contadorTicket", JSON.stringify(contadorTicket));
			localStorage.setItem("facturasDeVenta", JSON.stringify(facturasVta));

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

			$("#resultadoVta").fadeOut(800, function () {
				$("#formFactVta").fadeIn(800);
			});
			$("#div1")[0].remove();
		});

	});

	//captura consulta de articulo y función para responder 
	$("#formInfo").on("submit", function (e) {
		e.preventDefault();
		const articulo = $("#artInfo").val(),
			nombreArt = $("#nombreInfo").val();

		const consultaArt = new InfoArticulo(articulo, nombreArt);

		if (existencias.some(item => (item.articulo == consultaArt.articulo) || (item.nombre == consultaArt.nombreArt))) {
			existencias.forEach(item => {
				if ((item.articulo == consultaArt.articulo) || (item.nombre == consultaArt.nombreArt)) {
					$("#divInfo").append(`<div id="pInfo" class="text-center alert alert-success" role="alert">
											<p>${item.tipoPrenda} ${item.nombre} / CÓDIGO: ${item.articulo} / ALMACEN: ${item.almacen} / STOCK: ${item.unidades} UNIDADES / PRECIO LISTA: $${item.precioVenta}</p>
											<button type="button" class="btn btn-primary btn-block" id="btnA">Cerrar</button>
											</div>`);
					$(".formInfoArt").hide();
				}
				$("#btnA").click(() => {
					$("#pInfo").fadeOut(800);
					$("#pInfo").remove();
					$(".formInfoArt").show();
				});
			})
		} else {
			$("#divInfo").append(`<div id="pAlert" class="text-center alert alert-danger" role="alert">
									<p>El artículo consultado no existe</p>
									<button type="button" class="btn btn-primary btn-block" id="btnB">Cerrar</button>
									</div>`);
			$(".formInfoArt").hide();
			$("#btnB").click(() => {
				$("#pAlert").fadeOut(800);
				$("#pAlert")[0].remove();
				$(".formInfoArt").show();
			});
		}

		$("#formInfo")[0].reset();
	});

	//Captura id de cliente y arroja saldo pendiente en base a todas las facturas de vta
	$("#btnConsultaCliente").on("click", function (e) {
		e.preventDefault();

		const id = $("#idCliente").val();
		const factVtaClientes = JSON.parse(localStorage.getItem("facturasDeVenta"));

		arrayTempInfoC = factVtaClientes.filter(factura => factura.id == id);
		if (arrayTempInfoC != "") {
			ordenarPorFecha(arrayTempInfoC);
			$("#tableInfoClientes").empty();

			let credito = 0;
			let debito = 0;
			let totalSaldo = 0;

			arrayTempInfoC.forEach(function (detalle) {
				let pendiente = detalle.total - detalle.pago;
				debito += detalle["total"];
				credito += detalle["pago"];
				totalSaldo = debito - credito;
				$("#tableInfoClientes").append(`<tr>
											<td>${detalle.fecha}</td>
											<td>${detalle.ticket}</td>
											<td>${detalle.total}</td>
											<td>${detalle.pago}</td>
											<td>${pendiente}</td>		
											</tr>`);
				$("#saldoCtaC").val(totalSaldo);
			});
		} else {
			alert("El cliente consultado aún no generó ningún ticket de compra")
		}


	});

	//completar datos en input nombre cliente
	$("#idCliente").change(function (e) {
		const idC = $("#idCliente").val();
		if (arrayClientes.some(item => item.id == idC)) {
			arrayClientes.forEach(item => {
				if (item.id == idC) {
					$("#nombreCliente").val(`${item.nombre} ${item.apellido}`);
				}
			});
		} else {
			$("#nombreCliente").val(``)
			alert("El número de cliente no existe")
		}
	});

	$("#idConsultaCtaC").change(function (e) {
		const idC = $("#idConsultaCtaC").val();
		if (arrayClientes.some(item => item.id == idC)) {
			arrayClientes.forEach(item => {
				if (item.id == idC) {
					$("#nomCliente").val(`${item.nombre} ${item.apellido}`);
				}
			});
		} else {
			$("#nomCliente").val(``)
			alert("El número de cliente no existe")
		}
	});

	//Captura pago de cliente (por id) que descuenta de la deuda desde la factura más vieja en adelante según monto abonado
	$("#btnPagoCliente").on("click", function (e) {
		e.preventDefault();

		if ($("#pagoCtaC").val() != "" && $("#fechaPagoC").val() != "") {
			const idC = $("#idCliente").val();
			let montoC = Number($("#pagoCtaC").val());

			if (arrayClientes.some(item => item.id == idC)) {
				arrayClientes.forEach(item => {
					if (item.id == idC) {
						item.saldo = item.saldo - montoC
					}
				})
			}
			localStorage.setItem("clientes", JSON.stringify(arrayClientes));

			ordenarPorFecha(facturasVta);


			while (montoC > 0) {
				let factPendiente = facturasVta.find(item => item.id == idC && (item.total - item.pago) > 0);
				let saldoC = factPendiente.total - factPendiente.pago;
				if (montoC <= saldoC) {
					factPendiente.pago = factPendiente.pago + montoC;
					montoC = montoC - montoC;
				} else if (montoC > saldoC) {
					factPendiente.pago = factPendiente.pago + saldoC;
					montoC = montoC - saldoC;
				}
			}

			localStorage.setItem("facturasDeVenta", JSON.stringify(facturasVta));

			const fecha = $("#fechaPagoC").val(),
				debe = Number($("#pagoCtaC").val()),
				haber = 0,
				clase = "c";

			const inputReg = new RegistradorDebHabCP(fecha, idC, debe, haber, clase);
			registrador.push(inputReg);
			guardarLocal("registrosDebHabCP", JSON.stringify(registrador));

			const descripcion = "pago cuenta cliente",
				saldoCaja = debe - haber;
			const movimiento = new Caja1(fecha, descripcion, debe, haber, saldoCaja);
			arrayCaja1.push(movimiento);
			guardarLocal("caja1", JSON.stringify(arrayCaja1));

			$("#formPagoCliente")[0].reset();

			const factVtaClientes = JSON.parse(localStorage.getItem("facturasDeVenta"));
			arrayTempInfoC = factVtaClientes.filter(factura => factura.id == idC);
			ordenarPorFecha(arrayTempInfoC);
			$("#tableInfoClientes").empty();

			let creditoC = 0;
			let debitoC = 0;
			let totalSaldoC = 0;

			arrayTempInfoC.forEach(function (detalle, i) {
				let pendiente = detalle.total - detalle.pago;
				debitoC += detalle["total"];
				creditoC += detalle["pago"];
				totalSaldoC = debitoC - creditoC;
				$("#tableInfoClientes").append(`<tr>
											<td>${detalle.fecha}</td>
											<td>${detalle.ticket}</td>
											<td>${detalle.total}</td>
											<td>${detalle.pago}</td>
											<td>${pendiente}</td>		
											</tr>`);
				$("#saldoCtaC").val(totalSaldoC);
			});
		} else {
			alert("Debe completar todos los datos antes de confirmar el pago");
		}

	});

	//Consulta tickets de clientes y pagos registrados. Solo consulta!!!
	$("#btnConsultaCtaC").on("click", function (e) {
		e.preventDefault();

		const id = $("#idConsultaCtaC").val();
		const movRegC = JSON.parse(localStorage.getItem("registrosDebHabCP"));

		arrayTempRegC = movRegC.filter(item => item.id == id && item.clase == "C");

		ordenarPorFecha(arrayTempRegC);

		$("#tableInfoCtaC").empty();

		let debe = 0;
		let haber = 0;
		let totalDeuda = 0;


		arrayTempRegC.forEach(function (detalle) {
			debe += detalle["debe"];
			haber += detalle["haber"];
			totalDeuda = haber - debe;

			$("#tableInfoCtaC").append(`<tr>
											<td>${detalle.fecha}</td>																							
											<td>${detalle.haber}</td>					
											<td>${detalle.debe}</td>
										</tr>`);
			$("#saldoCtaCliente").val(totalDeuda);
		});

	})

	//Limpiar form de consulta y pago de cliente
	$("#btnLimpiarConsultaCliente").on("click", function (e) {
		e.preventDefault();

		$("#formPagoCliente")[0].reset();
		$("#formConsultaCliente")[0].reset();
		$("#tablaInfoClientes tr:gt(0)").remove();
	});

	$("#btnLimpConsultaCtaC").on("click", function (e) {
		e.preventDefault();

		$("#formConsultaCtaC")[0].reset();
		$("#formSaldoC")[0].reset();
		$("#tablaInfoCtaC tr:gt(0)").remove();
	});

	//------------------------------------------------------------------------------------
	//Codigo para HTML Clientes!!!
	//------------------------------------------------------------------------------------

	//Captura de inptus para generar objeto cliente que se pushea a arrayClientes y se guarda en el localStorage. Hace una 
	//corroboración chequeando si el id de cliente ya existe antes de permitir la nueva alta
	$("#formAltaCliente").on("submit", function (e) {
		e.preventDefault();

		const id = $("#inputIdCliente").val()

		if (arrayClientes.some(item => item.id == id)) {
			alert("El id de cliente ya existe, consulte el listado de clientes para generar una nueva alta");
		} else {
			if ($("#inputIdCliente").val() != "" && $("#inputNombreCliente").val() != "" && $("#inputApellidoCliente").val() != "" && $("#inputTelefono").val() != "") {

				const id = $("#inputIdCliente").val(),
					nombre = $("#inputNombreCliente").val(),
					apellido = $("#inputApellidoCliente").val(),
					telefono = $("#inputTelefono").val(),
					saldo = 0;

				const cliente = new Cliente(id, nombre, apellido, telefono, saldo);

				arrayClientes.push(cliente);

				guardarLocal("clientes", JSON.stringify(arrayClientes));

				$("#formAltaCliente")[0].reset();
			} else {
				alert("Debe completar todos los campos para dar de alta el cliente")
			}
		}
	});

	$("#btnConsListadoC").on("click", function (e) {
		e.preventDefault();

		$("#thT").html("Teléfono");
		$("#thS").html("Saldo");

		ordenarPorId(arrayClientes);

		$("#tableListadoC").empty();

		arrayClientes.forEach(function (cliente) {
			$("#tableListadoC").append(`<tr>
										<td>${cliente.id}</td>			
										<td>${cliente.apellido} ${cliente.nombre}</td>										
										<td>${cliente.telefono}</td>
										<td>${cliente.saldo}</td>			
										</tr>`)
		});
	});
	$("#btnOrdAlf").on("click", function (e) {
		e.preventDefault();

		$("#thT").html("Teléfono");
		$("#thS").html("Saldo");

		ordenarAlf(arrayClientes);

		$("#tableListadoC").empty();

		arrayClientes.forEach(function (cliente) {
			$("#tableListadoC").append(`<tr>
										<td>${cliente.id}</td>			
										<td>${cliente.apellido} ${cliente.nombre}</td>										
										<td>${cliente.telefono}</td>
										<td>${cliente.saldo}</td>			
										</tr>`)
		});
	});
	$("#btnConsListadoS").on("click", function (e) {
		e.preventDefault();

		$("#thT").html("Teléfono");
		$("#thS").html("Saldo");

		ordenarPorSaldo(arrayClientes);

		$("#tableListadoC").empty();

		arrayClientes.forEach(function (cliente) {
			$("#tableListadoC").append(`<tr>
										<td>${cliente.id}</td>			
										<td>${cliente.apellido} ${cliente.nombre}</td>										
										<td>${cliente.telefono}</td>
										<td>${cliente.saldo}</td>			
										</tr>`)
		});
	});

	//Funcion que muestra, de cada cliente, el ticket de venta impago más atrasado 
	$("#btnOrdD").on("click", function (e) {
		e.preventDefault();

		$("#thT").html("Fecha Ticket Impago");
		$("#thS").html("Saldo pendiente Ticket");

		ordenarPorId(arrayClientes);
		ordenarPorFecha(facturasVta);
		$("#tableListadoC").empty();

		let arrayP = [];

		let consulta = facturasVta.filter(item => (item.total - item.pago) > 0);

		console.log(consulta)

		for (let i = 1; i < arrayClientes.length; i++) {
			let factImpaga = consulta.find(item => (item.total - item.pago) > 0 && item.id == i);
			arrayP.push(factImpaga)

		}
		ordenarPorFecha(arrayP)

		let arrayP1 = arrayP.filter(item => item != undefined)

		arrayP1.forEach(function (cliente) {
			let saldo = cliente.total - cliente.pago;

			$("#tableListadoC").append(`<tr>
										<td>${cliente.id}</td>			
										<td>${cliente.cliente}</td>										
										<td>${cliente.fecha}</td>
										<td>${saldo}</td>			
										</tr>`)
		});

	});

	$("#limpiarConsultaCtas").on("click", function (e) {
		e.preventDefault();

		$("#thT").html("Teléfono");
		$("#thS").html("Saldo");


		$("#tablaListadoC tr:gt(0)").remove();
	});

	//Busqueda de clientes a partir de id, de nombre o de apellido
	$("#formBusquedaCliente").on("submit", function (e) {
		e.preventDefault();
		const id = Number($("#idBusquedaC").val()),
			nombre = $("#nombreC").val().toUpperCase(),
			apellido = $("#apellidoC").val().toUpperCase();


		$("#tableBusqueda").empty();

		if (arrayClientes.some(item => item.id === id)) {
			arrayTemporalBusqueda = arrayClientes.filter(item => item.id == id);
			ordenarAlf(arrayTemporalBusqueda);
			arrayTemporalBusqueda.forEach(function (cliente) {
				$("#tableBusqueda").append(`<tr>
											<td>${cliente.id}</td>				
											<td>${cliente.nombre} ${cliente.apellido}</td>
											<td>${cliente.telefono}</td>
											<td>${cliente.saldo}</td>				
											</tr>`)
			});
		} else if (arrayClientes.some(item => item.nombre === nombre)) {
			arrayTemporalBusqueda = arrayClientes.filter(item => item.nombre == nombre);
			ordenarAlf(arrayTemporalBusqueda);
			arrayTemporalBusqueda.forEach(function (cliente) {
				$("#tableBusqueda").append(`<tr>
											<td>${cliente.id}</td>				
											<td>${cliente.nombre} ${cliente.apellido}</td>
											<td>${cliente.telefono}</td>
											<td>${cliente.saldo}</td>				
											</tr>`)
			});
		} else if (arrayClientes.some(item => item.apellido === apellido)) {
			arrayTemporalBusqueda = arrayClientes.filter(item => item.apellido == apellido);
			ordenarAlf(arrayTemporalBusqueda);
			arrayTemporalBusqueda.forEach(function (cliente) {
				$("#tableBusqueda").append(`<tr>
											<td>${cliente.id}</td>				
											<td>${cliente.nombre} ${cliente.apellido}</td>
											<td>${cliente.telefono}</td>
											<td>${cliente.saldo}</td>				
											</tr>`)
			});
		} else {
			alert("Los datos ingresados no se condicen con ningún cliente")
		}



	});
	//Limpiando tabla e inputs de busqueda anterior
	$("#borrarC").on("click", function (e) {
		e.preventDefault();
		$("#apellidoC").val("");
		$("#nombreC").val("");
		$("#idBusquedaC").val("");
		$("#tableBusqueda").empty();
	});

	//------------------------------------------------------------------------------------
	//Codigo para HTML Caja!!!
	//------------------------------------------------------------------------------------

	$("#formCaja1").on("submit", function (e) {
		e.preventDefault();

		const fecha = $("#fechaCaja1").val(),
			descripcion = $("#descMov").val();
		let monto = $("#montoMov").val(),
			debe = 0,
			haber = 0;
		let tipo = $("#selectCaja option:selected").val();

		if (tipo != "3") {
			if (tipo == "1") {
				debe = monto;
			} else if (tipo == "2") {
				haber = monto;
			};

			const saldo = debe - haber;

			const movimiento = new Caja1(fecha, descripcion, debe, haber, saldo);
			arrayCaja1.push(movimiento);
			guardarLocal("caja1", JSON.stringify(arrayCaja1));
		} else if (tipo == "3") {
			debe = 0;
			haber = monto;
			const saldo = debe - haber;

			const movimiento = new Caja1(fecha, descripcion, debe, haber, saldo);
			arrayCaja1.push(movimiento);
			guardarLocal("caja1", JSON.stringify(arrayCaja1));

			const debeR = monto,
				haberR = 0,
				saldoR = debeR - haberR;

			const retiro = new Caja1(fecha, descripcion, debeR, haberR, saldoR);
			arrayCaja2.push(retiro);
			guardarLocal("caja2", JSON.stringify(arrayCaja2));
		};

		$("#formCaja1")[0].reset();
	});
	$("#consultaSaldoCaja1").on("click", function (e) {
		e.preventDefault();

		let saldoActual = 0;
		arrayCaja1.forEach(function (caja1) {
			saldoActual += caja1["saldo"];
			$("#resultadoSaldoCaja1").val(saldoActual);
		});
	});
	$("#limpiarConsultaSaldo").on("click", function (e) {
		$("#resultadoSaldoCaja1").val("");
	});


	$("#formCaja2").on("submit", function (e) {
		e.preventDefault();

		const fecha = $("#fechaCaja2").val(),
			descripcion = $("#descMovCaja2").val();
		let monto = $("#montoMovCaja2").val(),
			debe = 0,
			haber = 0;
		let tipo = $("#selectCaja2 option:selected").val();

		if (tipo == "1") {
			debe = monto;
		} else if (tipo == "2") {
			haber = monto;
		}

		const saldo = debe - haber;

		const movimiento = new Caja1(fecha, descripcion, debe, haber, saldo);
		arrayCaja2.push(movimiento);
		guardarLocal("caja2", JSON.stringify(arrayCaja2));

		$("#formCaja2")[0].reset();
	});
	$("#consultaSaldoCaja2").on("click", function (e) {
		e.preventDefault();

		let saldoActual = 0;
		arrayCaja2.forEach(function (caja2) {
			saldoActual += caja2["saldo"];
			$("#resultadoSaldoCaja2").val(saldoActual);

		});
	});
	$("#limpiarConsultaSaldoC2").on("click", function (e) {
		$("#resultadoSaldoCaja2").val("");
	});

	//------------------------------------------------------------------------------------
	//Codigo para HTML Caja!!!
	//------------------------------------------------------------------------------------

	$("#formCierreDiario").on("submit", function (e) {
		e.preventDefault();

		const inicio = Number($("#inputInicio").val()),
			fecha = $("#inputFechaCierre").val();

		if (inicio != "" && fecha != "") {
			arrayTempDiario = facturasVta.filter(item => item.fecha == fecha);

			let totalVta = 0;
			let vtaE = 0;
			let vtaT = 0;
			let vtaC = 0;
			let cierreCaja = 0;
			let totalGastos = 0;

			if (arrayTempDiario != 0) {
				arrayTempDiario.forEach(function (diario) {
					totalVta += diario["total"];
					$("#resulVtaTotal").val(totalVta);
				});
			} else {
				$("#resulVtaTotal").val(0);

			}

			let arrayEfectivo = arrayTempDiario.filter(item => item.formaDePago == "EF");
			if (arrayEfectivo != "") {
				arrayEfectivo.forEach(function (diario) {
					vtaE += diario["total"];
					$("#resVtaE").val(vtaE);
				});
			} else {
				$("#resVtaE").val(0);
			}

			let arrayTarjeta = arrayTempDiario.filter(item => item.formaDePago == "TJ");
			if (arrayTarjeta != "") {
				arrayTarjeta.forEach(function (diario) {
					vtaT += diario["total"];
					$("#resVtaT").val(vtaT);
				});
			} else {
				$("#resVtaT").val(0);
			}

			let arrayCta = arrayTempDiario.filter(item => item.formaDePago == "CP");
			if (arrayCta != "") {
				arrayCta.forEach(function (diario) {
					vtaC += diario["total"];
					$("#resVtaCp").val(vtaC);
				});
			} else {
				$("#resVtaCp").val(0);
			}

			let arrayCaja = arrayCaja1.filter(item => item.fecha == fecha)

			if (arrayCaja != "") {
				arrayCaja.forEach(function (mov) {
					cierreCaja += mov["saldo"];
					let total = inicio + cierreCaja
					$("#saldoCierreDia").val(total);
				})
			} else {
				$("#saldoCierreDia").val(0);
			}

			let arrayGastos = arrayCaja.filter(item => item.saldo < 0)
			if (arrayGastos != "") {
				arrayGastos.forEach(function (mov) {
					totalGastos += mov["saldo"];
					$("#gastosDiarios").val(totalGastos);
				});
			} else {
				$("#gastosDiarios").val(0);
			}
		} else {
			alert("Complete todos los campos")
		}
		$("#formCierreDiario")[0].reset();
	});


	$("#formCierrePeriodo").on("submit", function (e) {
		e.preventDefault();

		const fechaI = $("#inputDateInicio").val(),
			fechaC = $("#inputDateCierre").val();

		if (fechaI != "" && fechaC != "") {
			let arrayTempPeriodo = facturasVta.filter(item => item.fecha >= fechaI && item.fecha <= fechaC);
			//console.log(arrayTempPeriodo)

			let totalVta = 0;
			let vtaE = 0;
			let vtaT = 0;
			let vtaC = 0;
			let totalGastos = 0;

			if (arrayTempPeriodo != 0) {
				arrayTempPeriodo.forEach(function (per) {
					totalVta += per["total"];
					$("#resulVtaP").val(totalVta);
				});
			} else {
				$("#resulVtaP").val(0);

			}

			let arrayEfectivo = arrayTempPeriodo.filter(item => item.formaDePago == "EF");
			if (arrayEfectivo != "") {
				arrayEfectivo.forEach(function (per) {
					vtaE += per["total"];
					$("#resVtaEP").val(vtaE);
				});
			} else {
				$("#resVtaEP").val(0);
			}

			let arrayTarjeta = arrayTempPeriodo.filter(item => item.formaDePago == "TJ");
			if (arrayTarjeta != "") {
				arrayTarjeta.forEach(function (per) {
					vtaT += per["total"];
					$("#resVtaTP").val(vtaT);
				});
			} else {
				$("#resVtaTP").val(0);
			}

			let arrayCta = arrayTempPeriodo.filter(item => item.formaDePago == "CP");
			if (arrayCta != "") {
				arrayCta.forEach(function (per) {
					vtaC += per["total"];
					$("#resVtaCpP").val(vtaC);
				});
			} else {
				$("#resVtaCpP").val(0);
			}

			let arrayCaja = arrayCaja1.filter(item => item.fecha >= fechaI && item.fecha <= fechaC)
			let arrayGastos = arrayCaja.filter(item => item.saldo < 0)
			if (arrayGastos != "") {
				arrayGastos.forEach(function (movP) {
					totalGastos += movP["saldo"];
					$("#gastosP").val(totalGastos);
				});
			} else {
				$("#gastosP").val(0);
			}
		} else {
			alert("debe completar todos los datos")
		}
		$("#formCierrePeriodo")[0].reset();
	});
});




////Desplegar inputs para consultar info
let contador = 0;
const crearFormInfo = () => {
	$("#btn_abrir_form").click(() => {
		$(".formInfoArt").slideToggle(400);

		contador++
		if (contador % 2 != 0) {
			$("#btn_abrir_form").html("Cerrar Formulario");
		} else {
			$("#btn_abrir_form").html("Stock / Ubicación / Precio");
		}

	})
}
crearFormInfo();

let contadorI = 0;
const mostrarFormA = () => {
	$("#btnConsCtaC").click(() => {
		$("#seccionConsultaCliente").slideToggle(400);

		contadorI++
		if (contadorI % 2 != 0) {
			$("#btnConsCtaC").html("Cerrar Consulta");
		} else {
			$("#btnConsCtaC").html("Consulta Cuentas / Pagos");
		};
	});
};
mostrarFormA();

let contadorB = 0;
const mostrarFormB = () => {
	$("#btnConsCtaCl").click(() => {
		$("#seccionConsultaCtaCliente").slideToggle(400);

		contadorB++
		if (contadorB % 2 != 0) {
			$("#btnConsCtaCl").html("Cerrar Consulta");
		} else {
			$("#btnConsCtaCl").html("Consulta Mov. Ctas");
		};
	});
};
mostrarFormB();

let contadorC = 0;
const mostrartablaC = () => {
	$("#btnConsListadoCl").click(() => {
		$("#seccionConsC").slideToggle(500);

		contadorC++
		if (contadorC % 2 != 0) {
			$("#btnConsListadoCl").html("Cerrar Listado");
		} else {
			$("#btnConsListadoCl").html("Consulta Listado Clientes");
		};
	});
};
mostrartablaC();

let contadorD = 0;
const mostrarTablaConsulta = () => {
	$("#btnConsListadoClB").click(() => {
		$("#buscandoCliente").slideToggle(500);

		contadorD++
		if (contadorD % 2 != 0) {
			$("#btnConsListadoClB").html("Cerrar Búsqueda");
		} else {
			$("#btnConsListadoClB").html("Buscar Clientes");
		};
	});
};
mostrarTablaConsulta();

let contadorA = 0;
const mostrarCierre = () => {
	$("#btnCierreDiario").click(() => {
		$("#contenedorInfVta").slideToggle(500);

		contadorA++

		if (contadorA % 2 != 0) {
			$("#btnCierreDiario").html("Cerrar Consulta");
		} else {
			$("#btnCierreDiario").html("Cierre Diario");
		};
	});
}
mostrarCierre();

let contadorZ = 0;
const mostrarCierreP = () => {
	$("#btnCierreP").click(() => {
		$("#contenedorInfMes").slideToggle(500);

		contadorZ++

		if (contadorZ % 2 != 0) {
			$("#btnCierreP").html("Cerrar Consulta");
		} else {
			$("#btnCierreP").html("Cierre Mensual");
		};
	});
}
mostrarCierreP();









