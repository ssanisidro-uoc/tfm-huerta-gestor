export class DashboardStatsResponse {
  constructor(
    readonly total_parcelas: number,
    readonly parcelas_activas: number,
    readonly cultivos_en_curso: number,
    readonly tareas_pendientes: number,
    readonly tareas_completadas: number,
    readonly tareas_atrasadas: number,
    readonly cosechas_proximas: number
  ) {}
}
