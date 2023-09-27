# Sikka Tests

Um die Funktionsfähigkeit neuer Versionen zu gewährleisten,
sodass keine fehlerhaften Versionen, die mitunter zu Datenverlust führen könnten,
hochgeladen werden, müssen die Tests gepflegt und vor jedem neuen Release
durchgeführt werden.

Dieses Dokument gibt die entsprechenden Informationen, wie die Tests gehandhabt werden und gepflegt
werden können.

## Requirements

### Grunt

Das Test Framwork benutzt Grunt als Taskrunner. Dafür muss die cli global installiert 
werden.

```cli
npm install -g grunt-cli
```



## Datenbankschema

Wenn sich die Datenbank ändert muss auch das Schema im Testordner angepasst werden.
Hierfür wird eine 'nur-Schema' export mit pg_dump durchgeführt.

```
pg_dump.exe -U postgres -d coins --ignore-table app_user --data-only -f coins_schema.sql
```

## Mockdata aktualisieren

Wenn sich die Datenbank ändert, müssen die Migrationen auch auf die Testdaten angewandt werden.
Diese sind befinden sich im Ordner 'test/mockdata'.

Hierfür wird zuerst die entsprechende Datenbank geladen:

1. Die Testdatenbank wird mit `node testing-backend.js`(**ACHTUNG, das Arbeitsverzeichnis muss das Testverzeichnis sein, da es die entsprechende .env Datei enthält!**)
2. Hierauf senden wir an den Endpunkt `http://localhost:4000/test-database` den entsprechenden Befehl per GET oder POST Anfrage, z.B. 

Hinweis: Für die Anfrage kann mit Programmen wie curl oder [Insomnia](https://insomnia.rest/) gesendet werden.

### Header 
```yaml
Content-Type: application/json
```
### Body
```json
{
	"method": "MountMinimalDatabase"
}
```
3. Nun werden die Migrationen angewandt (wieder aus dem Testverzeichnis):
```cmd
node ../backend/scripts/migrate.js
```
4. Falls noch Anpassungen an den Daten gemacht werden müssen, sollten diese nun gemacht werden, z.B. ein weiteres Skript, welches neue Daten generiert oder händische Anpassungen.

5. Dann wird die neu erzeugte Datenbank gespeichert und ersetzt die vorherige SQL-Datei: 
```
pg_dump -d sikka-buya-test-database -U postgres --no-owner -f mockdata/minimal-filled-database.sql  --inserts --no-privileges
```

6. Make sure the following line is commented out:
```sql
...
SET standard_conforming_strings = on;
-- SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
...
```


