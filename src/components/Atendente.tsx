import React, { useState } from 'react';
import { Home, Phone, CheckCircle, XCircle, AlertCircle, Clock, Volume2 } from 'lucide-react';
import { useSenhas } from '../context/SenhasContext';
import type { Screen } from '../App';

interface AtendenteProps {
  onNavigate: (screen: Screen) => void;
}

export default function Atendente({ onNavigate }: AtendenteProps) {
  const { senhas, usuarios, chamarSenha, finalizarAtendimento, cancelarSenha, repetirSenha } = useSenhas();
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<string>('');
  const [guiche, setGuiche] = useState(1);
  const [logado, setLogado] = useState(false);

  // Filtrar apenas usuários com função Atendente
  const listaAtendentes = usuarios.filter(u => u.funcao === 'Atendente');

  const usuarioAtualObj = usuarios.find(u => u.id === usuarioSelecionado);

  // As senhas que este atendente pode ver/chamar
  const senhasAguardando = senhas.filter(s => {
    if (s.status !== 'aguardando') return false;
    if (usuarioAtualObj?.tiposAtendimento && usuarioAtualObj.tiposAtendimento.length > 0) {
      return usuarioAtualObj.tiposAtendimento.includes(s.tipo);
    }
    return true; // Se não tiver restrição, vê tudo
  });

  const senhaAtual = senhas.find(s => s.status === 'atendendo' && s.guiche === guiche);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usuarioSelecionado) {
      const user = usuarios.find(u => u.id === usuarioSelecionado);
      if (user && user.guiche) {
        setGuiche(user.guiche);
      }
      setLogado(true);
    }
  };

  const handleChamarSenha = () => {
    if (!usuarioAtualObj) return;

    chamarSenha({
      guiche,
      atendente: usuarioAtualObj.nome,
      tiposPermitidos: usuarioAtualObj.tiposAtendimento
    });
  };

  const calcularTempoEspera = (horaGeracao: Date) => {
    const diff = Date.now() - new Date(horaGeracao).getTime();
    const minutos = Math.floor(diff / 60000);
    return minutos;
  };

  if (!logado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-gray-800 text-4xl mb-2">Atendente</h1>
            <p className="text-gray-600">Selecione seu usuário para acessar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Usuário</label>
              <select
                value={usuarioSelecionado}
                onChange={e => setUsuarioSelecionado(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-green-500 focus:outline-none bg-white"
                required
              >
                <option value="">Selecione...</option>
                {listaAtendentes.map(atendente => (
                  <option key={atendente.id} value={atendente.id}>
                    {atendente.nome} (Guichê {atendente.guiche || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Confirmar Guichê</label>
              <input
                type="number"
                value={guiche}
                onChange={e => setGuiche(Number(e.target.value))}
                min="1"
                max="20"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-green-500 focus:outline-none"
                required
              />
            </div>

            {usuarioSelecionado && (
              <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
                <strong>Atendimentos permitidos:</strong><br />
                {usuarios.find(u => u.id === usuarioSelecionado)?.tiposAtendimento?.join(', ') || 'Todos'}
              </div>
            )}

            <button
              type="submit"
              disabled={!usuarioSelecionado}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl transition-colors"
            >
              Entrar
            </button>
          </form>

          <button
            onClick={() => onNavigate('home')}
            className="w-full mt-4 text-gray-600 hover:text-gray-800 py-2 transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-900 p-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="text-white hover:bg-white/20 p-3 rounded-xl transition-colors"
        >
          <Home className="w-6 h-6" />
        </button>
        <div className="text-center flex-1">
          <h1 className="text-white text-4xl">Painel do Atendente</h1>
          <p className="text-green-100 mt-1">
            {usuarioAtualObj?.nome} - Guichê {guiche}
          </p>
        </div>
        <button
          onClick={() => setLogado(false)}
          className="text-white hover:bg-white/20 px-6 py-3 rounded-xl transition-colors"
        >
          Sair
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Área de Controle */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sticky top-6">
            <h2 className="text-gray-800 text-2xl mb-6">Controles</h2>

            {senhaAtual ? (
              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6">
                  <div className="text-green-600 mb-2">Em Atendimento</div>
                  <div className="text-4xl text-green-600 mb-2">{senhaAtual.numero}</div>
                  <div className="text-gray-700 text-xl mb-1">{senhaAtual.nome}</div>
                  <div className="text-gray-600">{senhaAtual.tipo}</div>
                  {senhaAtual.prioridade === 'prioritaria' && (
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full inline-block mt-3 text-sm">
                      PRIORITÁRIA
                    </div>
                  )}
                </div>
                <button
                  onClick={repetirSenha}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Volume2 className="w-5 h-5" />
                  Repetir Anúncio
                </button>
                <button
                  onClick={() => finalizarAtendimento(senhaAtual.id)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Finalizar Atendimento
                </button>

                <button
                  onClick={() => cancelarSenha(senhaAtual.id)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  Cancelar Senha
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6 mb-4 text-center">
                  <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <p className="text-gray-600">Nenhuma senha em atendimento</p>
                </div>

                <button
                  onClick={handleChamarSenha}
                  disabled={senhasAguardando.length === 0}
                  className={`w-full py-6 rounded-xl flex items-center justify-center gap-2 transition-colors ${senhasAguardando.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                >
                  <Phone className="w-6 h-6" />
                  <span className="text-xl">Chamar Próxima Senha</span>
                </button>
                {senhasAguardando.length === 0 && (
                  <p className="text-white text-center mt-3 text-sm">
                    Não há senhas aguardando
                  </p>
                )}
              </div>
            )}

            {/* Estatísticas */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-gray-700 mb-4">Estatísticas de Hoje</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-3xl text-green-600">
                    {senhas.filter(s => s.status === 'concluida').length}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">Concluídas</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-3xl text-blue-600">{senhasAguardando.length}</div>
                  <div className="text-gray-600 text-sm mt-1">Aguardando</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fila de Senhas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-gray-800 text-3xl mb-6">Fila de Atendimento</h2>

            {senhasAguardando.length > 0 ? (
              <div className="space-y-3">
                {senhasAguardando.map((senha, index) => (
                  <div
                    key={senha.id}
                    className={`p-6 rounded-2xl border-2 transition-all ${senha.prioridade === 'prioritaria'
                      ? 'bg-red-50 border-red-300'
                      : 'bg-gray-50 border-gray-200'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-3xl text-gray-800">{senha.numero}</div>
                          {senha.prioridade === 'prioritaria' && (
                            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                              🚨 PRIORITÁRIA
                            </div>
                          )}
                        </div>
                        <div className="text-gray-700 text-xl mb-1">{senha.nome}</div>
                        <div className="text-gray-600 mb-2">{senha.tipo}</div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>Aguardando há {calcularTempoEspera(senha.horaGeracao)} minutos</span>
                        </div>
                      </div>
                      <div className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                <p className="text-xl">Nenhuma senha aguardando atendimento</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
