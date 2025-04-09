#!/bin/bash

# Script para remover entidades relacionadas ao monitoramento de combustível do base44Client.js
# Isso evita o uso de dados simulados para essas entidades

TARGET_FILE="/home/icaro/isp-manager/frontend/src/api/base44Client.js"

echo "Modificando $TARGET_FILE para remover fallbacks de monitoramento de combustível..."

# Fazer backup do arquivo
cp "$TARGET_FILE" "$TARGET_FILE.bak"

# Adicionar comentários explicativos no início do arquivo
sed -i '3i // As entidades Vehicle, FuelRefill, MileageLog e Driver foram desativadas do fallback' "$TARGET_FILE"
sed -i '4i // para garantir que apenas dados reais sejam usados no módulo de monitoramento de combustível' "$TARGET_FILE"

# Remover as entidades relacionadas do objeto entities (substituir por comentários)
sed -i 's/Vehicle: createEntityService(.Vehicle.),/\/\/ Vehicle: createEntityService("Vehicle"), \/\/ Removido para evitar uso de dados simulados/g' "$TARGET_FILE"
sed -i 's/FuelRefill: createEntityService(.FuelRefill.),/\/\/ FuelRefill: createEntityService("FuelRefill"), \/\/ Removido para evitar uso de dados simulados/g' "$TARGET_FILE"
sed -i 's/MileageLog: createEntityService(.MileageLog.),/\/\/ MileageLog: createEntityService("MileageLog"), \/\/ Removido para evitar uso de dados simulados/g' "$TARGET_FILE"
sed -i 's/Driver: createEntityService(.Driver.),/\/\/ Driver: createEntityService("Driver"), \/\/ Removido para evitar uso de dados simulados/g' "$TARGET_FILE"

echo "Modificações concluídas com sucesso!"
echo "Backup salvo em $TARGET_FILE.bak" 