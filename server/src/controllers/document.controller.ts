import { Request, Response } from 'express';
import { DocumentService } from '../services/document.service';

const service = new DocumentService();

export class DocumentController {
  public getByOwner = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ownerId, category } = req.params;
      const documents = await service.getDocumentsByOwner(ownerId, category as any);
      res.status(200).json(documents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public upload = async (req: any, res: Response): Promise<void> => {
    try {
      console.log('Recebendo upload de documento:', req.body);
      if (!req.file) {
        console.error('Erro: Nenhum arquivo enviado');
        throw new Error('Nenhum arquivo enviado');
      }
      
      const docData = {
        ...req.body,
        fileUrl: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      };
      
      console.log('Dados processados para salvamento:', docData);
      const newDoc = await service.uploadDocument(docData);
      res.status(201).json(newDoc);
    } catch (error: any) {
      console.error('Erro no upload de documento:', error);
      res.status(400).json({ 
        message: error.message,
        details: error.errors // Inclui erros de validação do Mongoose se houver
      });
    }
  }

  public update = async (req: Request, res: Response): Promise<void> => {
    try {
      const updated = await service.updateDocument(req.params.id, req.body);
      res.status(200).json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public delete = async (req: Request, res: Response): Promise<void> => {
    try {
      await service.deleteDocument(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
