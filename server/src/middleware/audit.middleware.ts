import AuditLog from '../models/AuditLog';

export const logAction = (model: 'Equipment' | 'Operator' | 'Checklist' | 'Maintenance' | 'Service') => {
  return async (req: any, res: any, next: any) => {
    const originalSend = res.send;
    
    // Sobrescreve o send para registrar após a resposta
    res.send = function (body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        AuditLog.create({
          user: req.user.id,
          action: req.method,
          targetModel: model,
          targetId: req.params.id || req.body._id,
          details: req.body
        }).catch(console.error);
      }
      return originalSend.apply(res, arguments as any);
    };
    next();
  };
};
