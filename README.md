# Review ? MongoDB Atlas

O aplicativo usa React e um servidor Express. Os dados s?o salvos nas cole??es `users`, `products`, `reviews`, `categories` e `sessions`. Coment?rios, curtidas, favoritos e den?ncias ficam nas avalia??es; notas de perfis e prefer?ncias ficam nos usu?rios. Senhas s?o protegidas com scrypt e a sess?o usa cookie HttpOnly.

## Configurar o Atlas

1. Crie um cluster no MongoDB Atlas.
2. Em Database Access, crie um usu?rio com permiss?o `readWrite` somente no banco `review`.
3. Em Network Access, autorize o IP do computador para desenvolvimento e o IP de sa?da da hospedagem para produ??o.
4. Em Connect ? Drivers ? Node.js, copie a string `mongodb+srv://...`.
5. Copie `.env.example` para `.env` e substitua `MONGODB_URI` pela sua string, preenchendo usu?rio e senha. Caracteres especiais na senha devem ser codificados para URL. Configure `APP_URL=http://localhost:3000` no desenvolvimento.

```env
MONGODB_URI="mongodb+srv://USUARIO:SENHA@SEU-CLUSTER.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB="review"
APP_URL="http://localhost:3000"
PORT=3000
```

Nunca coloque a URI no c?digo React, em vari?veis `VITE_`, nem no Git. A integra??o segue a [documenta??o oficial do driver MongoDB](https://www.mongodb.com/docs/drivers/node/current/connect/connection-targets/).

## Executar

Use Node.js 22.12 ou superior, conforme exigido pelo Vite deste projeto.

```powershell
npm install
Copy-Item .env.example .env
# Edite .env antes de iniciar.
npm run dev
```

Abra http://localhost:3000 e cadastre uma conta com senha de pelo menos 8 caracteres. Contas e senhas de demonstra??o foram removidas. Nenhum usu?rio fict?cio ? inserido no banco.

Para tornar uma conta cadastrada administradora, execute no terminal do servidor:

```powershell
npm run admin -- seu@email.com
```

## Validar e publicar

```powershell
npm run lint
npm run build
$env:NODE_ENV = "production"
npm start
```

A hospedagem deve executar Node.js/Express, ter HTTPS e receber `MONGODB_URI`, `MONGODB_DB`, `APP_URL` (URL p?blica) e `NODE_ENV=production` como vari?veis do servidor. Hospedagem apenas de arquivos est?ticos n?o executa a API. O Atlas hospeda o banco, e a aplica??o precisa de hospedagem pr?pria.

## Comportamento e limites

- Sem `MONGODB_URI`, a interface informa que ? necess?rio configurar o banco. Uma URI inv?lida impede a inicializa??o do servidor.
- Dados antigos do localStorage n?o s?o importados automaticamente. O banco come?a vazio, com categorias iniciais.
- Imagens existentes em base64 s?o armazenadas junto aos registros; o limite da requisi??o ? 12 MB. Para muitas fotos, use armazenamento de objetos e grave apenas as URLs no MongoDB.
- Altera??es s?o enviadas em sequ?ncia. Falhas de grava??o aparecem na tela e exigem recarregar os dados; mudan?as locais pendentes s?o descartadas ao recarregar. Altera??es simult?neas em campos compartilhados podem exigir uma nova tentativa.
- Os dados de outros usu?rios s?o atualizados ao entrar novamente ou recarregar a p?gina; n?o h? sincroniza??o em tempo real.
- Prefer?ncias de notifica??o s?o salvas; envio de notifica??es, recupera??o de senha por e-mail e login Google/Apple ainda precisam de servi?os pr?prios.

## Dados de demonstra??o

Execute `npm run seed` com o Atlas configurado para inserir 6 perfis fict?cios, 6 produtos e 6 avalia??es com coment?rios, curtidas, favoritos, notas de perfil e ofertas. As categorias padr?o tamb?m s?o inseridas quando ainda n?o existem. O comando usa IDs `demo_` e pode ser executado novamente sem duplicar ou sobrescrever registros existentes.

Os nomes e textos identificam os dados como demonstra??o. As contas fict?cias n?o t?m privil?gios administrativos e suas senhas aleat?rias n?o s?o divulgadas; entre com a sua pr?pria conta. Fotos ilustrativas usam URLs externas do Unsplash e avatares usam DiceBear; nenhuma imagem precisa ser enviada ao Atlas. Para trocar uma foto, altere o campo `images` do produto e da avalia??o, ou use o upload da aplica??o em novas avalia??es.

Para completar todas as 14 categorias com 6 produtos e uma avalia??o por produto com pelo menos 6 coment?rios, execute `npm run seed:categories` ap?s o seed inicial. O comando preserva os produtos reais e os coment?rios existentes, completa apenas os dados de demonstra??o e verifica as rela??es e contagens no Atlas. Repetir o comando n?o duplica produtos ou coment?rios.

As fotos ilustrativas desse cat?logo s?o baixadas do Unsplash para `public/demo/` ap?s conferir a resposta HTTP e o tipo de conte?do. O site serve esses arquivos diretamente, sem depender das URLs externas durante o uso. Inclua `public/demo/` no projeto e refa?a o build ao publicar. Algumas op??es da mesma categoria compartilham fotos ilustrativas; as imagens n?o representam produtos ou experi?ncias reais. Os IDs das fotos de origem est?o em `scripts/seed-categories.ts`.
