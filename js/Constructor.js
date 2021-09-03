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
    constructor(proveedor, numeroFact, fecha, detalle, totalCompra) {
        this.proveedor = proveedor.toUpperCase();
        this.numeroFact = Number(numeroFact);
        this.fecha = fecha;
        this.detalle = detalle;
        this.totalCompra = totalCompra;
    }
};

export class PrendaVendida {
    constructor(cantidad, articulo, nombre, pUnit) {
        this.cantidad = Number(cantidad);
        this.articulo = articulo;
        this.nombre = nombre.toUpperCase();
        this.pUnit = Number(pUnit);
        this.total = Number(this.cantidad * this.pUnit);
    }
};

export class FacturaVenta {
    constructor(id, cliente, ticket, fecha, detalleVta, total) {
        this.id = Number(id);
        this.cliente = cliente.toUpperCase();
        this.ticket = Number(ticket);
        this.fecha = fecha;
        this.detalleVta = detalleVta;
        this.total = total;
    }
}

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