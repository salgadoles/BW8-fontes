import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { Upload, Download, Copy, Eye, Palette, Zap, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Interface para a estrutura de uma fonte
interface Font {
  id: string;
  family: string;
  displayName: string;
  cssUrl: string;
}

// IMPORTANTE: Ajustado para o novo backend
// Configuração dinâmica da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api' 
    : 'https://seu-backend-no-render.onrender.com/api'); // Depois trocamos pela URL real do Render

function App() {
  const [fonts, setFonts] = useState<Font[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [fontFamily, setFontFamily] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('gallery');
  const [previewText, setPreviewText] = useState<string>('vote salgadoles para CEO');
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro', mensagem: string } | null>(null);

  const mostrarNotificacao = useCallback((tipo: 'sucesso' | 'erro', mensagem: string) => {
    setNotificacao({ tipo, mensagem });
    setTimeout(() => setNotificacao(null), 5000);
  }, []);

  const fetchFonts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<Font[]>(`${API_BASE_URL}/fonts`);
      setFonts(response.data);
    } catch (error) {
      console.error('Erro ao carregar fontes:', error);
      mostrarNotificacao('erro', 'Não foi possível carregar as fontes do servidor.');
    } finally {
      setLoading(false);
    }
  }, [mostrarNotificacao]);

  // Carregar fontes disponíveis
  useEffect(() => {
    fetchFonts();
  }, [fetchFonts]);

  // Injetar links de CSS dinamicamente para que as fontes funcionem no preview
  useEffect(() => {
    fonts.forEach((font: Font) => {
      const linkId = `font-link-${font.id}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = font.cssUrl;
        document.head.appendChild(link);
      }
    });

    return () => {
      // Opcional: remover os links ao desmontar ou quando as fontes mudarem
    };
  }, [fonts]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setUploadFiles(files);
    }
  };

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();

    if (!fontFamily || uploadFiles.length === 0) {
      mostrarNotificacao('erro', 'Por favor, preencha o nome da família e selecione os arquivos.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('fontFamily', fontFamily);
      
      uploadFiles.forEach(file => {
        formData.append('fonts', file);
      });

      await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      mostrarNotificacao('sucesso', 'Fonte enviada e processada com sucesso!');
      setFontFamily('');
      setUploadFiles([]);
      fetchFonts();
    } catch (error: any) {
      console.error('Erro no upload:', error);
      mostrarNotificacao('erro', error.response?.data?.error || 'Erro ao processar as fontes.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    mostrarNotificacao('sucesso', 'Código copiado para a área de transferência!');
  };

  return (
    <div className="min-h-screen relative">
      <div className="bg-mesh" />
      {/* Notificações flutuantes */}
      <AnimatePresence>
        {notificacao && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className={`fixed top-24 right-4 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3 ${
              notificacao.tipo === 'sucesso' ? 'bg-[#61CE18] text-black' : 'bg-red-500 text-white'
            }`}
          >
            {notificacao.tipo === 'sucesso' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{notificacao.mensagem}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header BW8 */}
      <header className="glass sticky top-0 z-50" style={{ borderBottom: 'none' }}>
        {/* Linha estilosa no fundo do header */}
        <div className="stylish-line" />
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="h-10 flex items-center justify-center transform hover:scale-105 transition-transform">
                <img src={`${process.env.PUBLIC_URL}/logo-bw8-topo2.png`} alt="BW8 Logo" className="h-full w-auto object-contain drop-shadow-md" />
              </div>
              <div className="stylish-line-v" />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--bw8-text-muted)' }}>Sistema de Fontes</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center space-x-2"
            >
              <div className="badge-green px-4 py-1.5 rounded-full text-sm font-semibold flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                {fonts.length} Fontes Ativas
              </div>
            </motion.div>
          </div>
        </div>
        <div className="stylish-line" />
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="flex justify-center mb-16">
          <div className="glass p-1.5 rounded-full flex space-x-1">
            {[
              { id: 'gallery', label: 'Galeria', icon: Eye },
              { id: 'upload', label: 'Adicionar', icon: Upload },
              { id: 'preview', label: 'Laboratório', icon: Palette }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-8 py-3 rounded-full flex items-center space-x-3 transition-all duration-300 font-bold ${
                  activeTab === id
                    ? 'bg-[#61CE18] text-black shadow-lg scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Galeria */}
        {activeTab === 'gallery' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Identidade Visual em <span className="text-[#61CE18]">Cada Caractere</span>
              </h2>
              <p className="text-lg text-gray-400">
                Explore a biblioteca oficial de fontes da BW8. Arquivos otimizados para performance e legibilidade em todas as plataformas digitais.
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-16 h-16 border-4 border-white/10 border-t-[#61CE18] rounded-full animate-spin"></div>
                <p className="font-bold text-[#61CE18] animate-pulse">Sincronizando biblioteca...</p>
              </div>
            ) : fonts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {fonts.map((font: Font, index: number) => (
                  <motion.div
                    key={font.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass border-white/10 rounded-[2rem] p-8 shadow-xl hover:shadow-[#61CE18]/10 transition-all duration-500 group"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="text-xl font-black text-white">{font.displayName}</h3>
                          <p className="text-xs font-mono text-gray-500">ID: {font.id}</p>
                        </div>
                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-[#61CE18]/10 transition-colors">
                          <Eye className="w-5 h-5 text-gray-400 group-hover:text-[#61CE18]" />
                        </div>
                      </div>
                      
                      <div 
                        className="py-8 border-y border-white/5 overflow-hidden"
                      >
                        <p 
                          className="text-4xl whitespace-nowrap"
                          style={{ fontFamily: font.family }}
                        >
                          {previewText.length > 20 ? previewText.substring(0, 20) + '...' : previewText}
                        </p>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => copyToClipboard(`<link rel="stylesheet" href="${font.cssUrl}">`)}
                          className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold px-4 py-3 rounded-full border border-white/10 flex items-center justify-center space-x-2 transition-all active:scale-95"
                          title="Copiar link do CSS"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Link CSS</span>
                        </button>
                        <button 
                          onClick={() => window.location.href = `${API_BASE_URL}/download/${font.id}`}
                          className="flex-1 bg-[#61CE18] hover:bg-[#55b814] text-black font-bold px-4 py-3 rounded-full flex items-center justify-center space-x-2 transition-all active:scale-95"
                          title="Baixar arquivos da fonte (.zip)"
                        >
                          <Download className="w-4 h-4" />
                          <span>Baixar</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="glass rounded-3xl p-16 text-center shadow-xl border-dashed border-2 border-gray-200"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Palette className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">
                  Biblioteca Vazia
                </h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                  Ainda não temos fontes registradas. Que tal adicionar a primeira para começar o projeto?
                </p>
                <button 
                  onClick={() => setActiveTab('upload')}
                  className="premium-gradient text-black px-8 py-3 rounded-full font-bold shadow-lg hover:opacity-90 transition-all"
                >
                  Fazer Primeiro Upload
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Upload */}
        {activeTab === 'upload' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="glass rounded-[2rem] p-10 border-white/10">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-[#61CE18]/10 border border-[#61CE18]/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-10 h-10 text-[#61CE18]" />
                </div>
                <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
                  Nova Família de Fontes
                </h2>
                <p className="text-gray-400 font-medium">
                  Publique ativos de tipografia corporativa no sistema central da BW8
                </p>
              </div>

              <form onSubmit={handleUpload} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-sm font-black text-[#61CE18] uppercase tracking-widest ml-1">
                    Nome da Família
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Montserrat, Open Sans..."
                    value={fontFamily}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFontFamily(e.target.value)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-full focus:ring-4 focus:ring-[#61CE18]/10 focus:border-[#61CE18] transition-all outline-none font-medium text-lg text-white"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-[#61CE18] uppercase tracking-widest ml-1">
                    Arquivos (TTF/OTF)
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      multiple
                      accept=".ttf,.otf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="fontFiles"
                    />
                    <div className="border-3 border-dashed border-white/10 rounded-[2rem] p-12 text-center group-hover:border-[#61CE18]/50 group-hover:bg-[#61CE18]/5 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
                        <Upload className="w-8 h-8 text-white/20 group-hover:text-[#61CE18]" />
                      </div>
                      <p className="text-xl font-bold text-white mb-1">
                        Selecione os arquivos
                      </p>
                      <p className="text-gray-500">ou arraste para esta área</p>
                    </div>
                  </div>
                </div>

                {uploadFiles.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                  >
                    <label className="text-sm font-black text-gray-700 uppercase tracking-widest ml-1">
                      Arquivos Selecionados ({uploadFiles.length})
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {uploadFiles.map((file: File, index: number) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-full border border-white/10">
                          <div className="w-8 h-8 bg-[#61CE18]/10 rounded-full flex items-center justify-center text-[#61CE18]">
                            <Check className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{file.name}</p>
                            <p className="text-[10px] font-mono text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <button 
                  type="submit"
                  disabled={loading || !fontFamily || uploadFiles.length === 0}
                  className="w-full bg-[#61CE18] hover:bg-[#55b814] disabled:opacity-40 text-black py-5 px-8 rounded-full font-black text-lg transition-all transform active:scale-[0.98] flex items-center justify-center space-x-4"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-black/30 border-t-black rounded-full animate-spin"></div>
                      <span>Processando Tipografia...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6" />
                      <span>Publicar na Biblioteca</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Preview / Lab */}
        {activeTab === 'preview' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="glass rounded-3xl p-10 shadow-2xl border-white/60">
              <h2 className="text-3xl font-black text-white mb-6 flex items-center">
                <Palette className="w-8 h-8 mr-4 text-[#61CE18]" />
                Laboratório de Estilo
              </h2>
              <div className="space-y-4">
                <p className="text-gray-400 font-medium">Digite o conteúdo para visualizar a renderização em tempo real:</p>
                <textarea
                  placeholder="Seu texto de rascunho..."
                  value={previewText}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPreviewText(e.target.value)}
                  className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-[2rem] focus:ring-4 focus:ring-[#61CE18]/10 focus:border-[#61CE18] transition-all outline-none font-medium text-2xl h-40 resize-none text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {fonts.map((font: Font, index: number) => (
                <motion.div
                  key={font.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-3xl p-12 shadow-xl hover:shadow-2xl transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center space-x-4">
                        <span className="bg-[#61CE18] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                          Font-Family
                        </span>
                        <h3 className="text-2xl font-black text-white">
                          {font.displayName}
                        </h3>
                      </div>
                      <div className="space-y-8 mt-12 bg-white/5 p-8 rounded-[2rem]">
                        <div 
                          className="text-6xl font-normal leading-tight"
                          style={{ fontFamily: font.family }}
                        >
                          {previewText}
                        </div>
                        <div 
                          className="text-2xl text-gray-400 italic leading-relaxed"
                          style={{ fontFamily: font.family }}
                        >
                          {previewText}
                        </div>
                        <div 
                          className="text-base text-gray-500 font-medium"
                          style={{ fontFamily: font.family }}
                        >
                          {previewText}
                        </div>
                      </div>
                    </div>
                    
                    
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer BW8 */}
      <footer className="mt-24 py-14 bg-black/60" style={{ borderTop: 'none' }}>
        <div className="stylish-line mb-12" />
        <div className="container mx-auto px-6 text-center">
          <div className="flex flex-col items-center gap-5 mb-6">
            <img
              src={`${process.env.PUBLIC_URL}/logo-bw8-topo2.png`}
              alt="BW8"
              className="h-8 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
            <div className="stylish-line-sm" />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--bw8-text-muted)' }}>
            © {new Date().getFullYear()} BW8 Digital Solutions. Todos os direitos reservados.
          </p>
          <p className="text-[10px] uppercase tracking-widest mt-2 font-black" style={{ color: 'var(--bw8-text-muted)' }}>
            Performance • Brand • Tech
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
