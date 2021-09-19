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
    constructor(id, proveedor, numeroFact, fecha, detalle, totalCompra, pago) {
        this.id = Number(id);
        this.proveedor = proveedor.toUpperCase();
        this.numeroFact = Number(numeroFact);
        this.fecha = fecha;
        this.detalle = detalle;
        this.totalCompra = totalCompra;
        this.pago = Number(pago);
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
    constructor(id, cliente, ticket, fecha, detalleVta, total, formaDePago, pago) {
        this.id = Number(id);
        this.cliente = cliente.toUpperCase();
        this.ticket = Number(ticket);
        this.fecha = fecha;
        this.detalleVta = detalleVta;
        this.total = total;
        this.formaDePago = formaDePago;
        this.pago = Number(pago);
    }
}

export class InfoArticulo {
    constructor(articulo, nombreArt) {
        this.articulo = articulo;
        this.nombreArt = nombreArt.toUpperCase();
    }
};

export class Cliente {
    constructor(id, nombre, apellido, telefono, saldo) {
        this.id = Number(id);
        this.nombre = nombre.toUpperCase();
        this.apellido = apellido.toUpperCase();
        this.telefono = Number(telefono);
        this.saldo = Number(saldo);
    }
};


export class RegistradorDebHabCP {
    constructor(fecha, id, debe, haber, clase) {
        this.fecha = fecha;
        this.id = Number(id);
        this.debe = Number(debe);
        this.haber = Number(haber);
        this.clase = clase.toUpperCase()
    }
};


export class Caja1 {
    constructor(fecha, descripcion, debe, haber, saldo,) {
        this.fecha = fecha;
        this.descripcion = descripcion;
        this.debe = Number(debe);
        this.haber = Number(haber);
        this.saldo = Number(saldo);
    }
};
