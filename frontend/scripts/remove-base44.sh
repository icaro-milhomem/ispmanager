#!/bin/bash

# Script para remover completamente a dependência do base44Client.js
# Isso garante que apenas a API real seja usada, sem fallbacks

echo "🔧 Iniciando a remoção completa do base44Client..."

# Diretório base do projeto
BASE_DIR="/home/icaro/isp-manager"
FRONTEND_DIR="$BASE_DIR/frontend"
API_DIR="$FRONTEND_DIR/src/api"
BASE44_FILE="$API_DIR/base44Client.js"
API_CLIENT_FILE="$API_DIR/apiClient.js"
ENTITIES_FILE="$API_DIR/entities.js"

# 1. Fazer backup dos arquivos importantes
echo "📁 Criando backups dos arquivos originais..."
mkdir -p "$FRONTEND_DIR/backups"
cp "$BASE44_FILE" "$FRONTEND_DIR/backups/base44Client.js.bak"
cp "$API_CLIENT_FILE" "$FRONTEND_DIR/backups/apiClient.js.bak"
cp "$ENTITIES_FILE" "$FRONTEND_DIR/backups/entities.js.bak"

# 2. Remover importações do base44 em arquivos
echo "🔍 Procurando e removendo importações do base44Client..."
grep -l "import.*base44" $(find "$FRONTEND_DIR/src" -type f -name "*.js" -o -name "*.jsx") | while read file; do
  echo "   Modificando: $file"
  # Fazer backup do arquivo
  cp "$file" "$file.bak"
  # Remover linhas que importam o base44Client
  sed -i '/import.*base44/d' "$file"
  # Remover linhas que usam o base44 como fallback
  sed -i '/base44\./d' "$file"
done

# 3. Modificar o apiClient.js para não usar o base44 como fallback
echo "✏️ Modificando apiClient.js para remover qualquer referência ao base44..."
# Procurar e remover trechos que tentam usar o base44 como fallback
sed -i '/base44/d' "$API_CLIENT_FILE"
sed -i '/fallback/d' "$API_CLIENT_FILE"

# 4. Modificar classes de serviço para usar apenas a API real
echo "✏️ Garantindo que as classes de serviço usem apenas a API real..."
# Remover qualquer código que tenta usar base44 como fallback
sed -i '/try {/,/} catch (error) {/s/.*base44.*//g' $(find "$API_DIR" -type f -name "*.js")

# 5. Renomear o base44Client.js para .disabled para desativá-lo completamente
echo "🚫 Desativando completamente o base44Client.js..."
mv "$BASE44_FILE" "$BASE44_FILE.disabled"

# 6. Criar arquivo .env.local para garantir que a API real seja usada
echo "🔧 Criando arquivo .env.local para configurar o uso apenas da API real..."
cat > "$FRONTEND_DIR/.env.local" << EOF
# Configurações para garantir o uso apenas da API real
VITE_USE_REAL_API_ONLY=true
VITE_DISABLE_FALLBACKS=true
EOF

echo "✅ Remoção do base44 concluída com sucesso!"
echo "📝 Backups dos arquivos originais foram salvos em $FRONTEND_DIR/backups/"
echo "🔄 Reinicie o servidor de desenvolvimento para aplicar as alterações."

echo "Script para remover configurações antigas e limpar o cache"

# Abra esta URL no navegador
echo -e "\nPor favor, execute o seguinte no console do navegador (F12 > Console):\n"

cat << 'EOF'
// Limpar configurações antigas
localStorage.removeItem('system_config');
console.log("Configurações antigas removidas do localStorage!");

// Recarregar a página para aplicar as novas alterações
location.reload(true);

// Instruções após recarregar
console.log("Página recarregada! Agora tente carregar uma nova imagem e salvar as configurações.");
EOF

echo -e "\n\nExecute este script e depois recarregue a página no navegador em http://localhost:4175/" 