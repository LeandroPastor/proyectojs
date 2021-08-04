let articuloNumero;
let nombreArticulo;
let tipoPrenda;
let almacen;
let cantidadComprada;
let precioCompra;
let precioVenta;
let cantidadVendida;
let totalVenta;

function ingresarMercaderia() {
	articuloNumero = prompt("Ingrese el número de artículo comprado");
	nombreArticulo = prompt("Ingrese el nombre de la prenda");
	tipoPrenda = prompt("Ingrese el tipo de prenda. Ejemplo: remera");
	almacen = Number(prompt("Ingrese el número de almacen"));
	cantidadComprada = Number(prompt("Cantidad que ingresa del artículo"));
	precioCompra = Number(prompt("Precio de compra"));
	precioVenta = Number(prompt("Ingrese el precio de venta de este artículo"));
}

class Producto {
	constructor(articuloNumero, nombreArticulo, tipoPrenda, almacen, cantidadComprada, precioCompra, precioVenta) {
		this.articuloNumero = articuloNumero.toString(); // le indico toString porque pienso en códigos con un guión medio y con Number arroja NaN
		this.nombreArticulo = nombreArticulo.toUpperCase();
		this.tipoPrenda = tipoPrenda.toUpperCase();
		this.almacen = almacen;
		this.cantidadComprada = cantidadComprada;
		this.precioCompra = precioCompra;
		this.precioVenta = precioVenta;
	}
}

ingresarMercaderia();
/*
//Métodos sacados del constructor para luego aplicarlos por separado según cada caso
	descuentoEfectivo() {
		this.precioVenta = this.precioVenta * 0.9;
	}
	descuentoLiquidacion() {
		this.precioVenta = this.precioVenta * 0.7;
	}
*/

//Creo el array vacío productos que va a contener los objetos instanciados a partir de la class Producto.
const productos = []

//producto1 se instancia a partir de las entradas por prompt. Entiendo que todavía no sabemos como hacerlo más de una vez así
//que instancia algunos productos más desde el código de las lineas 53,54 y 55 (la idea es simular una compra de mercadería 
//que pase a ser un stock para luego poder vender)  
let producto1 = new Producto(articuloNumero, nombreArticulo, tipoPrenda, almacen, cantidadComprada, precioCompra, precioVenta);
//Este producto1 tendría los siguientes parámetros que se ingresan por prompt("01-0100", "Viena", "Remera", 1, 10, 500, 1000)
let producto2 = new Producto("01-0101", "Portugal", "Remera", 1, 10, 800, 1600);
let producto3 = new Producto("02-0100", "Madrid", "Camisa", 2, 5, 850, 1750);
let producto4 = new Producto("02-0101", "París", "Camisa", 2, 15, 750, 1500);

//Incorporo al array productos el producto1 generado desde prompt y los restantes en las lineas 53,54 y 55
productos.push(producto1, producto2, producto3, producto4);

/*
//Se recorre el array y se ejecuta, en todos los objetos del mismo, el método descuentoEfectivo
for (let producto of productos) {
	producto.descuentoEfectivo();
}
*/

//Se muestra por consola el array productos 
console.log(productos);

/*
//Se filtran del array productos todos los artículos que son camisas y se muestra el nuevo array por consola
let productoCamisa = productos.filter(prenda => prenda.tipoPrenda === "CAMISA");
console.log(productoCamisa);

//Al array busquedaCamisas se le aplica el método map para bajar los precios de los artículos
let descuentosCamisas = productoCamisa.map(prenda => prenda.precioVenta * 0.90);
console.log(descuentosCamisas);
*/


//Se crea una función para, por medio del ingreso del código por prompt (01-0101 por ejemplo), informar el monto a cobrar, el nombre del articulo vendido y la cantidad del 
//mismo.
function vendiendo(articuloNumero, cantidadVendida) {
	articuloNumero = prompt("Ingrese el número de artículo vendido");
	cantidadVendida = Number(prompt("Ingrese la cantidad vendida"));
	let articuloVendido = productos.filter(articulo => articulo.articuloNumero === articuloNumero);
	let precioArtVendido = articuloVendido[0].precioVenta;
	totalVenta = cantidadVendida * precioArtVendido;
	return document.write(`El total a cobrar por la venta de ${cantidadVendida} unidad/es de la ${tipoPrenda} ${articuloVendido[0].nombreArticulo}, es de $	${totalVenta}`);
}

vendiendo();

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


//Desafío DOM. Se crean elementos html a partir del array de productos ingresados por prompt y por código. Antes se crea un h2 para insertar el 
//título del listado de artículos
let listadoArticulos = document.createElement("h2");
listadoArticulos.innerHTML = `<h2 class="text-center">Listado de artículos disponibles, ordenados de menor precio a mayor precio`;
document.body.appendChild(listadoArticulos);

for (const producto of productos) {
	let listaArtDisp = document.createElement("div");
	listaArtDisp.innerHTML = `<div class= "text-center p-3 border"> 
								<h3> Artículo: ${producto.articuloNumero} </h3>
					   		    <p> ${producto.tipoPrenda} ${producto.nombreArticulo} </p>		
					            <b> ${producto.cantidadComprada} unidades disponibles / Precio venta: $${producto.precioVenta}</b>
							  </div>`;
	document.body.appendChild(listaArtDisp);
}





