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

O site inclui landing page (`index.html`), cadastro demonstrativo (`cadastro.html`), dashboard (`dashboard.html`), comunidade (`comunidade.html`) e uma página de recursos de apoio (`apoio.html`). No dashboard, é possível personalizar o Pomodoro, criar metas, registrar humor, sono e foco e consultar tendências pessoais dos últimos sete dias, sem avaliações ou diagnósticos. Também há um diário pessoal, opções para exportar os dados em JSON, restaurar um backup ou apagá-los, e lembretes de pausa opcionais.

Perfil, metas, sessões do Pomodoro, registros diários, textos do diário, preferências de lembretes e grupos salvos usam o armazenamento local do navegador; não há autenticação real nem sincronização com servidor. A restauração substitui os dados atuais do aplicativo neste navegador. O diário pessoal não é monitorado; seus registros podem ser apagados individualmente, e em dispositivos compartilhados outras pessoas com acesso ao navegador podem lê-los. A página de apoio reúne recursos externos no Brasil, como CVV, SUS/CAPS e SAMU; o site não oferece atendimento psicológico, diagnóstico ou serviço de emergência.

O site pode ser instalado como PWA em navegadores compatíveis. Após a primeira visita e a ativação do modo offline, a página inicial, cadastro, dashboard, comunidade, apoio e arquivos principais ficam disponíveis offline. Os lembretes funcionam enquanto o dashboard está aberto; notificações em segundo plano não são garantidas. O app informa quando o dispositivo fica sem conexão.

As páginas incluem navegação por teclado, links para pular ao conteúdo, foco visível e suporte à preferência de movimento reduzido. A página inicial usa descrições dos recursos, não números fictícios de foco, sono ou progresso.

### App Android
1. Abra no Android Studio
2. Aguarde sincronizar Gradle
3. Execute o app em um emulador ou dispositivo Android

## Observações
Este repositório foi inicializado com a base do MVP para facilitar o desenvolvimento do protótipo e também foi adaptado para uma versão em site.
