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

O site inclui landing page (`index.html`), cadastro demonstrativo (`cadastro.html`), dashboard (`dashboard.html`) e comunidade (`comunidade.html`). Cadastro, metas, sessões do Pomodoro, registros diários, textos do diário pessoal e grupos salvos usam o armazenamento local do navegador; não há autenticação real nem sincronização com servidor. O diário pessoal não é monitorado; em dispositivos compartilhados, outras pessoas com acesso ao navegador podem ler os registros.

### App Android
1. Abra no Android Studio
2. Aguarde sincronizar Gradle
3. Execute o app em um emulador ou dispositivo Android

## Observações
Este repositório foi inicializado com a base do MVP para facilitar o desenvolvimento do protótipo e também foi adaptado para uma versão em site.
