import { Request, Response } from 'express';
import Equipment from '../models/Equipment';
import Operator from '../models/Operator';
import Checklist from '../models/Checklist';
import Maintenance from '../models/Maintenance';

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

      // Upcoming maintenances (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const upcomingMaintenances = await Equipment.find({
        nextMaintenance: { $lte: nextWeek, $gte: new Date() }
      }).select('name nextMaintenance');

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
          upcomingMaintenances
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
