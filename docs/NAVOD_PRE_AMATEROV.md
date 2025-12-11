# 🚀 SCAMNEMESIS - Kompletný návod pre amatérov

> **Tento návod je písaný tak, aby ho zvládol aj úplný začiatočník.**
> Každý krok je vysvetlený detailne s príkladmi.

---

## 📋 ČO BUDEŠ POTREBOVAŤ

### Pred začatím si priprav:

| Položka | Popis | Kde získať |
|---------|-------|------------|
| 💻 **Počítač** | Windows 10/11, Mac alebo Linux | Tvoj počítač |
| 🌐 **Doména** | napr. scamnemesis.sk | websupport.sk (už máš) |
| 💳 **Platobná karta** | Na platbu za VPS | Tvoja karta |
| 🪪 **Doklad totožnosti** | Pas alebo občiansky preukaz (pre Hetzner verifikáciu) | Tvoj doklad |
| 📧 **Email** | Pre registrácie a notifikácie | Tvoj email |
| ⏰ **Čas** | Cca 2-3 hodiny | Teraz! |

---

## 💰 NÁKLADY

| Služba | Cena | Poznámka |
|--------|------|----------|
| **Hetzner VPS (CX22)** | **€5.39/mesiac** | Server v Nemecku |
| **Doména** | ~€10/rok | Už máš na Websupport |
| **SSL certifikát** | ZADARMO | Let's Encrypt (automaticky) |
| **CELKOM** | **~€6/mesiac** | |

---

## 🎯 PREHĽAD KROKOV

```
KROK 1: Vytvoriť účet na Hetzner         (10-30 minút)
KROK 2: Vytvoriť VPS server              (5 minút)
KROK 3: Pripojiť sa na VPS               (10 minút)
KROK 4: Nainštalovať potrebný softvér    (20 minút)
KROK 5: Nastaviť doménu na Websupport    (10 minút)
KROK 6: Stiahnuť Scamnemesis             (5 minút)
KROK 7: Nastaviť konfiguráciu            (15 minút)
KROK 8: Spustiť aplikáciu                (10 minút)
KROK 9: Nastaviť WordPress               (20 minút)
KROK 10: Otestovať všetko                (15 minút)
```

---

# 📦 KROK 1: Vytvoriť účet na Hetzner

## 1.1 Otvor stránku Hetzner Cloud

1. Otvor prehliadač (Chrome, Firefox, Edge...)
2. Napíš do adresného riadku: **https://console.hetzner.cloud/**
3. Stlač Enter

## 1.2 Registrácia

1. Klikni na tlačidlo **"Register"** (Registrovať)
2. Vyplň formulár:
   ```
   Email:     tvoj@email.sk
   Password:  silné heslo (min. 8 znakov, čísla, veľké písmená)
   ```
3. Zaškrtni súhlas s podmienkami
4. Klikni **"Register"**

## 1.3 Potvrď email

1. Otvor svoju emailovú schránku
2. Nájdi email od **Hetzner**
3. Klikni na potvrdzovací odkaz v emaili

## 1.4 Verifikácia identity (DÔLEŽITÉ!)

⚠️ **Hetzner vyžaduje overenie totožnosti. Toto môže trvať 1-24 hodín!**

1. Po prihlásení sa zobrazí výzva na verifikáciu
2. Vyber metódu verifikácie:
   - **Platobná karta** - najrýchlejšie (okamžite)
   - **PayPal** - rýchle
   - **Doklad totožnosti** - môže trvať 24 hodín

### Ak vyberieš platobná karta:
1. Zadaj údaje z tvojej karty
2. Hetzner strhne a vráti €1 (na overenie)
3. Verifikácia je okamžitá

### Ak vyberieš doklad totožnosti:
1. Nahraj fotografiu pasu alebo občianskeho preukazu
2. Čakaj na schválenie (zvyčajne do 24 hodín)
3. Dostaneš email keď bude účet overený

**✅ Pokračuj až keď máš účet overený!**

---

# 🖥️ KROK 2: Vytvoriť VPS server

