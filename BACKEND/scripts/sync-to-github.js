const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const rootDir = path.join(__dirname, '..', '..');
const git = simpleGit(rootDir);

async function sync() {
  const token = process.env.GITHUB_TOKEN;
  if (!token || token === 'YOUR_GITHUB_TOKEN_HERE') {
    console.error('❌ Erro: GITHUB_TOKEN não configurado no .env');
    return;
  }

  try {
    console.log('🔄 Iniciando sincronização com GitHub...');
    
    // Configurar usuário se necessário
    await git.addConfig('user.name', 'BW8 Font System');
    await git.addConfig('user.email', 'bw8@digital.solutions');

    // Adicionar arquivos específicos
    await git.add([
      path.join(rootDir, 'fonts.json'),
      path.join(rootDir, 'CSS/*'),
      path.join(rootDir, 'FONTES/*')
    ]);

    const status = await git.status();
    if (status.staged.length === 0) {
      console.log('✨ Nada para sincronizar. Repositório já está atualizado.');
      return;
    }

    await git.commit('✨ Auto-update: Novas fontes adicionadas via BW8 Dashboard');
    
    // Configurar a URL remota com o token para autenticação
    const remote = await git.remote(['get-url', 'origin']);
    if (remote) {
      const authenticatedRemote = remote.replace('https://', `https://${token}@`);
      await git.push(authenticatedRemote, 'main');
    }

    console.log('✅ Sincronização concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na sincronização:', error.message);
  }
}

if (require.main === module) {
  sync();
}

module.exports = sync;
