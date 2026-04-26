#!/bin/bash
# ============================================
# HUERTIS - Script de Despliegue Automatizado
# Servidor: 54.246.169.223
# ============================================

set -e

# === CONFIGURACIÓN ===
SERVER_IP="54.246.169.223"
SSH_PORT="55000"
SSH_KEY="/home/sergio/Descargas/uoc.edu558151116b8a25e58a2672b254febfbebac0458b.pem"
APP_USER="ubuntu"
APP_DIR="/home/ubuntu/huertis"

# Credenciales BD
DB_NAME="huertis"
DB_USER="huertis"
DB_PASS="HuertisDev2026!"

API_PORT=3000

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Verificar que la clave existe
if [ ! -f "$SSH_KEY" ]; then
    error "No se encuentra la clave SSH: $SSH_KEY"
fi

# Dar permisos correctos a la clave
chmod 400 "$SSH_KEY"

# ============================================
# PASO 1: Preparación del Servidor
# ============================================
prepare_server() {
    log "1. Preparando servidor..."
    
    ssh -p $SSH_PORT -i $SSH_KEY $APP_USER@$SERVER_IP << 'ENDSSH'
        set -e
        
        echo "1.1 Actualizando sistema..."
        sudo apt update && sudo apt upgrade -y
        
        echo "1.2 Instalando Node.js 20.x..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt install -y nodejs
        node --version
        
        echo "1.3 Instalando PostgreSQL..."
        sudo apt install -y postgresql postgresql-contrib
        sudo systemctl enable postgresql
        sudo systemctl start postgresql
        
        echo "1.4 Instalando Nginx..."
        sudo apt install -y nginx
        
        echo "1.5 Instalando PM2..."
        sudo npm install -g pm2
        
        echo "1.6 Configurando PostgreSQL..."
        sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || echo "Usuario DB ya existe"
        sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || echo "DB ya existe"
        
        echo "1.7 Configurando Firewall..."
        sudo ufw allow 22/tcp
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
        sudo ufw --force enable
        
        echo "Preparación completada!"
ENDSSH
}

# ============================================
# PASO 2: Subir Código
# ============================================
upload_code() {
    log "2. Subiendo código al servidor..."
    
    # Crear directorio
    ssh -p $SSH_PORT -i $SSH_KEY $APP_USER@$SERVER_IP "mkdir -p $APP_DIR"
    
    # Subir código con rsync (excluye node_modules, dist, build)
    rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude 'build' --exclude '.git' \
        -e "ssh -p $SSH_PORT -i $SSH_KEY" \
        ./App-Back $APP_USER@$SERVER_IP:$APP_DIR/
    
    rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude 'build' --exclude '.git' \
        -e "ssh -p $SSH_PORT -i $SSH_KEY" \
        ./APP-Front $APP_USER@$SERVER_IP:$APP_DIR/
        
    log "Código subido correctamente"
}

# ============================================
# PASO 3: Build Backend
# ============================================
build_backend() {
    log "3. Compilando Backend..."
    
    ssh -p $SSH_PORT -i $SSH_KEY $APP_USER@$SERVER_IP << 'ENDSSH'
        set -e
        cd $APP_DIR/App-Back
        
        echo "3.1 Instalando dependencias..."
        npm install
        
        echo "3.2 Compilando TypeScript..."
        npm run build
        
        echo "3.3 Creando .env..."
        cat > .env << 'EOF'
PORT=3000
DATABASE_URL=postgresql://huertis:HuertisDev2026!@localhost:5432/huertis
NODE_ENV=production
EOF
        
        echo "Backend compilado!"
ENDSSH
}

# ============================================
# PASO 4: Build Frontend
# ============================================
build_frontend() {
    log "4. Compilando Frontend..."
    
    ssh -p $SSH_PORT -i $SSH_KEY $APP_USER@$SERVER_IP << 'ENDSSH'
        set -e
        cd $APP_DIR/APP-Front/app-front
        
        echo "4.1 Instalando dependencias..."
        npm install
        
        echo "4.2 Configurando API URL para producción..."
        cat > src/environments/environment.prod.ts << 'EOF'
export const environment = {
  production: true,
  apiUrl: 'http://54.246.169.223:3000',
  appName: 'Huerta Gestor',
  version: '1.0.0'
};
EOF
        
        echo "4.3 Compilando Angular..."
        npm run build -- --configuration=production
        
        echo "Frontend compilado!"
ENDSSH
}

# ============================================
# PASO 5: Crear BD
# ============================================
setup_database() {
    log "5. Configurando Base de Datos..."
    
    ssh -p $SSH_PORT -i $SSH_KEY $APP_USER@$SERVER_IP << 'ENDSSH'
        set -e
        cd $APP_DIR/App-Back/src/db
        
        echo "5.1 Creando tablas..."
        PGPASSWORD=HuertisDev2026! psql -h localhost -U huertis -d huertis -f tables/tables.sql
        PGPASSWORD=HuertisDev2026! psql -h localhost -U huertis -d huertis -f tables/seed_initial_roles.sql
        
        echo "5.2 Ejecutando migraciones adicionales..."
        PGPASSWORD=HuertisDev2026! psql -h localhost -U huertis -d huertis -f fix_task_category_constraint.sql 2>/dev/null || true
        
        echo "5.3 Ejecutando seeds (cultivos)..."
        cd $APP_DIR/App-Back
        npm run seed:crops || echo "Seed de cultivos completado"
        
        echo "Base de datos configurada!"
ENDSSH
}