## 2.1 Vytvor nový projekt

1. Po prihlásení klikni na **"+ New project"** (vľavo hore)
2. Zadaj názov projektu: **Scamnemesis**
3. Klikni **"Add project"**

## 2.2 Vytvor server

1. Klikni na nový projekt **"Scamnemesis"**
2. Klikni na veľké červené tlačidlo **"+ Create Server"** (alebo "Add Server")

## 2.3 Vyber lokalitu (Location)

Vyber **Falkenstein** (DE) alebo **Nuremberg** (DE):

```
✅ Falkenstein (fsn1)  - ODPORÚČAM - najbližšie k SR
   Nuremberg (nbg1)    - tiež OK
   Helsinki (hel1)     - ďalej, ale funguje
```

**Klikni na "Falkenstein"**

## 2.4 Vyber operačný systém (Image)

1. V sekcii **"Image"** vyber záložku **"OS Images"**
2. Nájdi a klikni na **"Ubuntu"**
3. Vyber verziu: **Ubuntu 22.04**

```
✅ Ubuntu 22.04  - VYBER TÚTO
   Ubuntu 24.04  - novšia, ale menej otestovaná
```

## 2.5 Vyber typ servera (Type)

1. V sekcii **"Type"** vyber záložku **"Shared vCPU"**
2. Vyber architektúru **"x86 (Intel/AMD)"**
3. Nájdi a klikni na **"CX22"**:

```
✅ CX22 - €5.39/mesiac
   - 2 vCPU
   - 4 GB RAM
   - 40 GB SSD
   - 20 TB Traffic
```

## 2.6 Networking (Sieť)

Nechaj predvolené nastavenia:
```
✅ Public IPv4  - zaškrtnuté (potrebuješ!)
✅ Public IPv6  - zaškrtnuté (voliteľné)
```

## 2.7 SSH Keys (Voliteľné ale odporúčané)

**Pre začiatočníkov:** Presuň sa na ďalší krok (použijeme heslo)

**Pre pokročilých:** Môžeš pridať SSH kľúč

## 2.8 Volumes, Firewalls, Backups

Nechaj všetko prázdne/vypnuté (môžeš pridať neskôr)

## 2.9 Placement Groups, Labels, Cloud Config

Presuň sa cez tieto sekcie (nechaj prázdne)

## 2.10 Zadaj názov servera

1. V sekcii **"Name"** zadaj: **scamnemesis-prod**
2. Alebo nechaj automaticky vygenerovaný názov

## 2.11 Vytvor server!

1. Skontroluj cenu vpravo: **€5.39/mo**
2. Klikni na veľké červené tlačidlo **"CREATE & BUY NOW"**

## 2.12 Zapíš si prihlasovacie údaje!

⚠️ **DÔLEŽITÉ! Po vytvorení servera sa zobrazí:**

```
┌─────────────────────────────────────────────┐
│  Server created successfully!                │
│                                             │
│  IPv4 Address:  xxx.xxx.xxx.xxx             │
│  Root Password: xxxxxxxxxxxxxxxx            │
│                                             │
│  ⚠️ SAVE THIS PASSWORD! It won't be         │
│     shown again!                            │
└─────────────────────────────────────────────┘
```

**📝 OKAMŽITE SI ZAPÍŠ:**
- IP adresa: `___.___.___.___ `
- Root heslo: `________________`

**✅ Server sa vytvorí za 30-60 sekúnd. Status sa zmení na "Running".**

---

# 🔌 KROK 3: Pripojiť sa na VPS

## Pre Windows používateľov:

### 3.1 Stiahni PuTTY

1. Choď na: **https://www.putty.org**
2. Klikni na **"Download PuTTY"**
3. V sekcii "Package files" klikni na **"64-bit x86: putty.exe"**
   (nemusíš inštalovať, stačí stiahnuť .exe súbor)
4. Ulož súbor a spusti ho

### 3.2 Pripoj sa cez PuTTY

