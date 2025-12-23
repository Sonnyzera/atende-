import React, { useState } from 'react';
import { Home, TicketPlus, CheckCircle, Printer } from 'lucide-react';
import { useSenhas, type TipoAtendimento, type Prioridade } from '../context/SenhasContext';
import type { Screen } from '../App';

interface GeradorSenhasProps {
  onNavigate: (screen: Screen) => void;
}

export default function GeradorSenhas({ onNavigate }: GeradorSenhasProps) {
  const { gerarSenha, senhas, ultimasSenhas } = useSenhas();
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoAtendimento>('Cadastro Novo');
  const [prioridade, setPrioridade] = useState<Prioridade>('normal');
  const [senhaGerada, setSenhaGerada] = useState<string | null>(null);
  const [mostrarSucesso, setMostrarSucesso] = useState(false);

  const tiposAtendimento: TipoAtendimento[] = [
    'Cadastro Novo',
    'Atualização',
    'Informações',
    'Benefícios',
    'Documentação',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nome.trim()) {
      const senha = gerarSenha(nome, tipo, prioridade);
      setSenhaGerada(senha.numero);
      setMostrarSucesso(true);

      // Reset após 5 segundos
      setTimeout(() => {
        setMostrarSucesso(false);
        setNome('');
        setPrioridade('normal');
        setSenhaGerada(null);
      }, 5000);
    }
  };

  const handleImprimir = () => {
    alert('Senha impressa! (simulação)');
  };

  const senhasAguardando = senhas.filter(s => s.status === 'aguardando');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-orange-700 to-orange-900 p-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="text-white hover:bg-white/20 p-3 rounded-xl transition-colors"
        >
          <Home className="w-6 h-6" />
        </button>
        <div className="text-center flex-1">
          <h1 className="text-white text-4xl">Gerador de Senhas</h1>
          <p className="text-orange-100 mt-1">Triagem e Emissão</p>
        </div>
        <div className="text-white text-right">
          <div className="text-3xl">{senhasAguardando.length}</div>
          <div className="text-orange-100 text-sm">na fila</div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center">
              <TicketPlus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-gray-800 text-3xl">Nova Senha</h2>
              <p className="text-gray-600">Preencha os dados do cidadão</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Nome do Cidadão *</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:outline-none text-lg"
                placeholder="Digite o nome completo"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Tipo de Atendimento *</label>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value as TipoAtendimento)}
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:outline-none text-lg"
              >
                {tiposAtendimento.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-3">Prioridade *</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPrioridade('normal')}
                  className={`p-6 rounded-xl border-2 transition-all ${prioridade === 'normal'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                >
                  <div className="text-xl mb-1">Normal</div>
                  <div className="text-sm opacity-75">Atendimento padrão</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPrioridade('prioritaria')}
                  className={`p-6 rounded-xl border-2 transition-all ${prioridade === 'prioritaria'
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                >
                  <div className="text-xl mb-1">🚨 Prioritária</div>
                  <div className="text-sm opacity-75">Idoso, gestante, PCD</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-xl transition-colors text-xl flex items-center justify-center gap-3"
            >
              <TicketPlus className="w-6 h-6" />
              Gerar Senha
            </button>
          </form>
        </div>

        {/* Senha Gerada / Resumo */}
        <div>
          {mostrarSucesso && senhaGerada ? (
            <div className="bg-white rounded-3xl shadow-2xl p-8 text-center animate-in">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>

              <h3 className="text-gray-800 text-3xl mb-4">Senha Gerada com Sucesso!</h3>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-8 mb-6">
                <div className="text-xl mb-3 opacity-90">Senha</div>
                <div className="text-8xl mb-4">{senhaGerada}</div>
                <div className="text-2xl mb-1">{nome}</div>
                <div className="text-lg opacity-90">{tipo}</div>
                {prioridade === 'prioritaria' && (
                  <div className="bg-red-500 text-white px-4 py-2 rounded-full inline-block mt-4">
                    🚨 PRIORITÁRIA
                  </div>
                )}
              </div>

              <button
                onClick={handleImprimir}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white py-4 rounded-xl flex items-center justify-center gap-2 transition-colors mb-3"
              >
                <Printer className="w-5 h-5" />
                Imprimir Senha
              </button>

              <p className="text-gray-500 text-sm">
                Aguarde ser chamado no painel público
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h3 className="text-gray-800 text-2xl mb-6">Resumo da Fila</h3>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50 rounded-2xl p-6 text-center">
                  <div className="text-4xl text-blue-600 mb-2">
                    {senhas.filter(s => s.status === 'aguardando' && s.prioridade === 'normal').length}
                  </div>
                  <div className="text-gray-700">Normais</div>
                </div>
                <div className="bg-red-50 rounded-2xl p-6 text-center">
                  <div className="text-4xl text-red-600 mb-2">
                    {senhas.filter(s => s.status === 'aguardando' && s.prioridade === 'prioritaria').length}
                  </div>
                  <div className="text-gray-700">Prioritárias</div>
                </div>
              </div>

              <h4 className="text-gray-700 mb-4">Últimas Senhas Geradas</h4>
              <div className="space-y-3">
                {senhas
                  .filter(s => s.status === 'aguardando')
                  .slice(-5)
                  .reverse()
                  .map(senha => (
                    <div
                      key={senha.id}
                      className={`p-4 rounded-xl border-2 ${senha.prioridade === 'prioritaria'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-gray-50 border-gray-200'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl text-gray-800 mb-1">{senha.numero}</div>
                          <div className="text-gray-600 text-sm">{senha.nome}</div>
                        </div>
                        {senha.prioridade === 'prioritaria' && (
                          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs">
                            PRIORITÁRIA
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              <h4 className="text-gray-700 mb-4 mt-8">Últimas Chamadas</h4>
              <div className="space-y-3">
                {ultimasSenhas.map(senha => (
                  <div
                    key={senha.id}
                    className="p-3 rounded-xl border border-gray-200 bg-gray-50 flex justify-between items-center opacity-75"
                  >
                    <div>
                      <span className="font-bold text-gray-700 mr-2">{senha.numero}</span>
                      <span className="text-sm text-gray-600">Guichê {senha.guiche}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(senha.horaChamada || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                {ultimasSenhas.length === 0 && (
                  <p className="text-gray-400 text-sm text-center">Nenhuma senha chamada ainda</p>
                )}
              </div>

              {senhasAguardando.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  Nenhuma senha na fila
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
