export class Prenda {
    constructor(unidades, articulo, nombre, tipoPrenda, almacen, precioCompra, precioVenta) {
        this.unidades = Number(unidades);
        this.articulo = articulo;
        this.nombre = nombre.toUpperCase();
        this.tipoPrenda = tipoPrenda.toUpperCase();
        this.almacen = almacen;
        this.precioCompra = Number(precioCompra);
        this.precioVenta = Number(precioVenta);
        this.total = Number(this.unidades * this.precioCompra);
    }
};

export class FacturaCompra {
    constructor(proveedor, numeroFact, fecha, detalle) {
        this.proveedor = proveedor.toUpperCase();
        this.numeroFact = Number(numeroFact);
        this.fecha = fecha;
        this.detalle = detalle;
    }
};

export class PrendaVendida {
    constructor(fechaVta, articulo, cantidad, formaPago, totalVta) {
        this.fechaVta = fechaVta;
        this.articulo = articulo;
        this.cantidad = cantidad;
        this.formaPago = formaPago;
        this.totalVta = totalVta;
    }
};

export class InfoArticulo {
    constructor(articulo, nombreArt) {
        this.articulo = articulo;
        this.nombreArt = nombreArt.toUpperCase();
    }
};

/*
class CajaDiaria {
    constructor(inicio, ventaEf, ventaTJ, ventaCP, gastosDiarios, gastosExtras, cierre) {
        this.inicio = Number(inicio);
        this.ventaEf = Number(ventaEf);
        this.ventaTJ = Number(ventaTJ);
        this.ventaCP = Number(ventaCP);
        this.gastosDiarios = Number(gastosDiarios);
        this.gastosExtras = Number(gastosExtras);
        this.cierre = Number(cierre);
    }
};
*/