1. Spusti **putty.exe**
2. Do poľa **"Host Name (or IP address)"** napíš IP adresu z Hetzner:
   ```
   xxx.xxx.xxx.xxx
   ```
3. Port nechaj **22**
4. Connection type: **SSH** (predvolené)
5. Klikni **"Open"**

### 3.3 Prvé prihlásenie

1. Ak sa objaví bezpečnostné varovanie **"PuTTY Security Alert"**, klikni **"Accept"**
2. Zobrazí sa čierny terminál s textom `login as:`
3. Napíš:
   ```
   root
   ```
4. Stlač Enter
5. Napíš heslo z Hetzner (POZOR: pri písaní sa nič nezobrazuje - je to normálne!)
6. Stlač Enter

**✅ Si pripojený keď vidíš:**
```
root@scamnemesis-prod:~#
```

---

## Pre Mac používateľov:

### 3.1 Otvor Terminál

1. Stlač **Command + Medzerník**
2. Napíš **"Terminal"**
3. Stlač Enter

### 3.2 Pripoj sa

Napíš tento príkaz (nahraď xxx.xxx.xxx.xxx tvojou IP):
```bash
ssh root@xxx.xxx.xxx.xxx
```

1. Stlač Enter
2. Ak sa opýta "Are you sure you want to continue connecting?", napíš `yes` a stlač Enter
3. Napíš heslo z Hetzner
4. Stlač Enter

**✅ Si pripojený keď vidíš:**
```
root@scamnemesis-prod:~#
```

---

# ⚙️ KROK 4: Nainštalovať potrebný softvér

**Teraz budeš kopírovať príkazy do terminálu. KOPÍRUJ PRESNE!**

> 💡 **Tip:** V PuTTY vložíš skopírovaný text pravým kliknutím myši

## 4.1 Aktualizuj systém

Skopíruj tento príkaz a vlož ho do terminálu:
```bash
apt update && apt upgrade -y
```

Stlač Enter a **POČKAJ** kým sa dokončí (môže trvať 2-5 minút).

Ak sa opýta "Do you want to continue?" napíš `Y` a stlač Enter.

## 4.2 Nainštaluj základné nástroje

```bash
apt install -y curl wget git nano ufw ca-certificates gnupg
```

## 4.3 Nainštaluj Docker (jednoduchý spôsob)

```bash
curl -fsSL https://get.docker.com | bash
```

Počkaj kým sa dokončí (1-2 minúty).

## 4.4 Over inštaláciu Docker

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

## 4.5 Nastav firewall

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

# 🌐 KROK 5: Nastaviť doménu na Websupport

**Tvoja doména je na Websupport, takže DNS nastavíš tam.**

## 5.1 Prihlás sa do Websupport

1. Choď na: **https://admin.websupport.sk**
2. Prihlás sa svojím účtom

## 5.2 Nájdi DNS nastavenia

1. V ľavom menu klikni na **"Domény"**
2. Klikni na svoju doménu (napr. **scamnemesis.sk**)
3. Klikni na **"DNS záznamy"**

## 5.3 Pridaj DNS záznamy

**DÔLEŽITÉ:** Nahraď `xxx.xxx.xxx.xxx` tvojou IP adresou z Hetzner!

Klikni na **"Pridať záznam"** a pridaj tieto záznamy:

### Záznam 1: Hlavná doména (@)
```
Typ:      A
Názov:    @
Hodnota:  xxx.xxx.xxx.xxx  (tvoja IP z Hetzner!)
TTL:      3600
```
Klikni **"Uložiť"**

### Záznam 2: WWW subdoména
```
Typ:      A
Názov:    www
Hodnota:  xxx.xxx.xxx.xxx
TTL:      3600
```
Klikni **"Uložiť"**

### Záznam 3: WordPress subdoména
```
Typ:      A
Názov:    wp
Hodnota:  xxx.xxx.xxx.xxx
TTL:      3600
```
Klikni **"Uložiť"**

## 5.4 Počkaj na propagáciu

DNS zmeny sa prejavia za **5-30 minút** (niekedy až 2 hodiny).

