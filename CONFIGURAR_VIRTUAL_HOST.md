# 🌐 Configurar Virtual Host no Apache (Recomendado)

## Por que configurar um Virtual Host?

Com um Virtual Host configurado, você pode usar URLs limpas:
- ✅ `http://localhost/api/plans` (em vez de `http://localhost/ESTOX/api/plans`)
- ✅ Mais profissional
- ✅ Não precisa alterar URLs no código quando mudar de ambiente

## 📋 Passo a Passo

### 1. Editar o arquivo `httpd-vhosts.conf`

Abra o arquivo:
```
C:\xampp\apache\conf\extra\httpd-vhosts.conf
```

### 2. Adicionar a configuração do Virtual Host

Adicione no final do arquivo:

```apache
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot "C:/xampp/htdocs/ESTOX"
    
    <Directory "C:/xampp/htdocs/ESTOX">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Logs (opcional)
    ErrorLog "logs/estox-error.log"
    CustomLog "logs/estox-access.log" common
</VirtualHost>
```

### 3. Habilitar Virtual Hosts no `httpd.conf`

Abra o arquivo:
```
C:\xampp\apache\conf\httpd.conf
```

Procure pela linha (geralmente perto do final):
```apache
#Include conf/extra/httpd-vhosts.conf
```

Remova o `#` para descomentar:
```apache
Include conf/extra/httpd-vhosts.conf
```

### 4. Comentar o Virtual Host padrão (importante!)

No mesmo arquivo `httpd.conf`, procure por:
```apache
<Directory "C:/xampp/htdocs">
    ...
</Directory>
```

E comente ou ajuste para não conflitar.

### 5. Reiniciar o Apache

1. Abra o Painel de Controle do XAMPP
2. Pare o Apache (se estiver rodando)
3. Inicie o Apache novamente

### 6. Testar

Acesse no navegador:
```
http://localhost/api/test.php
http://localhost/api/plans
```

Se funcionar, o Virtual Host está configurado corretamente!

## ⚠️ Problemas Comuns

### Erro 403 (Forbidden)

Verifique se `Require all granted` está presente na configuração do `<Directory>`.

### Erro 404 ainda aparece

1. Verifique se o Apache foi reiniciado
2. Verifique se o `httpd-vhosts.conf` está sendo incluído no `httpd.conf`
3. Verifique os logs: `C:\xampp\apache\logs\error.log`

### Outros sites não funcionam mais

Se você tiver outros projetos em `htdocs`, você pode:
1. Criar um Virtual Host para cada projeto
2. Ou usar portas diferentes (8080, 8081, etc.)

## 🔄 Reverter as URLs (se necessário)

Se você configurou o Virtual Host e quer reverter as URLs nos arquivos JavaScript:

```bash
C:\xampp\php\php.exe atualizar-urls-api.php --reverter
```

Ou edite manualmente os arquivos em `html-version/assets/js/` e altere:
```javascript
const API_URL = 'http://localhost/ESTOX/api';
```
Para:
```javascript
const API_URL = 'http://localhost/api';
```

## ✅ Após Configurar

1. Atualize os arquivos JavaScript para usar `http://localhost/api`
2. Teste o cadastro novamente
3. Verifique se todas as requisições estão funcionando




