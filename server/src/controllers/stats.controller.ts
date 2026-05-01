import { Request, Response } from 'express';
import Equipment from '../models/Equipment';
import Operator from '../models/Operator';
import Checklist from '../models/Checklist';
import Maintenance from '../models/Maintenance';
import DocumentModel from '../models/Document';

export class StatsController {
  public async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const totalEquipments = await Equipment.countDocuments();
      const activeEquipments = await Equipment.countDocuments({ status: 'active' });
      const maintenanceEquipments = await Equipment.countDocuments({ status: 'maintenance' });
      const blockedEquipments = await Equipment.countDocuments({ status: 'blocked' });

      const totalOperators = await Operator.countDocuments({ isActive: true });

      // Checklists today
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const checklistsToday = await Checklist.countDocuments({
        date: { $gte: start, $lte: end }
      });

      // Recent checklists
      const recentChecklists = await Checklist.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('equipment', 'name')
        .populate('operator', 'name');

      // Upcoming maintenances (next 30 days)
      const now = new Date();
      now.setHours(0,0,0,0);
      const nextMonthLimit = new Date();
      nextMonthLimit.setDate(nextMonthLimit.getDate() + 30);
      nextMonthLimit.setHours(23, 59, 59, 999);
      
      const upcomingMaintenances = await Equipment.find({
        nextMaintenance: { $lte: nextMonthLimit, $gte: now }
      }).select('name nextMaintenance');

      // 1. Alertas de Operadores (NRs e CNH)
      const expiringNRs = await Operator.find({
        "nrs.expiresAt": { $lte: nextMonthLimit }
      }).select('name nrs');

      const operatorAlerts = expiringNRs.flatMap(op => 
        op.nrs.filter(nr => nr.expiresAt <= nextMonthLimit)
          .map(nr => ({
            operatorName: op.name,
            docType: nr.type,
            expiresAt: nr.expiresAt,
            status: nr.expiresAt < now ? 'expired' : 'warning'
          }))
      );

      // 2. Alertas de Documentos Gerais (Document Model)
      const expiringGeneralDocs = await DocumentModel.find({
        expiresAt: { $lte: nextMonthLimit }
      }).populate('ownerId', 'name');

      const generalAlerts = expiringGeneralDocs.map(doc => ({
        operatorName: (doc.ownerId as any)?.name || 'N/A',
        docType: doc.name,
        expiresAt: doc.expiresAt,
        status: doc.status
      }));

      const documentAlerts = [...operatorAlerts, ...generalAlerts];

      // 1. Frota Utilização
      const utilization = [
        { name: 'Ativos', value: activeEquipments },
        { name: 'Manutenção', value: maintenanceEquipments },
        { name: 'Bloqueados', value: blockedEquipments },
      ];

      // 2. Custos de Manutenção (últimos 4 meses completos)
      const months = [];
      for (let i = 3; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const firstDay = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
        const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
        months.push({
          month: d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase(),
          start: firstDay,
          end: lastDay
        });
      }

      const costs = await Promise.all(months.map(async (m) => {
        const maintenances = await Maintenance.find({
          date: { $gte: m.start, $lte: m.end }
        });
        const totalCost = maintenances.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
        return { month: m.month, cost: totalCost };
      }));

      res.status(200).json({
        equipments: {
          total: totalEquipments,
          active: activeEquipments,
          maintenance: maintenanceEquipments,
          blocked: blockedEquipments
        },
        operators: {
          total: totalOperators
        },
        checklists: {
          today: checklistsToday,
          recent: recentChecklists
        },
        alerts: {
          upcomingMaintenances,
          documentAlerts
        },
        charts: {
          utilization,
          costs
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
