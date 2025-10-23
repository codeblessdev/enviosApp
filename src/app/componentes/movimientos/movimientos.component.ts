import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimientos.component.html',
  styleUrl: './movimientos.component.scss'
})
export class MovimientosComponent {

   tabSeleccionada: 'porFacturar' | 'facturados' | 'noFacturables' = 'porFacturar';

  fechaDesde: string = '';
  fechaHasta: string = '';
  filtroTipo: '' | 'cargaSaldo' | 'gastoEnvio' | 'gastoSeguro' = '';

  movimientos: any[] = [
    // Datos ejemplo
    { id: 1, descripcion: 'Venta A', fecha: '2025-06-01', monto: 1000, facturado: false, noFacturable: false },
    { id: 2, descripcion: 'Venta B', fecha: '2025-06-02', monto: 2000, facturado: true, noFacturable: false },
    { id: 3, descripcion: 'Gasto C', fecha: '2025-06-01', monto: 500, facturado: false, noFacturable: true },
    // Más datos...
  ];

  movimientosFiltrados: any[] = [];

  saldoActual = 0;
  totalFacturado = 0;
  totalPendiente = 0;

  ultimosMovimientos: any[] = [];

  ngOnInit() {
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(hoy.getMonth() - 1);

    this.fechaDesde = haceUnMes.toISOString().slice(0, 10);
    this.fechaHasta = hoy.toISOString().slice(0, 10);

    this.calcularResumen();
    this.buscarMovimientos();
  }

  buscarMovimientos() {
    const desde = new Date(this.fechaDesde);
    const hasta = new Date(this.fechaHasta);

    this.movimientosFiltrados = this.movimientos.filter(m => {
      const fechaMov = new Date(m.fecha);
      const dentroRango = fechaMov >= desde && fechaMov <= hasta;

      const coincideTab = this.tabSeleccionada === 'porFacturar' ? !m.facturado && !m.noFacturable :
                         this.tabSeleccionada === 'facturados' ? m.facturado :
                         this.tabSeleccionada === 'noFacturables' ? m.noFacturable : true;

      return dentroRango && coincideTab;
    });

    this.limpiarSeleccion();
  }

  limpiarSeleccion() {
    this.movimientosFiltrados.forEach(m => (m.seleccionado = false));
  }

  todosSeleccionados() {
    return this.movimientosFiltrados.length > 0 &&
           this.movimientosFiltrados.every(m => m.seleccionado);
  }

  toggleSeleccionTodos(checked: boolean) {
    this.movimientosFiltrados.forEach(m => {
      if (this.tabSeleccionada === 'porFacturar') {
        m.seleccionado = checked;
      }
    });
  }

  toggleSeleccionTodosDesdeEvento(event: Event) {
    const target = event.target as HTMLInputElement;
    this.toggleSeleccionTodos(target.checked);
  }

  haySeleccion() {
    return this.movimientosFiltrados.some(m => m.seleccionado);
  }

  facturarSeleccionados() {
    const seleccionados = this.movimientosFiltrados.filter(m => m.seleccionado);
    if (seleccionados.length) {
      alert(`Facturando ${seleccionados.length} movimientos`);
      // Aquí actualizar estado o llamar backend
    }
  }

  calcularResumen() {
    this.saldoActual = this.movimientos.reduce((acc, m) => acc + m.monto, 0);
    this.totalFacturado = this.movimientos
      .filter(m => m.facturado)
      .reduce((acc, m) => acc + m.monto, 0);
    this.totalPendiente = this.movimientos
      .filter(m => !m.facturado && !m.noFacturable)
      .reduce((acc, m) => acc + m.monto, 0);

    this.ultimosMovimientos = [...this.movimientos]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5);
  }


  exportarPDF() {
    alert('ME HABILITARON LA CUENTA DEL SANTANDERRRR');
  }

}
