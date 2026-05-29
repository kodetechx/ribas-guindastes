import { useState, useEffect } from 'react';
import { Users, ClipboardList, Settings as SettingsIcon, Plus, Trash2, Edit2, X, FileText } from 'lucide-react';
import api from '../services/api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<'clients' | 'checklists' | 'forms' | 'documents'>('clients');
  const [clients, setClients] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showDocTypeForm, setShowDocTypeForm] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [editingDocType, setEditingDocType] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsRes, templatesRes, docTypesRes] = await Promise.all([
        api.get('/clients'),
        api.get('/checklist-templates'),
        api.get('/document-types')
      ]);
      setClients(clientsRes.data);
      setTemplates(templatesRes.data);
      setDocumentTypes(docTypesRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados das configurações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await api.delete(`/clients/${id}`);
        fetchData();
      } catch (err) {
        alert('Erro ao excluir cliente');
      }
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este template?')) {
      try {
        await api.delete(`/checklist-templates/${id}`);
        fetchData();
      } catch (err) {
        alert('Erro ao excluir template');
      }
    }
  };

  const handleDeleteDocType = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este tipo de documento?')) {
      try {
        await api.delete(`/document-types/${id}`);
        fetchData();
      } catch (err) {
        alert('Erro ao excluir tipo de documento');
      }
    }
  };

  return (
    <div className="fade-in max-w-6xl mx-auto">
      <div className="mb-10 border-b border-gray-200 pb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Configurações</h2>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Gerenciamento administrativo do sistema</p>
        </div>
      </div>

      <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-sm w-fit overflow-x-auto">
        <button 
          onClick={() => setActiveTab('clients')}
          className={`flex items-center gap-2 px-6 py-2 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'clients' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Users size={14} /> Clientes
        </button>
        <button 
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 px-6 py-2 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'documents' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FileText size={14} /> Tipos de Documentos
        </button>
        <button 
          onClick={() => setActiveTab('checklists')}
          className={`flex items-center gap-2 px-6 py-2 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'checklists' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <ClipboardList size={14} /> Checklists
        </button>
        <button 
          onClick={() => setActiveTab('forms')}
          className={`flex items-center gap-2 px-6 py-2 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'forms' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <SettingsIcon size={14} /> Preferências
        </button>
      </div>

      {loading ? <div className="text-center py-20">Carregando...</div> : (
        <div>
          {activeTab === 'clients' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-gray-900 uppercase">Gestão de Clientes</h3>
                <button 
                  onClick={() => { setEditingClient(null); setShowClientForm(true); }}
                  className="btn-industrial btn-primary flex items-center gap-2"
                >
                  <Plus size={16} /> Novo Cliente
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map(client => (
                  <div key={client._id} className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm hover:border-blue-200 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-black text-blue-900 uppercase leading-tight">{client.fantasyName}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{client.cnpj}</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingClient(client); setShowClientForm(true); }} className="text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteClient(client._id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-gray-600 space-y-1">
                      <p>📍 {client.address}</p>
                      <p>📞 {client.phone}</p>
                      <p>✉️ {client.email}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap gap-1">
                      {client.requiredDocuments?.map((doc: any, i: number) => (
                        <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-sm text-[9px] font-black uppercase">
                          {doc.documentTypeId}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-gray-900 uppercase">Tipos de Documentos</h3>
                <button 
                  onClick={() => { setEditingDocType(null); setShowDocTypeForm(true); }}
                  className="btn-industrial btn-primary flex items-center gap-2"
                >
                  <Plus size={16} /> Novo Tipo
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-[10px] font-black uppercase text-gray-400">Nome</th>
                      <th className="p-4 text-[10px] font-black uppercase text-gray-400">Categoria</th>
                      <th className="p-4 text-[10px] font-black uppercase text-gray-400">Status</th>
                      <th className="p-4 text-[10px] font-black uppercase text-gray-400 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {documentTypes.map(type => (
                      <tr key={type._id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-blue-900 uppercase text-xs">{type.name}</td>
                        <td className="p-4">
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-sm text-[9px] font-black uppercase">
                            {type.category === 'both' ? 'Todos' : type.category === 'operator' ? 'Operador' : 'Equipamento'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`w-2 h-2 rounded-full inline-block mr-2 ${type.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="text-[10px] font-bold uppercase">{type.isActive ? 'Ativo' : 'Inativo'}</span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => { setEditingDocType(type); setShowDocTypeForm(true); }} className="text-gray-400 hover:text-blue-600"><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteDocType(type._id)} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'checklists' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-gray-900 uppercase">Templates de Checklist</h3>
                <button 
                  onClick={() => { setEditingTemplate(null); setShowTemplateForm(true); }}
                  className="btn-industrial btn-primary flex items-center gap-2"
                >
                  <Plus size={16} /> Novo Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <div key={template._id} className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm hover:border-blue-200 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-black text-blue-900 uppercase leading-tight">{template.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{template.items?.length || 0} ITENS</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingTemplate(template); setShowTemplateForm(true); }} className="text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteTemplate(template._id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium italic mb-4 line-clamp-2">{template.description || 'Sem descrição.'}</p>
                    <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                      Última atualização: {new Date(template.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'forms' && (
            <div className="bg-white border border-gray-200 p-10 rounded-sm text-center">
              <SettingsIcon size={48} className="mx-auto text-gray-200 mb-4" />
              <h3 className="text-lg font-black text-gray-900 uppercase mb-2">Preferências Gerais</h3>
              <p className="text-sm text-gray-400 font-medium">Módulo em desenvolvimento. Aqui você poderá configurar notificações e regras de sistema.</p>
            </div>
          )}
        </div>
      )}

      {showClientForm && (
        <ClientForm 
          initialData={editingClient} 
          documentTypes={documentTypes.filter(t => t.isActive)}
          onClose={() => setShowClientForm(false)} 
          onSuccess={() => { fetchData(); setShowClientForm(false); }} 
        />
      )}

      {showDocTypeForm && (
        <DocTypeForm 
          initialData={editingDocType} 
          onClose={() => setShowDocTypeForm(false)} 
          onSuccess={() => { fetchData(); setShowDocTypeForm(false); }} 
        />
      )}

      {showTemplateForm && (
        <TemplateForm 
          initialData={editingTemplate} 
          onClose={() => setShowTemplateForm(false)} 
          onSuccess={() => { fetchData(); setShowTemplateForm(false); }} 
        />
      )}
    </div>
  );
};

