import AuditLog, { IAuditLog } from '../models/AuditLog';

export class AuditLogRepository {
  async create(data: Partial<IAuditLog>) {
    return await AuditLog.create(data);
  }

  async findAll(limit = 100) {
    return await AuditLog.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async findByTarget(targetModel: string, targetId: string) {
    return await AuditLog.find({ targetModel, targetId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
  }

  async findByUser(userId: string) {
    return await AuditLog.find({ user: userId })
      .sort({ createdAt: -1 });
  }
}
