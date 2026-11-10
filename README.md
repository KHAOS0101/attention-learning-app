# Attention Learning App

Aplicativo de psicologia aplicada à aprendizagem e ao bem-estar estudantil, com ferramentas de autoconhecimento sobre atenção, emoções e hábitos de estudo. O protótipo oferece apoio educativo e não substitui avaliação, diagnóstico ou acompanhamento psicológico profissional.

## Stack
- Kotlin
- Jetpack Compose
- MVVM
- Material 3
- Room (estrutura preparada)
- Firebase (preparado para autenticação e dados em nuvem)

## Funcionalidades do MVP
- Temporizador Pomodoro
- Registro diário
- Acompanhamento de sono, foco, estresse e telas
- Estratégias de memória
- Lembretes de pausas ativas
- Registro de atividade física
- Conexão entre estudantes do campus
- Encontrar pessoas com hobbies em comum
- Grupos de estudo e aulas em grupo
- Painel de evolução

## Estrutura principal
- `app/` — módulo Android principal
- `app/src/main/java/com/attentionlearning/` — código da aplicação
- `app/src/main/res/` — recursos do app

## Como rodar

### Site web
Site público: https://khaos0101.github.io/attention-learning-app/

1. Execute `open-site.bat`; o atalho inicia o servidor local do Windows e abre o navegador.
2. Se preferir, execute `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\serve-site.ps1` na raiz do projeto e acesse `http://127.0.0.1:8000`.
3. Encerre o servidor com `Ctrl+C` na janela do PowerShell.

O site inclui landing page (`index.html`), cadastro demonstrativo (`cadastro.html`), dashboard (`dashboard.html`), comunidade (`comunidade.html`) e uma página de recursos de apoio (`apoio.html`). No dashboard, é possível personalizar o Pomodoro, criar metas e tarefas por dia, planejar a semana, registrar humor, sono e foco e consultar gráficos e tendências pessoais dos últimos sete dias, sem avaliações ou diagnósticos. Também há diário pessoal, busca por recursos, guia inicial, temas claro/escuro/alto contraste, tamanho de texto ajustável, backups JSON e lembretes de pausa opcionais.

Perfil, metas, tarefas planejadas, sessões do Pomodoro, registros diários, textos do diário, preferências e grupos salvos usam o armazenamento local do navegador; não há autenticação nem sincronização com servidor. Os dados locais não são criptografados pelo app e podem ser acessados por outras pessoas com acesso ao mesmo perfil do navegador. A restauração substitui os dados atuais do aplicativo neste navegador. Para oferecer sincronização segura seria necessário desenvolver e revisar um backend com autenticação e proteção de dados; esse recurso não está implementado. A página de apoio reúne recursos externos no Brasil, como CVV, SUS/CAPS e SAMU; o site não oferece atendimento psicológico, diagnóstico ou serviço de emergência.

O site pode ser instalado como PWA em navegadores compatíveis. Após a primeira visita e a ativação do modo offline, a página inicial, cadastro, dashboard, comunidade, apoio e arquivos principais ficam disponíveis offline. Os lembretes funcionam enquanto o dashboard está aberto; notificações em segundo plano não são garantidas. O app informa quando o dispositivo fica sem conexão.

As páginas incluem navegação por teclado, links para pular ao conteúdo, foco visível e suporte à preferência de movimento reduzido. Os gráficos são acompanhados por descrições textuais e distinguem dias sem registro. A página inicial usa descrições dos recursos, não números fictícios de foco, sono ou progresso.

### Testes do site
Os testes de regressão da validação de backups e do histórico de metas usam o test runner nativo do Node.js. Execute `node --test tests/*.test.cjs`; o workflow do GitHub Actions roda esses testes antes de publicar o site.

### App Android
1. Abra no Android Studio
2. Aguarde sincronizar Gradle
3. Execute o app em um emulador ou dispositivo Android

## Observações
Este repositório foi inicializado com a base do MVP para facilitar o desenvolvimento do protótipo e também foi adaptado para uma versão em site.
