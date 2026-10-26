# Sådan satte vi ExpressChat op på Hetzner

Guiden følger den rækkefølge, vi gjorde det i.
Skift `DIN-IP` ud med serverens IP fra Hetzner-panelet.

## Del 1: Gør koden klar på din Mac

**1. Importér databaseforbindelsen i `app.js`**

```js
import connection from "./database.js";
```

**2. Flyt adgangsoplysningerne fra `database.js` over i miljøvariabler**

```js
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
```

Porten i `app.js`:

```js
const port = process.env.PORT || 3000;
```

**3. Lav en `.env` i projektmappen** med jeres egne lokale MySQL-oplysninger:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=jeres-lokale-password
DB_NAME=users_db
```

**4. Sørg for, at `.env` ikke kommer på GitHub.** Tilføj den til `.gitignore`:

```
node_modules/
.env
```

**5. Få scripts i `package.json` til at læse `.env`**

```json
"watch": "node --watch --env-file=.env app.js",
"start": "node --env-file=.env app.js"
```

**6. Test lokalt**

- MySQL skal køre: *Systemindstillinger → MySQL → Start MySQL Server*
- Har du lige hentet projektet, så kør `npm install` først
- Kør `npm run watch`. Der skal stå `Connected to the database OKAY.`

**7. Commit og push til GitHub**

## Del 2: Sæt serveren op

**8. Log ind på serveren fra terminalen på din Mac**

```bash
ssh root@DIN-IP
```

Når der står `root@ubuntu-...` foran linjen, er du på serveren.

**9. Installér Node, MySQL, git og PM2**

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs mysql-server git
npm install -g pm2
```

**10. Opret databasen, en bruger og tabellen**

Serveren er en ny, tom computer, så databasen skal oprettes igen her.

```bash
mysql
```

Når der står `mysql>`, så indsæt:

```sql
CREATE DATABASE users_db;
CREATE USER 'chatapp'@'localhost' IDENTIFIED BY 'ET-PASSWORD';
GRANT ALL PRIVILEGES ON users_db.* TO 'chatapp'@'localhost';
USE users_db;
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user VARCHAR(100),
  text TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
EXIT;
```

- `chatapp` er den bruger, appen logger ind med. `root` virker ikke til appen på serveren.
- Brug lige anførselstegn `'`, ikke skrå `‘ ’`. Ellers giver MySQL en syntaksfejl.
- Sidder du fast i `'>`, så tryk `Ctrl+C`.

**11. Hent koden og lav serverens `.env`**

```bash
git clone https://github.com/leamhkea/ExpressChat.git
cd ExpressChat
npm install
nano .env
```

Indsæt det her, og gem med `Ctrl+O`, `Enter`, `Ctrl+X`:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=chatapp
DB_PASSWORD=ET-PASSWORD
DB_NAME=users_db
```

Brug det samme password som i trin 10. `.env` ligger ikke på GitHub, så den skal laves på serveren.

**12. Start appen med PM2**

```bash
pm2 start npm --name chat -- start
pm2 save
```

**13. Test i browseren:** `http://DIN-IP:3000`

**14. Tjek, at databasen er forbundet**

```bash
pm2 logs chat --lines 20
```

Der skal stå `Connected to the database OKAY.`

**15. Få appen til at starte af sig selv efter en genstart**

```bash
pm2 startup
pm2 save
```

Kør den kommando, `pm2 startup` eventuelt udskriver.

**16. Genstart serveren**

```bash
reboot
```

Vent et minut, og tjek `http://DIN-IP:3000` igen.

## Når du har ændret noget i koden

Push fra din Mac, og kør så på serveren:

```bash
ssh root@DIN-IP
cd ExpressChat
git pull
pm2 restart chat
```

Har du tilføjet nye pakker, så kør `npm install` før `pm2 restart chat`.

## Hvis noget går galt

| Fejl | Betyder |
|---|---|
| `Cannot find package '...'` | Kør `npm install` |
| `ECONNREFUSED ...:3306` | MySQL kører ikke |
| `Access denied for user ''` | `DB_USER` bliver ikke læst. Tjek `.env` og scriptet i `package.json` |
| `Access denied for user 'chatapp'` | Forkert password i `.env` |
| `Unknown database 'users_db'` | Databasen er ikke oprettet |

Se altid fejlene på serveren med `pm2 logs chat`.
