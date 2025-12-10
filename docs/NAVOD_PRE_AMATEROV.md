# 🚀 SCAMNEMESIS - Kompletný návod pre amatérov

> **Tento návod je písaný tak, aby ho zvládol aj úplný začiatočník.**
> Každý krok je vysvetlený detailne s obrázkami a príkladmi.

---

## 📋 ČO BUDEŠ POTREBOVAŤ

### Pred začatím si priprav:

| Položka | Popis | Kde získať |
|---------|-------|------------|
| 💻 **Počítač** | Windows 10/11, Mac alebo Linux | Tvoj počítač |
| 🌐 **Doména** | napr. scamnemesis.sk | websupport.sk (už máš) |
| 💳 **Platobná karta** | Na platbu za VPS | Tvoja karta |
| 📧 **Email** | Pre registrácie a notifikácie | Tvoj email |
| ⏰ **Čas** | Cca 2-3 hodiny | Teraz! |

---

## 🎯 PREHĽAD KROKOV

```
KROK 1: Kúpiť VPS na Websupport        (10 minút)
KROK 2: Pripojiť sa na VPS             (10 minút)
KROK 3: Nainštalovať potrebný softvér  (20 minút)
KROK 4: Nastaviť doménu                (10 minút)
KROK 5: Stiahnuť Scamnemesis           (5 minút)
KROK 6: Nastaviť konfiguráciu          (15 minút)
KROK 7: Spustiť aplikáciu              (10 minút)
KROK 8: Nastaviť WordPress             (20 minút)
KROK 9: Otestovať všetko               (15 minút)
```

---

# 📦 KROK 1: Kúpiť VPS na Websupport

## 1.1 Otvor stránku Websupport

1. Otvor prehliadač (Chrome, Firefox, Edge...)
2. Napíš do adresného riadku: **https://www.websupport.sk**
3. Stlač Enter

## 1.2 Nájdi VPS servery

1. V hornom menu klikni na **"Hosting"**
2. Vyber **"VPS servery"**
3. Alebo choď priamo na: **https://www.websupport.sk/vps-server**

## 1.3 Vyber správny VPS

**Pre Scamnemesis odporúčam minimálne:**

| Parametre | Minimum | Odporúčané |
|-----------|---------|------------|
| RAM | 4 GB | 8 GB |
| CPU | 2 jadrá | 4 jadrá |
| Disk | 40 GB SSD | 80 GB SSD |
| Cena | ~15€/mes | ~25€/mes |

➡️ **Vyber "VPS SSD 2" alebo "VPS SSD 4"**

## 1.4 Nastav VPS

Pri objednávke vyber:

```
Operačný systém:    Ubuntu 22.04 LTS  ✅
Lokalita:           Slovensko (SK)    ✅
Fakturačné obdobie: Mesačne           ✅
```

## 1.5 Dokonči objednávku

1. Klikni **"Objednať"**
2. Prihlás sa do svojho účtu (alebo sa zaregistruj)
3. Vyplň fakturačné údaje
4. Zaplať kartou/prevodom
5. **POČKAJ 5-15 MINÚT** kým sa VPS vytvorí

## 1.6 Nájdi prihlasovacie údaje

Po vytvorení VPS dostaneš email s:
```
IP adresa:     185.xxx.xxx.xxx
Používateľ:    root
Heslo:         xxxxxxxxxxxxxxxx
```

**⚠️ ULOŽ SI TIETO ÚDAJE! Budeš ich potrebovať!**

---

# 🔌 KROK 2: Pripojiť sa na VPS

## Pre Windows používateľov:

### 2.1 Stiahni PuTTY

1. Choď na: **https://www.putty.org**
2. Klikni na **"Download PuTTY"**
3. Stiahni **"putty-64bit-X.XX-installer.msi"**
4. Nainštaluj (Next → Next → Install → Finish)

### 2.2 Pripoj sa cez PuTTY

1. Spusti **PuTTY**
2. Do poľa **"Host Name"** napíš IP adresu z emailu:
   ```
   185.xxx.xxx.xxx
   ```
3. Port nechaj **22**
4. Klikni **"Open"**

### 2.3 Prvé prihlásenie

1. Ak sa objaví bezpečnostné varovanie, klikni **"Accept"**
2. Napíš používateľa:
   ```
   root
   ```
3. Stlač Enter
4. Napíš heslo z emailu (POZOR: pri písaní sa nič nezobrazuje!)
5. Stlač Enter

**✅ Si pripojený keď vidíš niečo ako:**
```
root@vps-xxxxx:~#
```

---

## Pre Mac používateľov:

### 2.1 Otvor Terminál

