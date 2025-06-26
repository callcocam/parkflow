# 📋 Instruções de Deploy - Correção de Roteamento SPA

## ❌ Problema Identificado
Quando você faz o build da aplicação React e acessa URLs como `/volunteers` diretamente ou recarrega a página, o servidor retorna erro 404. Isso acontece porque o servidor tenta encontrar um arquivo físico na rota, mas em uma SPA (Single Page Application) todas as rotas são gerenciadas pelo React Router.

## ✅ Solução Implementada

### Arquivos Adicionados Automaticamente no Build:
- **`public/.htaccess`** - Para servidores Apache
- **`public/_redirects`** - Para plataformas como Netlify, Vercel, etc.

### 1. 🔧 Servidor Apache
Se seu servidor usa Apache, o arquivo `.htaccess` já está configurado e será incluído automaticamente no build.

**Verificação:**
```bash
# Após fazer o build, verifique se o arquivo existe
ls -la dist/.htaccess
```

### 2. 🌐 Netlify, Vercel, GitHub Pages
O arquivo `_redirects` já está configurado para essas plataformas.

**Configuração Netlify:**
```
/*    /index.html   200
```

### 3. 🔷 Nginx
Se você usa Nginx, adicione esta configuração no seu arquivo de configuração:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /path/to/your/dist;
    index index.html;

    # Configuração para SPA - redireciona todas as rotas para index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Cache mínimo para index.html
    location = /index.html {
        expires 5m;
        add_header Cache-Control "public, must-revalidate";
    }
}
```

### 4. 🐳 Docker + Nginx
Se você usa Docker, crie um `Dockerfile`:

```dockerfile
FROM nginx:alpine

# Copiar arquivos do build
COPY dist/ /usr/share/nginx/html/

# Configuração personalizada do Nginx para SPA
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 5. 🌍 Hospedagem Compartilhada (cPanel)
Para hospedagem compartilhada, o arquivo `.htaccess` deve funcionar automaticamente. Se não funcionar:

1. Verifique se o Apache tem mod_rewrite habilitado
2. Certifique-se de que o arquivo `.htaccess` está na raiz do seu domínio
3. Verifique as permissões do arquivo (644)

## 🧪 Como Testar Localmente

### Teste 1: Build + Preview
```bash
npm run build
npx vite preview --port 4173
```

Acesse `http://localhost:4173/volunteers` diretamente - deve funcionar.

### Teste 2: Servidor HTTP Simples
```bash
npm run build
cd dist
python3 -m http.server 8080
```

Acesse `http://localhost:8080/volunteers` - deve retornar 404 (comportamento esperado sem configuração).

## 🔍 Verificação de Deploy

Após fazer deploy, teste:

1. **Acesso direto à rota:** `seu-site.com/volunteers`
2. **Recarregamento de página:** Navegue até `/volunteers` e pressione F5
3. **Bookmarks:** Salve uma rota e acesse posteriormente

## 🚨 Troubleshooting

### Problema: Ainda recebe 404
1. Verifique se o arquivo `.htaccess` está presente na pasta raiz do servidor
2. Confirme se o servidor suporta mod_rewrite (Apache)
3. Verifique permissões do arquivo `.htaccess` (deve ser 644)

### Problema: CSS/JS não carregam
1. Verifique se o `base` está configurado corretamente no `vite.config.ts`
2. Confirme se os arquivos estão na pasta `assets/`

### Problema: Netlify/Vercel não funciona
1. Verifique se o arquivo `_redirects` está na raiz do build
2. Confirme se o deploy foi feito da pasta correta

## 📝 Comandos Úteis

```bash
# Build da aplicação
npm run build

# Testar build localmente
npx vite preview

# Verificar arquivos incluídos no build
ls -la dist/

# Testar servidor HTTP simples
cd dist && python3 -m http.server 8080
```

## ✅ Status da Implementação
- ✅ Correção de erros TypeScript
- ✅ Configuração para Apache (.htaccess)
- ✅ Configuração para Netlify/Vercel (_redirects)
- ✅ Build funcionando corretamente
- ✅ Arquivos incluídos automaticamente no build 