Môžeš skontrolovať v termináli:
```bash
ping tvojadomena.sk
```

**✅ Mal by si vidieť tvoju IP adresu z Hetzner**

---

# 📥 KROK 6: Stiahnuť Scamnemesis

## 6.1 Vytvor priečinok

```bash
mkdir -p /var/www
cd /var/www
```

## 6.2 Stiahni projekt

```bash
git clone https://github.com/cryptotrust1/Scamnemesis.git
cd Scamnemesis
```

## 6.3 Over stiahnutie

```bash
ls -la
```

**✅ Mal by si vidieť zoznam súborov projektu**

---

# 🔧 KROK 7: Nastaviť konfiguráciu

## 7.1 Vytvor .env súbor

```bash
cp .env.example .env
nano .env
```

## 7.2 Uprav konfiguráciu

V editore **nano** uprav tieto hodnoty (nahraď `tvojadomena.sk` tvojou skutočnou doménou):

```bash
# ============================================================================
# SCAMNEMESIS - PRODUCTION CONFIGURATION
# ============================================================================

# TVOJA DOMÉNA (zmeň na svoju!)
DOMAIN=tvojadomena.sk

# DATABÁZA - ZMEŇ HESLO!
POSTGRES_USER=scamnemesis
POSTGRES_PASSWORD=VelmiSilneHeslo123!
POSTGRES_DB=scamnemesis

# BEZPEČNOSTNÉ KĽÚČE - ZMEŇ VŠETKY!
JWT_SECRET=toto-je-tajny-kluc-zmen-ho-na-nieco-dlhe-a-nahodne-min32znakov
JWT_REFRESH_SECRET=iny-tajny-kluc-pre-refresh-token-987654321-abcdef

# EMAIL PRE SSL CERTIFIKÁT (tvoj email!)
ACME_EMAIL=tvoj@email.sk

# TYPESENSE
TYPESENSE_API_KEY=ZmenTotoNaNahodnyKluc456!

# S3 ÚLOŽISKO
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=ZmenTotoHeslo789!

# WORDPRESS
WP_DB_PASSWORD=WordPressHeslo321!
```

## 7.3 Ulož súbor

1. Stlač **Ctrl + O** (uložiť)
2. Stlač **Enter** (potvrdiť názov súboru)
3. Stlač **Ctrl + X** (zavrieť editor)

## 7.4 Vygeneruj bezpečné heslá (voliteľné)

Ak chceš naozaj bezpečné náhodné heslá:
```bash
openssl rand -base64 32
```

Spusti tento príkaz niekoľkokrát a použi výsledky ako heslá.

---

# 🐳 KROK 8: Spustiť aplikáciu

## 8.1 Spusti Docker Compose

```bash
docker compose -f docker-compose.prod.yml up -d
```

**⏳ Toto môže trvať 5-15 minút pri prvom spustení!**
Docker sťahuje všetky potrebné obrazy.

## 8.2 Sleduj priebeh (voliteľné)

```bash
docker compose -f docker-compose.prod.yml logs -f
```

Stlač **Ctrl + C** pre ukončenie sledovania logov.

## 8.3 Skontroluj či všetko beží

```bash
docker compose -f docker-compose.prod.yml ps
```

**✅ Všetky služby by mali mať STATUS "Up":**
```
NAME                       STATUS
scamnemesis-traefik        Up
scamnemesis-app            Up (healthy)
scamnemesis-postgres       Up (healthy)
scamnemesis-redis          Up (healthy)
scamnemesis-wordpress      Up
scamnemesis-wordpress-db   Up
scamnemesis-typesense      Up
scamnemesis-minio          Up
```

---

# 🌍 KROK 9: Nastaviť WordPress

## 9.1 Otvor WordPress v prehliadači

Choď na: **https://wp.tvojadomena.sk**

(nahraď `tvojadomena.sk` tvojou skutočnou doménou)

## 9.2 Dokonči inštaláciu WordPress

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

## 9.3 Prihlás sa do WordPress