const ClientForm = ({ initialData, documentTypes, onClose, onSuccess }: any) => {
  const [formData, setFormData] = useState(initialData || {
    name: '', fantasyName: '', cnpj: '', phone: '', email: '', address: '', notes: '', requiredDocuments: []
  });
  const [selectedDocType, setSelectedDocType] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData) {
        await api.put(`/clients/${initialData._id}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      onSuccess();
    } catch (err) {
      alert('Erro ao salvar cliente');
    }
  };

  const addDocRequirement = () => {
    if (selectedDocType && !formData.requiredDocuments.find((d: any) => d.documentTypeId === selectedDocType)) {
      setFormData({
        ...formData,
        requiredDocuments: [...formData.requiredDocuments, { documentTypeId: selectedDocType, required: true }]
      });
      setSelectedDocType('');
    }
  };

  const removeDocRequirement = (type: string) => {
    setFormData({
      ...formData,
      requiredDocuments: formData.requiredDocuments.filter((d: any) => d.documentTypeId !== type)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-sm w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-lg font-black uppercase text-blue-900">{initialData ? 'Editar Cliente' : 'Novo Cliente'}</h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Razão Social</label>
              <input type="text" className="w-full border p-3 text-sm focus:border-blue-900 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Nome Fantasia</label>
              <input type="text" className="w-full border p-3 text-sm focus:border-blue-900 outline-none" value={formData.fantasyName} onChange={e => setFormData({...formData, fantasyName: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">CNPJ</label>
              <input type="text" className="w-full border p-3 text-sm focus:border-blue-900 outline-none" value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">E-mail</label>
              <input type="email" className="w-full border p-3 text-sm focus:border-blue-900 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Telefone</label>
              <input type="text" className="w-full border p-3 text-sm focus:border-blue-900 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Endereço</label>
              <input type="text" className="w-full border p-3 text-sm focus:border-blue-900 outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-gray-900 border-b pb-2">Documentos Obrigatórios</h4>
            <div className="flex gap-2">
              <select 
                className="flex-1 border p-2 text-sm font-bold uppercase" 
                value={selectedDocType} 
                onChange={e => setSelectedDocType(e.target.value)} 
              >
                <option value="">Selecione um tipo...</option>
                {documentTypes.map((t: any) => (
                  <option key={t._id} value={t.name}>{t.name}</option>
                ))}
              </select>
              <button type="button" onClick={addDocRequirement} className="bg-gray-900 text-white px-4 text-xs font-black uppercase">Adicionar</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.requiredDocuments.map((doc: any) => (
                <div key={doc.documentTypeId} className="bg-blue-900 text-white px-3 py-1.5 rounded-sm flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase">{doc.documentTypeId}</span>
                  <button type="button" onClick={() => removeDocRequirement(doc.documentTypeId)} className="hover:text-red-300"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full bg-blue-900 text-white py-4 font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-800 transition-colors">Salvar Cliente</button>
        </form>
      </div>
    </div>
  );
};

const DocTypeForm = ({ initialData, onClose, onSuccess }: any) => {
  const [formData, setFormData] = useState(initialData || {
    name: '', category: 'both', isActive: true, description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData) {
        await api.put(`/document-types/${initialData._id}`, formData);
      } else {
        await api.post('/document-types', formData);
      }
      onSuccess();
    } catch (err) {
      alert('Erro ao salvar tipo de documento');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-sm w-full max-w-md shadow-xl">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-black uppercase text-blue-900">{initialData ? 'Editar Tipo' : 'Novo Tipo'}</h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Nome do Documento</label>
              <input type="text" placeholder="Ex: NR11, ART..." className="w-full border p-3 text-sm focus:border-blue-900 outline-none uppercase font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Categoria</label>
              <select className="w-full border p-3 text-sm focus:border-blue-900 outline-none font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="both">Todos</option>
                <option value="operator">Operador</option>
                <option value="equipment">Equipamento</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
              <label htmlFor="isActive" className="text-xs font-bold uppercase text-gray-700">Ativo</label>
            </div>
          </div>
          <button className="w-full bg-blue-900 text-white py-4 font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-800 transition-colors">Salvar Tipo</button>
        </form>
      </div>
    </div>
  );
};

const TemplateForm = ({ initialData, onClose, onSuccess }: any) => {
  const [formData, setFormData] = useState(initialData || {
    name: '', description: '', items: []
  });
  const [newItem, setNewItem] = useState({ label: '', description: '', required: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData) {
        await api.put(`/checklist-templates/${initialData._id}`, formData);
      } else {
        await api.post('/checklist-templates', formData);
      }
      onSuccess();
    } catch (err) {
      alert('Erro ao salvar template');
    }
  };

  const addItem = () => {
    if (newItem.label) {
      setFormData({
        ...formData,
        items: [...formData.items, { ...newItem, order: formData.items.length + 1 }]
      });
      setNewItem({ label: '', description: '', required: true });
    }
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-sm w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-lg font-black uppercase text-blue-900">{initialData ? 'Editar Template' : 'Novo Template'}</h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Nome do Template</label>
              <input type="text" className="w-full border p-3 text-sm focus:border-blue-900 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Descrição</label>
              <textarea className="w-full border p-3 text-sm focus:border-blue-900 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-gray-900 border-b pb-2">Itens do Checklist</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input 
                type="text" 
                placeholder="Título do Item" 
                className="md:col-span-2 border p-2 text-sm" 
                value={newItem.label} 
                onChange={e => setNewItem({...newItem, label: e.target.value})} 
              />
              <button type="button" onClick={addItem} className="bg-gray-900 text-white px-4 text-xs font-black uppercase h-10">Adicionar</button>
            </div>
            
            <div className="space-y-2 mt-4">
              {formData.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-sm">
                  <div>
                    <p className="text-xs font-black uppercase text-blue-900">{item.label}</p>
                    {item.description && <p className="text-[10px] text-gray-500 font-medium">{item.description}</p>}
                  </div>
                  <button type="button" onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full bg-blue-900 text-white py-4 font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-800 transition-colors">Salvar Template</button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
