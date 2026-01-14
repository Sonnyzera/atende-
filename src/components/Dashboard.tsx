import React from 'react';
import { Home, Clock, Users, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSenhas } from '../context/SenhasContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { senhas, usuarios } = useSenhas();
  const navigate = useNavigate();

  const senhasAguardando = senhas.filter(s => s.status === 'aguardando');
  const senhasConcluidas = senhas.filter(s => s.status === 'concluida');
  const guichesAtivos = new Set(senhas.filter(s => s.status === 'atendendo').map(s => s.guiche)).size;

  const calcularTempoMedio = () => {
    const senhasComTempo = senhas.filter(s => s.status === 'concluida' && s.horaChamada && s.horaFinalizacao);
    if (senhasComTempo.length === 0) return 0;

    const total = senhasComTempo.reduce((acc, s) => {
      if (s.horaChamada && s.horaFinalizacao) {
        return acc + (s.horaFinalizacao.getTime() - s.horaChamada.getTime());
      }
      return acc;
    }, 0);

    return Math.round(total / senhasComTempo.length / 60000);
  };

  // Dados para gráfico de senhas por tipo
  const senhasPorTipo = senhas.reduce((acc, senha) => {
    const item = acc.find(i => i.name === senha.tipo);
    if (item) {
      item.value++;
    } else {
      acc.push({ name: senha.tipo, value: 1 });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  // Dados para gráfico de status
  const senhasPorStatus = [
    { name: 'Aguardando', value: senhas.filter(s => s.status === 'aguardando').length, color: '#f59e0b' },
    { name: 'Chamada', value: senhas.filter(s => s.status === 'chamada').length, color: '#3b82f6' },
    { name: 'Atendendo', value: senhas.filter(s => s.status === 'atendendo').length, color: '#06b6d4' },
    { name: 'Concluída', value: senhas.filter(s => s.status === 'concluida').length, color: '#10b981' },
    { name: 'Cancelada', value: senhas.filter(s => s.status === 'cancelada').length, color: '#ef4444' },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="text-white hover:bg-white/20 p-3 rounded-xl transition-colors"
        >
          <Home className="w-6 h-6" />
        </button>
        <div className="text-center flex-1">
          <h1 className="text-white text-4xl">Dashboard de Monitoramento</h1>
          <p className="text-indigo-100 mt-1">Visão geral em tempo real</p>
        </div>
        <div className="text-white text-right">
          <Activity className="w-8 h-8 animate-pulse" />
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-orange-500 text-sm">Em Espera</div>
          </div>
          <div className="text-4xl text-gray-800 mb-1">{senhasAguardando.length}</div>
          <div className="text-gray-500 text-sm">Senhas aguardando</div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-green-500 text-sm">Hoje</div>
          </div>
          <div className="text-4xl text-gray-800 mb-1">{senhasConcluidas.length}</div>
          <div className="text-gray-500 text-sm">Atendimentos concluídos</div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-blue-500 text-sm">Média</div>
          </div>
          <div className="text-4xl text-gray-800 mb-1">{calcularTempoMedio()}</div>
          <div className="text-gray-500 text-sm">Minutos por atendimento</div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-purple-500 text-sm">Ativos</div>
          </div>
          <div className="text-4xl text-gray-800 mb-1">{guichesAtivos}</div>
          <div className="text-gray-500 text-sm">Guichês atendendo</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Senhas Aguardando */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-gray-800 text-2xl mb-4">Senhas Aguardando</h2>

          {senhasAguardando.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {senhasAguardando.map(senha => (
                <div
                  key={senha.id}
                  className={`p-4 rounded-xl border-2 ${senha.prioridade === 'prioritaria'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl text-gray-800">{senha.numero}</div>
                    {senha.prioridade === 'prioritaria' && (
                      <div className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                        PRIORITÁRIA
                      </div>
                    )}
                  </div>
                  <div className="text-gray-700">{senha.nome}</div>
                  <div className="text-gray-500 text-sm">{senha.tipo}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma senha aguardando</p>
            </div>
          )}
        </div>

        {/* Gráficos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gráfico de Senhas por Tipo */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-gray-800 text-2xl mb-4">Senhas por Tipo de Serviço</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={senhasPorTipo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Senhas por Status */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-gray-800 text-2xl mb-4">Senhas por Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={senhasPorStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {senhasPorStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atendimentos Concluídos Hoje */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-gray-800 text-2xl mb-4">Atendimentos Concluídos Hoje</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 text-gray-700 text-sm">Senha</th>
                  <th className="text-left p-3 text-gray-700 text-sm">Nome</th>
                  <th className="text-center p-3 text-gray-700 text-sm">Guichê</th>
                  <th className="text-left p-3 text-gray-700 text-sm">Atendente</th>
                </tr>
              </thead>
              <tbody>
                {senhasConcluidas.slice(-10).reverse().map(senha => (
                  <tr key={senha.id} className="border-t border-gray-100">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {senha.numero}
                        {senha.prioridade === 'prioritaria' && (
                          <span className="bg-red-500 text-white px-1 py-0.5 rounded text-xs">P</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">{senha.nome}</td>
                    <td className="p-3 text-center">{senha.guiche}</td>
                    <td className="p-3 text-sm text-gray-600">{senha.atendente}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Desempenho dos Guichês */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-gray-800 text-2xl mb-4">Desempenho dos Guichês</h2>
          <div className="space-y-4">
            {usuarios
              .filter(u => u.funcao === 'Atendente')
              .map(atendente => {
                const atendimentos = senhas.filter(
                  s => s.atendente === atendente.nome && s.status === 'concluida'
                );
                const emAtendimento = senhas.find(
                  s => s.guiche === atendente.guiche && s.status === 'atendendo'
                );

                return (
                  <div key={atendente.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-gray-800">Guichê {atendente.guiche}</div>
                        <div className="text-gray-600 text-sm">{atendente.nome}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl text-indigo-600">{atendimentos.length}</div>
                        <div className="text-gray-500 text-xs">atendimentos</div>
                      </div>
                    </div>
                    {emAtendimento && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-600">
                        Atendendo: <span className="text-indigo-600">{emAtendimento.numero}</span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
