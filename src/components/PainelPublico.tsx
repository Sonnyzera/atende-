import React, { useEffect, useState } from 'react';
import { Volume2, Home, Clock } from 'lucide-react';
import { useSenhas } from '../context/SenhasContext';
import type { Screen } from '../App';

interface PainelPublicoProps {
  onNavigate: (screen: Screen) => void;
}

export default function PainelPublico({ onNavigate }: PainelPublicoProps) {
  const { senhaAtual, ultimasSenhas } = useSenhas();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatarHora = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatarData = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const announceTicket = (ticket: typeof senhaAtual) => {
    if (!ticket) return;

    if ('speechSynthesis' in window) {
      const text = `Senha ${ticket.numero}, ${ticket.nome}, Guichê ${ticket.guiche}`;
      const utterance = new SpeechSynthesisUtterance(text);

      // Configurar idioma para português do Brasil
      utterance.lang = 'pt-BR';

      // Tentar encontrar uma voz em português
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find(voice => voice.lang.includes('pt-BR'));
      if (ptVoice) {
        utterance.voice = ptVoice;
      }

      window.speechSynthesis.cancel(); // Cancelar fala anterior
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (senhaAtual && senhaAtual.status === 'chamada') {
      announceTicket(senhaAtual);
    }
  }, [senhaAtual]);

  const repetirAnuncio = () => {
    if (senhaAtual) {
      announceTicket(senhaAtual);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-8">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-8 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="text-white hover:bg-white/20 p-3 rounded-xl transition-colors"
        >
          <Home className="w-8 h-8" />
        </button>
        <div className="text-center flex-1">
          <h1 className="text-white text-5xl">Atende+ | Painel Público</h1>
          <p className="text-blue-100 mt-2">Prefeitura Municipal - Bolsa Familía</p>
        </div>
        <div className="text-right text-white">
          <div className="flex items-center gap-2 justify-end">
            <Clock className="w-6 h-6" />
            <div className="text-3xl">{formatarHora(currentTime)}</div>
          </div>
          <div className="text-blue-100 mt-1">{formatarData(currentTime)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Área Principal - Senha Atual */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-2xl p-12 min-h-[600px] flex flex-col">
            {senhaAtual && senhaAtual.status === 'chamada' ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                {senhaAtual.prioridade === 'prioritaria' && (
                  <div className="bg-red-500 text-white px-8 py-3 rounded-full mb-6 inline-block animate-pulse">
                    <span className="uppercase tracking-wide">🚨 PRIORITÁRIA</span>
                  </div>
                )}

                <div className="mb-8">
                  <div className="text-gray-600 text-3xl mb-4">Senha Chamada</div>
                  <div className="text-blue-600 text-[180px] leading-none mb-4">
                    {senhaAtual.numero}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8 w-full max-w-2xl mb-8">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <div className="text-gray-500 text-xl mb-2">Cidadão</div>
                      <div className="text-gray-900 text-4xl">{senhaAtual.nome}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xl mb-2">Tipo de Atendimento</div>
                      <div className="text-gray-900 text-3xl">{senhaAtual.tipo}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xl mb-2">Guichê</div>
                      <div className="bg-green-500 text-white text-6xl rounded-2xl py-4 inline-block px-8">
                        {senhaAtual.guiche}
                      </div>
                    </div>
                  </div>
                </div>


              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="text-gray-300 mb-6">
                  <Volume2 className="w-32 h-32 mx-auto" />
                </div>
                <div className="text-gray-400 text-4xl">Aguardando chamado...</div>
                <div className="text-gray-300 text-2xl mt-4">
                  As senhas serão exibidas aqui
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Área Lateral - Últimas Senhas */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-gray-800 text-3xl mb-6">Últimas Chamadas</h2>

            {ultimasSenhas.length > 0 ? (
              <div className="space-y-4">
                {ultimasSenhas.map((senha, index) => (
                  <div
                    key={senha.id}
                    className={`p-6 rounded-2xl border-2 ${index === 0
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-gray-50 border-gray-200'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl text-blue-600">
                        {senha.numero}
                      </div>
                      {senha.prioridade === 'prioritaria' && (
                        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                          PRIORITÁRIA
                        </div>
                      )}
                    </div>
                    <div className="text-gray-700 text-xl mb-2">{senha.nome}</div>
                    <div className="text-gray-500 mb-2">{senha.tipo}</div>
                    <div className="flex items-center justify-between">
                      <div className="bg-green-500 text-white px-4 py-2 rounded-lg">
                        Guichê {senha.guiche}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {senha.horaChamada && formatarHora(senha.horaChamada)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-12 text-xl">
                Nenhuma senha chamada ainda
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}