1. Stlač **Command + Medzerník**
2. Napíš **"Terminal"**
3. Stlač Enter

### 2.2 Pripoj sa

Napíš tento príkaz (nahraď IP adresu tvojou):
```bash
ssh root@185.xxx.xxx.xxx
```

Stlač Enter, napíš heslo, hotovo!

---

# ⚙️ KROK 3: Nainštalovať potrebný softvér

**Teraz budeš kopírovať príkazy do terminálu. KOPÍRUJ PRESNE!**

## 3.1 Aktualizuj systém

Skopíruj tento príkaz a vlož ho do terminálu:
```bash
apt update && apt upgrade -y
```

Stlač Enter a **POČKAJ** kým sa dokončí (môže trvať 2-5 minút).

## 3.2 Nainštaluj základné nástroje

```bash
apt install -y curl wget git nano ufw software-properties-common ca-certificates gnupg lsb-release
```

## 3.3 Nainštaluj Docker

### Krok A: Pridaj Docker repozitár
```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### Krok B: Nainštaluj Docker
```bash
apt update && apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### Krok C: Over inštaláciu
```bash
docker --version
```

**✅ Mal by si vidieť niečo ako:**
```
Docker version 24.0.x, build xxxxxxx
```

```bash
docker compose version
```

**✅ Mal by si vidieť:**
```
Docker Compose version v2.x.x
```

## 3.4 Nastav firewall

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable
```

**✅ Mal by si vidieť:**
```
Firewall is active and enabled on system startup
```

---

# 🌐 KROK 4: Nastaviť doménu

## 4.1 Prihlás sa do Websupport

1. Choď na: **https://admin.websupport.sk**
2. Prihlás sa svojím účtom

## 4.2 Nájdi DNS nastavenia

1. V ľavom menu klikni na **"Domény"**
2. Klikni na svoju doménu (napr. **scamnemesis.sk**)
3. Klikni na **"DNS záznamy"**

## 4.3 Pridaj DNS záznamy

Klikni na **"Pridať záznam"** a pridaj tieto záznamy:

### Záznam 1: Hlavná doména
```
Typ:      A
Názov:    @
Hodnota:  185.xxx.xxx.xxx  (tvoja IP!)
TTL:      3600
```
Klikni **"Uložiť"**

### Záznam 2: WWW
```
Typ:      A
Názov:    www
Hodnota:  185.xxx.xxx.xxx
TTL:      3600
```
Klikni **"Uložiť"**

### Záznam 3: API
```
Typ:      A
Názov:    api
Hodnota:  185.xxx.xxx.xxx
TTL:      3600
```
Klikni **"Uložiť"**

### Záznam 4: WordPress
```
Typ:      A
Názov:    wp
Hodnota:  185.xxx.xxx.xxx
TTL:      3600
```
Klikni **"Uložiť"**

## 4.4 Počkaj na propagáciu

DNS zmeny sa prejavia za **5-30 minút**.

Môžeš skontrolovať v termináli:
```bash
ping scamnemesis.sk
```

**✅ Mal by si vidieť tvoju IP adresu**

---

# 📥 KROK 5: Stiahnuť Scamnemesis

## 5.1 Vytvor priečinok

```bash
mkdir -p /var/www
cd /var/www
```

## 5.2 Stiahni projekt

```bash
git clone https://github.com/cryptotrust1/Scamnemesis.git
cd Scamnemesis
```

## 5.3 Over stiahnutie

```bash
ls -la
```

**✅ Mal by si vidieť zoznam súborov projektu**

---

# 🔧 KROK 6: Nastaviť konfiguráciu

## 6.1 Vytvor produkčný .env súbor

```bash
cp .env.example .env
nano .env
```

## 6.2 Uprav konfiguráciu

V editore **nano** uprav tieto hodnoty:

```bash
# ============================================================================
# SCAMNEMESIS - PRODUCTION CONFIGURATION
# ============================================================================

# TVOJA DOMÉNA (zmeň na svoju!)
DOMAIN=scamnemesis.sk

# DATABÁZA - ZMEŇ HESLO!
DATABASE_URL=postgresql://scamnemesis:ZmenTotoHeslo123!@postgres:5432/scamnemesis
POSTGRES_USER=scamnemesis
POSTGRES_PASSWORD=ZmenTotoHeslo123!
POSTGRES_DB=scamnemesis

# REDIS
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=RedisHeslo456!

# BEZPEČNOSTNÉ KĽÚČE - ZMEŇ VŠETKY!
JWT_SECRET=toto-je-tajny-kluc-zmen-ho-na-nieco-dlhe-a-nahodne-123456
JWT_REFRESH_SECRET=iny-tajny-kluc-pre-refresh-token-987654321
SESSION_SECRET=session-secret-kluc-tiez-zmen-abcdef
WEBHOOK_SECRET=webhook-secret-123456789

