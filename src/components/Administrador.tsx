import React, { useState } from 'react';
import { Home, Users, BarChart2, Settings, Edit2, Trash2, Plus, X, AlertTriangle, LogOut } from 'lucide-react';
import { useSenhas, type Usuario } from '../context/SenhasContext';
import type { Screen } from '../App';

interface AdministradorProps {
  onNavigate: (screen: Screen) => void;
}

export default function Administrador({ onNavigate }: AdministradorProps) {
  const { senhas, usuarios, adicionarUsuario, excluirUsuario, resetarFila } = useSenhas();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [abaAtiva, setAbaAtiva] = useState<'usuarios' | 'estatisticas' | 'configuracoes'>('usuarios');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    funcao: 'Atendente' as 'Atendente' | 'Gerador',
    guiche: 1,
    tiposAtendimento: [] as string[]
  });

  // Login Logic
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin123') {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // User Management Logic
  const handleSubmitUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    adicionarUsuario({
      nome: formData.nome,
      email: formData.email,
      funcao: formData.funcao,
      guiche: formData.funcao === 'Atendente' ? formData.guiche : undefined,
      tiposAtendimento: formData.tiposAtendimento // For simplicity, empty or basic default
    });
    setMostrarFormulario(false);
    setFormData({ nome: '', email: '', funcao: 'Atendente', guiche: 1, tiposAtendimento: [] });
  };

  // Queue Management
  const handleResetQueue = () => {
    if (confirm('Tem certeza? Isso apagará TODAS as senhas e reiniciará os contadores.')) {
      resetarFila();
    }
  };

  // Render Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Acesso Restrito</h1>
            <p className="text-gray-500 mt-2">Área Administrativa</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Senha de Acesso</label>
              <input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
                placeholder="Digite a senha..."
                autoFocus
              />
              {loginError && <p className="text-red-500 text-sm mt-2">Senha incorreta.</p>}
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="flex-1 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium transition-colors"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Render Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('home')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <Home className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Painel Administrativo</h1>
            <p className="text-gray-500 text-sm">Bem-vindo, Administrador</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors">
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setAbaAtiva('usuarios')}
          className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors ${abaAtiva === 'usuarios' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
        >
          <Users className="w-5 h-5" /> Usuários
        </button>
        <button
          onClick={() => setAbaAtiva('configuracoes')}
          className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors ${abaAtiva === 'configuracoes' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
        >
          <Settings className="w-5 h-5" /> Controle da Fila
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6">

        {/* USERS TAB */}
        {abaAtiva === 'usuarios' && (
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800">Equipe de Atendimento</h2>
              <button
                onClick={() => setMostrarFormulario(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" /> Novo Usuário
              </button>
            </div>

            {mostrarFormulario && (
              <div className="mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100 animation-fade-in">
                <form onSubmit={handleSubmitUsuario} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    placeholder="Nome Completo"
                    required
                    className="px-4 py-3 rounded-xl border border-gray-200"
                    value={formData.nome}
                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  />
                  <input
                    placeholder="Email"
                    required
                    type="email"
                    className="px-4 py-3 rounded-xl border border-gray-200"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                  <select
                    className="px-4 py-3 rounded-xl border border-gray-200"
                    value={formData.funcao}
                    onChange={e => setFormData({ ...formData, funcao: e.target.value as any })}
                  >
                    <option value="Atendente">Atendente</option>
                    <option value="Gerador">Gerador de Senhas</option>
                  </select>
                  {formData.funcao === 'Atendente' && (
                    <input
                      type="number"
                      placeholder="Nº Guichê"
                      className="px-4 py-3 rounded-xl border border-gray-200"
                      value={formData.guiche}
                      onChange={e => setFormData({ ...formData, guiche: parseInt(e.target.value) })}
                    />
                  )}
                  <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                    <button type="button" onClick={() => setMostrarFormulario(false)} className="px-4 py-2 text-gray-500">Cancelar</button>
                    <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-xl">Salvar</button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-3">
              {usuarios.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
                      {u.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{u.nome}</p>
                      <p className="text-sm text-gray-500">{u.funcao} {u.guiche ? `- Guichê ${u.guiche}` : ''}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => excluirUsuario(u.id)}
                    className="text-red-400 hover:text-red-600 p-2"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONFIG TAB */}
        {abaAtiva === 'configuracoes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                Zona de Perigo
              </h2>

              <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-red-800 font-semibold text-lg">Zerar Fila do Dia</h3>
                  <p className="text-red-600 text-sm mt-1">
                    Isso apagará todas as senhas aguardando, chamadas e concluídas.<br />
                    Os contadores (N001, P001) serão reiniciados.
                  </p>
                </div>
                <button
                  onClick={handleResetQueue}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-red-200"
                >
                  Zerar Tudo
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Estatísticas Rápidas</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-blue-600 text-sm">Total Senhas</p>
                  <p className="text-2xl font-bold text-blue-800">{senhas.length}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl">
                  <p className="text-orange-600 text-sm">Aguardando</p>
                  <p className="text-2xl font-bold text-orange-800">{senhas.filter(s => s.status === 'aguardando').length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-green-600 text-sm">Atendidas</p>
                  <p className="text-2xl font-bold text-green-800">{senhas.filter(s => s.status === 'concluida').length}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
