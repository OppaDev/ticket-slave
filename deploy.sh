#!/bin/bash

# =============================================================================
# TICKET SLAVE - DEPLOYMENT SCRIPT
# =============================================================================
# Este script despliega todo el sistema Ticket Slave usando Docker Compose
# Solo expone el frontend en el puerto 709 para acceso externo
# =============================================================================

echo "🚀 Iniciando despliegue de Ticket Slave..."
echo "==============================================="

# Verificar que Docker esté ejecutándose
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está ejecutándose. Por favor, inicia Docker."
    exit 1
fi

# Verificar que Docker Compose esté disponible
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado."
    exit 1
fi

# Crear directorio de logs si no existe
mkdir -p logs

echo "📦 Construyendo imágenes Docker..."
docker-compose -f docker-compose.production.yml build

if [ $? -ne 0 ]; then
    echo "❌ Error al construir las imágenes Docker"
    exit 1
fi

echo "🔧 Iniciando servicios de infraestructura..."
docker-compose -f docker-compose.production.yml up -d cockroach1 cockroach2 cockroach3 rabbitmq

echo "⏳ Esperando a que la infraestructura esté lista..."
sleep 30

echo "🗄️ Inicializando cluster CockroachDB y creando bases de datos..."
docker-compose -f docker-compose.production.yml up -d roach-init database-setup

echo "⏳ Esperando a que las bases de datos estén listas..."
sleep 20

echo "🚀 Iniciando microservicios..."
docker-compose -f docker-compose.production.yml up -d ms-usuarios ms-eventos ms-tickets ms-notifications

echo "⏳ Esperando a que los microservicios estén listos..."
sleep 30

echo "🌐 Iniciando Kong API Gateway..."
docker-compose -f docker-compose.production.yml up -d kong

echo "⏳ Esperando a que Kong esté listo..."
sleep 15

echo "🎨 Iniciando Frontend (Puerto 709)..."
docker-compose -f docker-compose.production.yml up -d frontend

echo "⏳ Verificando que todos los servicios estén corriendo..."
sleep 10

# Verificar estado de los servicios
echo ""
echo "📊 Estado de los servicios:"
echo "=================================="
docker-compose -f docker-compose.production.yml ps

echo ""
echo "✅ Despliegue completado!"
echo "=================================="
echo "🌐 Frontend disponible en: http://localhost:709"
echo "🔧 Kong Admin GUI: http://localhost:8002"
echo "🐰 RabbitMQ Management: http://localhost:15672 (admin/password)"
echo "🗄️ CockroachDB UI: http://localhost:8080"
echo ""
echo "📋 Comandos útiles:"
echo "  Ver logs: docker-compose -f docker-compose.production.yml logs -f [service]"
echo "  Parar todo: docker-compose -f docker-compose.production.yml down"
echo "  Reiniciar servicio: docker-compose -f docker-compose.production.yml restart [service]"
echo ""
echo "🎯 Solo el puerto 709 está expuesto externamente"
echo "   Todos los microservicios se comunican internamente a través de Kong Gateway"