# EMAIL PRE SSL CERTIFIKÁT (tvoj email!)
ACME_EMAIL=tvoj@email.sk

# SMTP (pre posielanie emailov - voliteľné)
SMTP_HOST=smtp.websupport.sk
SMTP_PORT=587
SMTP_USER=info@scamnemesis.sk
SMTP_PASSWORD=tvoje-email-heslo

# WORDPRESS
WP_DB_PASSWORD=WordPressHeslo789!
```

## 6.3 Ulož súbor

1. Stlač **Ctrl + O** (uložiť)
2. Stlač **Enter** (potvrdiť)
3. Stlač **Ctrl + X** (zavrieť)

## 6.4 Vygeneruj bezpečné heslá

Ak chceš naozaj bezpečné heslá, použi tento príkaz:
```bash
openssl rand -base64 32
```

Spusti ho niekoľkokrát a použi výsledky ako heslá.

---

# 🐳 KROK 7: Spustiť aplikáciu

## 7.1 Vytvor produkčný Docker Compose súbor

```bash
nano docker-compose.prod.yml
```

Vlož tento obsah:

```yaml
version: '3.8'

services:
  # ==================== TRAEFIK (Reverse Proxy + SSL) ====================
  traefik:
    image: traefik:v3.0
    container_name: scamnemesis-traefik
    restart: always
    command:
      - "--api.dashboard=false"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--entrypoints.web.http.redirections.entryPoint.to=websecure"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL:-admin@example.com}"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik_certs:/letsencrypt
    networks:
      - scamnemesis

  # ==================== POSTGRESQL (Databáza) ====================
  postgres:
    image: pgvector/pgvector:pg16
    container_name: scamnemesis-postgres
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-scamnemesis}
      POSTGRES_USER: ${POSTGRES_USER:-scamnemesis}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-scamnemesis}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - scamnemesis

  # ==================== REDIS (Cache) ====================
  redis:
    image: redis:7-alpine
    container_name: scamnemesis-redis
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - scamnemesis

  # ==================== WORDPRESS ====================
  wordpress:
    image: wordpress:6.4-php8.2-apache
    container_name: scamnemesis-wordpress
    restart: always
    environment:
      WORDPRESS_DB_HOST: wordpress-db
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: ${WP_DB_PASSWORD:-changeme}
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - wordpress_data:/var/www/html
      - ./plugins/scamnemesis-wp:/var/www/html/wp-content/plugins/scamnemesis:ro
    depends_on:
      - wordpress-db
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.wordpress.rule=Host(`wp.${DOMAIN:-localhost}`)"
      - "traefik.http.routers.wordpress.tls.certresolver=letsencrypt"
      - "traefik.http.services.wordpress.loadbalancer.server.port=80"
    networks:
      - scamnemesis

  wordpress-db:
    image: mysql:8.0
    container_name: scamnemesis-wordpress-db
    restart: always
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: ${WP_DB_PASSWORD:-changeme}
      MYSQL_ROOT_PASSWORD: ${WP_DB_PASSWORD:-changeme}
    volumes:
      - wordpress_db_data:/var/lib/mysql
    networks:
      - scamnemesis

  # ==================== TYPESENSE (Vyhľadávanie) ====================
  typesense:
    image: typesense/typesense:0.25.2
    container_name: scamnemesis-typesense
    restart: always
    environment:
      TYPESENSE_DATA_DIR: /data
      TYPESENSE_API_KEY: ${TYPESENSE_API_KEY:-changeme}
    volumes:
      - typesense_data:/data
    networks:
      - scamnemesis

  # ==================== MINIO (Úložisko súborov) ====================
  minio:
    image: minio/minio:latest
    container_name: scamnemesis-minio
    restart: always
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${S3_ACCESS_KEY:-minioadmin}
      MINIO_ROOT_PASSWORD: ${S3_SECRET_KEY:-minioadmin}
    volumes:
      - minio_data:/data
    networks:
      - scamnemesis

# ==================== VOLUMES ====================
volumes:
  traefik_certs:
  postgres_data:
  redis_data:
  wordpress_data:
  wordpress_db_data:
  typesense_data:
  minio_data:

# ==================== NETWORK ====================
networks:
  scamnemesis:
    driver: bridge
