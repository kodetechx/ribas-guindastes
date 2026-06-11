import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateServiceOrderPDF = (service: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header - Industrial Style
  doc.setFillColor(30, 58, 138); // blue-900
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('ORDEM DE SERVIÇO', 15, 20);
  
  doc.setFontSize(10);
  doc.text(`ID: ${service._id.toString().toUpperCase()}`, 15, 30);
  doc.text(`EMISSÃO: ${new Date().toLocaleDateString()}`, pageWidth - 15, 30, { align: 'right' });

  // 1. Client & Service Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text('1. DADOS DO CLIENTE E LOCALIZAÇÃO', 15, 55);
  doc.setLineWidth(0.5);
  doc.line(15, 57, pageWidth - 15, 57);

  autoTable(doc, {
    startY: 60,
    head: [['Campo', 'Informação']],
    body: [
      ['CLIENTE', service.client?.fantasyName || '---'],
      ['CNPJ', service.client?.cnpj || '---'],
      ['SERVIÇO', service.title.toUpperCase()],
      ['LOCALIZAÇÃO', service.location.toUpperCase()],
      ['DATA DE INÍCIO', new Date(service.startDate).toLocaleDateString()],
      ['STATUS ATUAL', service.status === 'pending' ? 'PENDENTE' : service.status === 'in_progress' ? 'EM ANDAMENTO' : 'FINALIZADO'],
    ],
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
  });

  // 2. Equipments
  const finalY1 = (doc as any).lastAutoTable.finalY;
  const equipmentsY = finalY1 + 15;
  doc.setFontSize(12);
  doc.text('2. EQUIPAMENTOS ALOCADOS', 15, equipmentsY);
  doc.line(15, equipmentsY + 2, pageWidth - 15, equipmentsY + 2);

  autoTable(doc, {
    startY: equipmentsY + 5,
    head: [['Equipamento', 'Marca/Modelo', 'Série/Placa']],
    body: service.equipments?.map((eq: any) => [
      eq.name.toUpperCase(),
      `${eq.brand} ${eq.equipmentModel}`.toUpperCase(),
      eq.serialNumber.toUpperCase()
    ]) || [['---', '---', '---']],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold' }
  });

  // 3. Operators
  const finalY2 = (doc as any).lastAutoTable.finalY;
  const operatorsY = finalY2 + 15;
  doc.setFontSize(12);
  doc.text('3. EQUIPE TÉCNICA / OPERADORES', 15, operatorsY);
  doc.line(15, operatorsY + 2, pageWidth - 15, operatorsY + 2);

  autoTable(doc, {
    startY: operatorsY + 5,
    head: [['Nome Completo', 'Função']],
    body: service.operators?.map((op: any) => [
      op.name.toUpperCase(),
      (op.role || 'OPERADOR').toUpperCase()
    ]) || [['---', '---']],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold' }
  });

  // 4. Safety Rules
  const finalY3 = (doc as any).lastAutoTable.finalY;
  const safetyY = finalY3 + 15;
  doc.setFontSize(12);
  doc.text('4. REGRAS DE SEGURANÇA E CONFORMIDADE', 15, safetyY);
  doc.line(15, safetyY + 2, pageWidth - 15, safetyY + 2);

  const rules = [
    '• Checklist diário de pré-operação é OBRIGATÓRIO.',
    '• Uso de EPIs completos conforme NR-06 e regras do cliente.',
    '• Proibida a operação sob condições climáticas adversas (Vento > 40km/h).',
    '• Manter isolamento de área e raio de giro do equipamento.',
    '• Qualquer incidente deve ser reportado imediatamente via sistema.'
  ];
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  rules.forEach((rule, index) => {
    doc.text(rule, 15, safetyY + 10 + (index * 6));
  });

  // Signatures
  const footerY = 270;
  doc.setLineWidth(0.2);
  doc.line(20, footerY, 90, footerY);
  doc.line(120, footerY, 190, footerY);
  
  doc.setFontSize(8);
  doc.text('RESPONSÁVEL PELA OPERAÇÃO', 55, footerY + 5, { align: 'center' });
  doc.text('CIENTE CLIENTE', 155, footerY + 5, { align: 'center' });

  // Save the PDF
  const fileName = `OS_${service.title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};