1. Klikni **"Prihlásiť sa"**
2. Zadaj používateľské meno a heslo
3. Klikni **"Prihlásiť sa"**

## 9.4 Aktivuj Scamnemesis plugin

1. V ľavom menu klikni na **"Pluginy"**
2. Nájdi **"Scamnemesis"**
3. Klikni **"Aktivovať"**

## 9.5 Nastav plugin

1. V ľavom menu klikni na **"Nastavenia"** → **"Scamnemesis"**
2. Nastav:
   ```
   API URL:     https://tvojadomena.sk
   API Key:     (vygeneruješ neskôr v admin paneli)
   ```
3. Klikni **"Uložiť zmeny"**

---

# ✅ KROK 10: Otestovať všetko

## 10.1 Skontroluj hlavnú stránku

Otvor: **https://tvojadomena.sk**

✅ Mala by sa zobraziť Scamnemesis aplikácia

## 10.2 Skontroluj WordPress

Otvor: **https://wp.tvojadomena.sk**

✅ Mal by si vidieť WordPress stránku

## 10.3 Skontroluj SSL certifikát

V prehliadači by si mal vidieť 🔒 zámok vedľa URL.

## 10.4 Vytvor testovaciu stránku s widgetom

1. V WordPress choď na **"Stránky"** → **"Pridať novú"**
2. Pomenuj ju **"Vyhľadávanie podvodov"**
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
1. Skontroluj DNS záznamy (KROK 5)
2. Počkaj 15-30 minút (DNS propagácia)
3. Reštartuj Traefik:
```bash
docker compose -f docker-compose.prod.yml restart traefik
```

## Problém: Stránka sa nenačíta / Error 502

**Riešenie:**
1. Pozri logy:
```bash
docker compose -f docker-compose.prod.yml logs app
```
2. Reštartuj aplikáciu:
```bash
docker compose -f docker-compose.prod.yml restart app
```

## Problém: WordPress sa nenačíta

**Riešenie:**
```bash
docker compose -f docker-compose.prod.yml logs wordpress
```
Pozri čo je v logoch.

## Problém: Zabudol som heslo do WordPress

**Riešenie:**
```bash
docker compose -f docker-compose.prod.yml exec wordpress wp user update admin --user_pass=NoveHeslo123
```

## Problém: Chcem vidieť všetky logy

**Riešenie:**
```bash
docker compose -f docker-compose.prod.yml logs -f
```

---

# 📞 POTREBUJEŠ POMOC?

## Užitočné príkazy

### Pozri logy:
```bash
docker compose -f docker-compose.prod.yml logs -f
```

### Reštartuj všetko:
```bash
docker compose -f docker-compose.prod.yml restart
```

### Vypni a zapni všetko:
```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

### Pozri stav služieb:
```bash
docker compose -f docker-compose.prod.yml ps
```

### Pozri využitie disku:
```bash
df -h
```

### Pozri využitie pamäte:
```bash
free -h
```

---

# 🎉 HOTOVO!

Ak si postupoval podľa návodu, mal by si mať:

- ✅ Bežiaci Hetzner VPS server (CX22, €5.39/mesiac)
- ✅ Hlavnú aplikáciu na **https://tvojadomena.sk**
- ✅ WordPress na **https://wp.tvojadomena.sk**
- ✅ Scamnemesis plugin aktivovaný
- ✅ SSL certifikát (HTTPS) - automaticky od Let's Encrypt
- ✅ Databázu PostgreSQL s pgvector
- ✅ Redis cache
- ✅ Typesense vyhľadávanie
- ✅ MinIO úložisko súborov

---

# 📊 MESAČNÉ NÁKLADY

| Služba | Cena |
|--------|------|
| Hetzner CX22 | €5.39/mes |
| Doména (websupport) | ~€0.83/mes (~€10/rok) |
| SSL certifikát | ZADARMO |
| **CELKOM** | **~€6.22/mesiac** |

---

**Vytvorené:** December 2024
**Aktualizované pre:** Hetzner Cloud CX22
**Pre verziu:** Scamnemesis 1.0
