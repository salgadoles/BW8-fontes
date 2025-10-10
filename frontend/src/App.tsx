import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { Upload, Download, Copy, Eye, Palette, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import './App.css';

// Interface para a estrutura de uma fonte
interface Font {
  name: string;
  displayName: string;
  cssUrl: string;
  // Adicione outras propriedades da fonte se necessário
}

// IMPORTANTE: Substitua pela URL do seu backend após o deploy no Vercel
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://bw-8-fontes.vercel.app/api'  // SUBSTITUA AQUI PELA SUA URL REAL DO VERCEL
  : 'http://localhost:3001/api';

function App( ) {
  const [fonts, setFonts] = useState<Font[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [fontFamily, setFontFamily] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('gallery');
  const [previewText, setPreviewText] = useState<string>('The quick brown fox jumps over the lazy dog');

  // Carregar fontes disponíveis
  useEffect(() => {
    fetchFonts();
  }, []);

  const fetchFonts = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Font[]>(`${API_BASE_URL}/fonts`);
      setFonts(response.data);
    } catch (error) {
      console.error('Erro ao carregar fontes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setUploadFiles(files);
    }
  };

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault(); // Previne o comportamento padrão do formulário

    if (!fontFamily || uploadFiles.length === 0) {
      alert('Por favor, preencha o nome da família e selecione os arquivos');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('fontFamily', fontFamily);
      
      uploadFiles.forEach(file => {
        formData.append('fonts', file);
      });

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert(`Sucesso! ${response.data.message}`);
      setFontFamily('');
      setUploadFiles([]);
      fetchFonts(); // Recarregar lista
    } catch (error: any) {
      console.error('Erro no upload:', error);
      alert(`Erro: ${error.response?.data?.error || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BW8 Fonts
                </h1>
                <p className="text-sm text-gray-600">Sistema de Fontes Corporativas</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                {fonts.length} fontes disponíveis
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            {[
              { id: 'gallery', label: 'Galeria', icon: Eye },
              { id: 'upload', label: 'Upload', icon: Upload },
              { id: 'preview', label: 'Preview', icon: Palette }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-6 py-2 rounded-md flex items-center space-x-2 transition-all ${
                  activeTab === id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'gallery' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">
                Explore Nossa Coleção de Fontes
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Descubra e utilize as fontes corporativas da BW8. Cada fonte está otimizada para web e pronta para uso.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : fonts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fonts.map((font, index) => (
                  <motion.div
                    key={font.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/70 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{font.displayName}</h3>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          {font.name}
                        </span>
                      </div>
                      
                      <div 
                        className="text-2xl font-normal"
                        style={{ fontFamily: font.displayName }}
                      >
                        {previewText}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => copyToClipboard(`<link rel="stylesheet" href="${font.cssUrl}">`)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm flex items-center justify-center space-x-1 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                          <span>CSS Link</span>
                        </button>
                        <button 
                          onClick={() => window.open(font.cssUrl, '_blank')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm flex items-center space-x-1 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Ver CSS</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nenhuma fonte encontrada
                </h3>
                <p className="text-gray-500">
                  Faça upload da primeira fonte para começar!
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'upload' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-8 shadow-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Adicionar Nova Família de Fontes
                </h2>
                <p className="text-gray-600">
                  Faça upload dos arquivos TTF ou OTF da sua família de fontes
                </p>
              </div>

              <form onSubmit={handleUpload} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Família da Fonte
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Roboto, Open Sans, Montserrat..."
                    value={fontFamily}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFontFamily(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arquivos de Fonte
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <input
                      type="file"
                      multiple
                      accept=".ttf,.otf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="fontFiles"
                    />
                    <label htmlFor="fontFiles" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700 font-medium">
                        Clique para selecionar arquivos
                      </span>
                      <span className="text-gray-500"> ou arraste e solte aqui</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      Formatos suportados: TTF, OTF (máx. 10MB por arquivo)
                    </p>
                  </div>
                </div>

                {uploadFiles.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arquivos Selecionados:
                    </label>
                    <div className="space-y-2">
                      {uploadFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading || !fontFamily || uploadFiles.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 px-6 rounded-md font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Fazer Upload</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === 'preview' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Teste suas Fontes</h2>
              <p className="text-gray-600 mb-4">
                Digite um texto para visualizar como fica com as diferentes fontes
              </p>
              <input
                type="text"
                placeholder="Digite seu texto aqui..."
                value={previewText}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPreviewText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>

            <div className="space-y-6">
              {fonts.map((font, index) => (
                <motion.div
                  key={font.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/70 backdrop-blur-sm rounded-lg p-6 shadow-lg"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {font.displayName}
                  </h3>
                  <div className="space-y-4">
                    <div 
                      className="text-3xl font-normal"
                      style={{ fontFamily: font.displayName }}
                    >
                      {previewText}
                    </div>
                    <div 
                      className="text-lg text-gray-600"
                      style={{ fontFamily: font.displayName }}
                    >
                      {previewText}
                    </div>
                    <div 
                      className="text-sm text-gray-500"
                      style={{ fontFamily: font.displayName }}
                    >
                      {previewText}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>© 2024 BW8 Fonts - Sistema de Fontes Corporativas</p>
            <p className="text-sm mt-2">Desenvolvido com ❤️ para facilitar o uso de fontes personalizadas</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