```

Ulož: **Ctrl + O**, **Enter**, **Ctrl + X**

## 7.2 Spusti Docker Compose

```bash
docker compose -f docker-compose.prod.yml up -d
```

**⏳ Toto môže trvať 5-10 minút pri prvom spustení!**

## 7.3 Skontroluj či všetko beží

```bash
docker compose -f docker-compose.prod.yml ps
```

**✅ Všetky služby by mali mať STATUS "Up":**
```
NAME                       STATUS
scamnemesis-traefik        Up
scamnemesis-postgres       Up (healthy)
scamnemesis-redis          Up (healthy)
scamnemesis-wordpress      Up
scamnemesis-wordpress-db   Up
scamnemesis-typesense      Up
scamnemesis-minio          Up
```

## 7.4 Pozri logy ak niečo nefunguje

```bash
docker compose -f docker-compose.prod.yml logs -f
```

Stlač **Ctrl + C** pre ukončenie sledovania logov.

---

# 🌍 KROK 8: Nastaviť WordPress

## 8.1 Otvor WordPress v prehliadači

Choď na: **https://wp.tvojadomena.sk**

(napr. https://wp.scamnemesis.sk)

## 8.2 Dokonči inštaláciu WordPress

1. **Vyber jazyk:** Slovenčina
2. Klikni **"Pokračovať"**

3. Vyplň údaje:
   ```
   Názov stránky:        Scamnemesis
   Používateľské meno:   admin (alebo čo chceš)
   Heslo:                (vygeneruj silné heslo a ULOŽ SI HO!)
   Email:                tvoj@email.sk
   ```

4. Klikni **"Inštalovať WordPress"**

## 8.3 Prihlás sa do WordPress

1. Klikni **"Prihlásiť sa"**
2. Zadaj používateľské meno a heslo
3. Klikni **"Prihlásiť sa"**

## 8.4 Aktivuj Scamnemesis plugin

1. V ľavom menu klikni na **"Pluginy"**
2. Nájdi **"Scamnemesis"**
3. Klikni **"Aktivovať"**

## 8.5 Nastav plugin

1. V ľavom menu klikni na **"Nastavenia"** → **"Scamnemesis"**
2. Nastav:
   ```
   API URL:     https://api.tvojadomena.sk
   API Key:     (vygeneruješ neskôr v admin paneli)
   ```
3. Klikni **"Uložiť zmeny"**

---

# ✅ KROK 9: Otestovať všetko

## 9.1 Skontroluj WordPress

Otvor: **https://wp.tvojadomena.sk**

✅ Mal by si vidieť WordPress stránku

## 9.2 Skontroluj SSL certifikát

V prehliadači by si mal vidieť 🔒 zámok vedľa URL.

## 9.3 Vytvor testovaciu stránku s widgetom

1. V WordPress choď na **"Stránky"** → **"Pridať novú"**
2. Pomenuj ju **"Test vyhľadávania"**
3. Pridaj shortcode:
   ```
   [scamnemesis_search]
   ```
4. Klikni **"Publikovať"**
5. Klikni **"Zobraziť stránku"**

---

# 🆘 RIEŠENIE PROBLÉMOV

## Problém: "Connection refused"

**Riešenie:**
```bash
docker compose -f docker-compose.prod.yml restart
```

## Problém: SSL certifikát nefunguje

**Riešenie:**
1. Skontroluj DNS záznamy
2. Počkaj 10-15 minút
3. Reštartuj Traefik:
```bash
docker compose -f docker-compose.prod.yml restart traefik
```

## Problém: WordPress sa nenačíta

**Riešenie:**
```bash
docker compose -f docker-compose.prod.yml logs wordpress
```
Pozri čo je v logoch.

## Problém: Zabudol som heslo

**Riešenie pre WordPress:**
```bash
docker compose -f docker-compose.prod.yml exec wordpress wp user update admin --user_pass=NoveHeslo123
```

---

# 📞 POTREBUJEŠ POMOC?

1. **Skontroluj logy:**
   ```bash
   docker compose -f docker-compose.prod.yml logs -f
   ```

2. **Reštartuj všetko:**
   ```bash
   docker compose -f docker-compose.prod.yml restart
   ```

3. **Vypni a zapni:**
   ```bash
   docker compose -f docker-compose.prod.yml down
   docker compose -f docker-compose.prod.yml up -d
   ```

---

# 🎉 HOTOVO!

Ak si postupoval podľa návodu, mal by si mať:

- ✅ Bežiaci VPS server
- ✅ WordPress na **https://wp.tvojadomena.sk**
- ✅ Scamnemesis plugin aktivovaný
- ✅ SSL certifikát (HTTPS)
- ✅ Databázu PostgreSQL
- ✅ Redis cache
- ✅ Typesense vyhľadávanie

---

**Vytvorené:** December 2024
**Pre verziu:** Scamnemesis 1.0
