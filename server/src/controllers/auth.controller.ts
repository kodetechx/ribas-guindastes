import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Operator from '../models/Operator';

export class AuthController {
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find operator by email
      const operator = await Operator.findOne({ email });
      if (!operator) {
        res.status(401).json({ message: 'Credenciais inválidas' });
        return;
      }

      if (!operator.isActive) {
        res.status(403).json({ message: 'Conta desativada' });
        return;
      }

      // Check password
      if (!operator.password) {
        res.status(401).json({ message: 'Senha não definida para este usuário' });
        return;
      }

      const isMatch = await bcrypt.compare(password, operator.password);
      if (!isMatch) {
        res.status(401).json({ message: 'Credenciais inválidas' });
        return;
      }

      // Generate JWT
      const token = jwt.sign(
        { id: operator._id, role: operator.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' }
      );

      res.status(200).json({
        token,
        user: {
          id: operator._id,
          name: operator.name,
          email: operator.email,
          role: operator.role,
          registrationNumber: operator.registrationNumber,
          cnh: operator.cnh,
          nrs: operator.nrs,
          photoUrl: operator.photoUrl,
          avatarUrl: operator.avatarUrl,
          createdAt: operator.createdAt,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public async getMe(req: any, res: Response): Promise<void> {
    try {
      const operator = await Operator.findById(req.user.id).select('-password');
      if (!operator) {
        res.status(404).json({ message: 'Usuário não encontrado' });
        return;
      }
      res.status(200).json(operator);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