# ============================================
# PASO 6: Configurar Nginx
# ============================================
configure_nginx() {
    log "6. Configurando Nginx..."
    
    ssh -p $SSH_PORT -i $SSH_KEY $APP_USER@$SERVER_IP << 'ENDSSH'
        set -e
        
        FRONTEND_DIR="$APP_DIR/APP-Front/app-front/dist/app-front/browser"
        
        echo "6.1 Creando configuración Nginx..."
        sudo tee /etc/nginx/sites-available/huertis > /dev/null << 'NGINX'
server {
    listen 80;
    server_name 54.246.169.223;

    # Frontend (Angular build)
    location / {
        root /home/ubuntu/huertis/APP-Front/app-front/dist/app-front/browser;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Archivos estáticos (i18n)
    location /i18n/ {
        alias /home/ubuntu/huertis/APP-Front/app-front/dist/app-front/browser/i18n/;
        expires 1h;
    }
}
NGINX

        echo "6.2 Habilitando sitio..."
        sudo ln -sf /etc/nginx/sites-available/huertis /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default
        
        echo "6.3 Verificando y reiniciando Nginx..."
        sudo nginx -t && sudo systemctl restart nginx
        
        echo "Nginx configurado!"
ENDSSH
}

# ============================================
# PASO 7: Iniciar Backend con PM2
# ============================================
start_backend() {
    log "7. Iniciando Backend..."
    
    ssh -p $SSH_PORT -i $SSH_KEY $APP_USER@$SERVER_IP << 'ENDSSH'
        set -e
        cd $APP_DIR/App-Back
        
        echo "7.1 Deteniendo instancias previas..."
        pm2 delete huertis-backend 2>/dev/null || true
        
        echo "7.2 Iniciando con PM2..."
        pm2 start build/src/apps/backend/server.js \
            --name huertis-backend \
            --exp-backoff-restart-delay=100 \
            --max-memory-restart 500M
        
        echo "7.3 Guardando configuración PM2..."
        pm2 startup
        pm2 save
        
        echo "7.4 Verificando estado..."
        pm2 status
        
        echo "Backend iniciado!"
ENDSSH
}

# ============================================
# PASO 8: Verificación Final
# ============================================
verify() {
    log "8. Verificando despliegue..."
    
    ssh -p $SSH_PORT -i $SSH_KEY $APP_USER@$SERVER_IP << 'ENDSSH'
        echo "8.1 Estado de servicios..."
        sudo systemctl status nginx --no-pager | head -5
        echo ""
        pm2 status
        
        echo ""
        echo "8.2 Prueba de conexión a API..."
        curl -s http://localhost:3000/api/health 2>/dev/null || echo "API no responde en /api/health (puede no existir este endpoint)"
        
        echo ""
        echo "8.3 Prueba de frontend..."
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
        if [ "$HTTP_CODE" = "200" ]; then
            echo "Frontend OK (HTTP $HTTP_CODE)"
        else
            echo "Frontend puede tener problemas (HTTP $HTTP_CODE)"
        fi
        
        echo ""
        echo "=========================================="
        echo "DESPLIEGUE COMPLETADO"
        echo "=========================================="
        echo "Frontend: http://54.246.169.223"
        echo "API:      http://54.246.169.223:3000"
        echo ""
        echo "Comandos útiles:"
        echo "  - Ver logs:     pm2 logs huertis-backend"
        echo "  - Reiniciar:    pm2 restart huertis-backend"
        echo "  - Status:       pm2 status"
        echo "=========================================="
ENDSSH
}

# ============================================
# MENÚ PRINCIPAL
# ============================================
show_menu() {
    echo ""
    echo "=========================================="
    echo "  HUERTIS - Menú de Despliegue"
    echo "=========================================="
    echo "  1. Preparar servidor (Node, PostgreSQL, etc.)"
    echo "  2. Subir código"
    echo "  3. Compilar Backend"
    echo "  4. Compilar Frontend"
    echo "  5. Configurar Base de Datos"
    echo "  6. Configurar Nginx"
    echo "  7. Iniciar Backend (PM2)"
    echo "  8. Verificación completa"
    echo "  9. DESPLIEGUE COMPLETO"
    echo "  0. Ver estado actual"
    echo "=========================================="
    echo ""
}

menu() {
    show_menu
    read -p "Selecciona una opción: " opt
    
    case $opt in
        1) prepare_server ;;
        2) upload_code ;;
        3) build_backend ;;
        4) build_frontend ;;
        5) setup_database ;;
        6) configure_nginx ;;
        7) start_backend ;;
        8) verify ;;
        9) 
            log "Ejecutando despliegue completo..."
            prepare_server
            upload_code
            build_backend
            build_frontend
            setup_database
            configure_nginx
            start_backend
            verify
            ;;
        0) 
            log "Estado actual del servidor..."
            ssh -p $SSH_PORT -i $SSH_KEY $APP_USER@$SERVER_IP "pm2 status; echo ''; sudo systemctl status nginx --no-pager | head -10"
            ;;
        *) echo "Opción no válida" ;;
    esac
    
    echo ""
    read -p "¿Otra acción? (s/n): " again
    if [ "$again" = "s" ] || [ "$again" = "S" ]; then
        menu
    else
        echo "¡Hasta luego!"
    fi
}

# Ejecutar si se pasan argumentos
if [ "$1" = "full" ]; then
    log "Ejecutando despliegue completo..."
    prepare_server
    upload_code
    build_backend
    build_frontend
    setup_database
    configure_nginx
    start_backend
    verify
else
    menu
fi