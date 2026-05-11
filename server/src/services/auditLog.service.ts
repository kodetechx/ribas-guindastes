import { AuditLogRepository } from '../repositories/auditLog.repository';

const repository = new AuditLogRepository();

export class AuditLogService {
  async log(userId: string, action: string, targetModel: string, targetId: string, details?: any) {
    try {
      await repository.create({
        user: userId as any,
        action,
        targetModel: targetModel as any,
        targetId: targetId as any,
        details
      });
    } catch (error) {
      console.error('Erro ao gravar log de auditoria:', error);
      // Não lançamos erro para não quebrar o fluxo principal
    }
  }

  async getLogs(limit?: number) {
    return await repository.findAll(limit);
  }

  async getTargetLogs(targetModel: string, targetId: string) {
    return await repository.findByTarget(targetModel, targetId);
  }
}
