# 🚀 SCAMNEMESIS - Kompletný návod pre úplných začiatočníkov

> **⚠️ Tento návod je písaný EXTRÉMNE detailne - každý klik je vysvetlený.**
> Ak niečomu nerozumieš, čítaj pomaly a presne nasleduj inštrukcie.

---

## 📋 ČO BUDEŠ POTREBOVAŤ (priprav si vopred!)

| Položka | Popis | Kde to mám? |
|---------|-------|-------------|
| 💻 **Počítač** | Windows, Mac alebo Linux | Sedíš za ním |
| 🌐 **Doména** | napr. scamnemesis.sk | Máš na websupport.sk |
| 💳 **Platobná karta** | VISA, Mastercard | Tvoja peňaženka |
| 🪪 **Občiansky alebo pas** | Na overenie identity v Hetzner | Tvoj doklad |
| 📧 **Email** | Fungujúci email | Musíš sa doň vedieť prihlásiť |
| ⏰ **Čas** | 2-3 hodiny | Teraz! |
| 📝 **Papier a pero** | Na zapisovanie hesiel! | DÔLEŽITÉ! |

---

## 💰 KOĽKO TO BUDE STÁŤ

| Čo | Cena | Poznámka |
|----|------|----------|
| **Server (Hetzner CX22)** | **€5.39/mesiac** | Platíš kartou |
| **Doména** | ~€10/rok | Už máš na Websupport |
| **SSL (HTTPS zámok)** | **ZADARMO** | Automaticky |
| **CELKOM** | **~€6/mesiac** | |

---

## 🎯 ČO BUDEME ROBIŤ (prehľad)

```
KROK 1:  Vytvoríš si účet na Hetzner      [20 minút]
KROK 2:  Kúpiš si server                  [10 minút]
KROK 3:  Pripojíš sa na server            [15 minút]
KROK 4:  Nainštaluješ Docker              [10 minút]
KROK 5:  Nastavíš doménu                  [15 minút]
KROK 6:  Stiahneš Scamnemesis             [5 minút]
KROK 7:  Nastavíš heslá                   [10 minút]
KROK 8:  Spustíš aplikáciu                [15 minút]
KROK 9:  Nastavíš WordPress               [15 minút]
KROK 10: Otestuješ či funguje             [10 minút]
```

---

---

---

# 📦 KROK 1: Vytvorenie účtu na Hetzner

## 1.1 Otvor webovú stránku Hetzner

1. **Otvor prehliadač** (Chrome, Firefox, Edge - čokoľvek používaš)

2. **Klikni do adresného riadku** (biely obdĺžnik hore kde je napísaná adresa)

3. **Vymaž čo tam je** a napíš presne toto:
   ```
   console.hetzner.cloud
   ```

4. **Stlač klávesu Enter**

5. **Čo uvidíš:** Stránka s Hetzner logom a prihlasovacím formulárom

---

## 1.2 Registrácia nového účtu

1. **Hľadaj tlačidlo "Register"** (anglicky = Registrovať)
   - Je to zvyčajne pod prihlasovacím formulárom
   - Môže tam byť napísané aj "Sign up" alebo "Create account"

2. **Klikni na "Register"**

3. **Zobrazí sa registračný formulár. Vyplň ho:**

   ```
   ┌─────────────────────────────────────────────────────┐
   │  Email address:                                     │
   │  ┌─────────────────────────────────────────────┐    │
   │  │ tvoj.email@gmail.com                        │    │
   │  └─────────────────────────────────────────────┘    │
   │                                                     │
   │  Password:                                          │
   │  ┌─────────────────────────────────────────────┐    │
   │  │ ●●●●●●●●●●●●●●●●                            │    │
   │  └─────────────────────────────────────────────┘    │
   │                                                     │
   │  ☑ I agree to the Terms and Conditions             │
   │                                                     │
   │  [        Register        ]                         │
   └─────────────────────────────────────────────────────┘
   ```

4. **Email address:** Napíš tvoj skutočný email (musíš sa doň vedieť prihlásiť!)

5. **Password:** Vymysli si SILNÉ heslo:
   - Minimálne 8 znakov
   - Musí obsahovať: veľké písmeno (A-Z), malé písmeno (a-z), číslo (0-9)
   - Príklad: `MojeHeslo123!`

   **📝 ZAPÍŠ SI TOTO HESLO NA PAPIER! Budeš ho potrebovať!**

6. **Zaškrtni políčko** "I agree to Terms and Conditions" (Súhlasím s podmienkami)

7. **Klikni na tlačidlo "Register"**

---

## 1.3 Potvrdenie emailu

1. **Otvor svoj email** (Gmail, Outlook, alebo čo používaš)
   - Otvor novú záložku v prehliadači
   - Choď na svoj email

2. **Hľadaj email od Hetzner**
   - Odosielateľ: niečo ako `noreply@hetzner.cloud` alebo `Hetzner`
   - Predmet: niečo ako "Please confirm your email" alebo "Verify your account"

   **⚠️ Ak ho nevidíš, pozri do priečinka SPAM/Nevyžiadaná pošta!**

3. **Otvor ten email**

4. **V emaili nájdi tlačidlo alebo odkaz** - bude tam niečo ako:
   - "Confirm email"
   - "Verify email"
   - "Click here to confirm"
   - Alebo dlhý modrý odkaz

5. **Klikni na ten odkaz/tlačidlo**

6. **Čo sa stane:** Otvorí sa nová stránka Hetzner s potvrdením

---

## 1.4 Overenie identity (MUSÍŠ UROBIŤ!)

**⚠️ DÔLEŽITÉ: Hetzner potrebuje overiť že si skutočný človek. Bez toho nemôžeš pokračovať!**

Po potvrdení emailu sa ti zobrazí stránka kde Hetzner chce overiť tvoju identitu.

### Máš 3 možnosti - vyber si jednu:

---

### MOŽNOSŤ A: Platobná karta (ODPORÚČAM - najrýchlejšie!)

1. **Vyber možnosť "Credit Card" alebo "Add Payment Method"**

2. **Vyplň údaje z tvojej karty:**
   ```
   Card number:     1234 5678 9012 3456  (číslo na prednej strane karty)
   Expiry date:     12/27                (platnosť karty MM/RR)
   CVV/CVC:         123                  (3 čísla na zadnej strane karty)
   Cardholder:      MENO PRIEZVISKO      (meno na karte, VEĽKÝMI písmenami)
   ```

3. **Klikni "Submit" alebo "Verify"**

4. **Čo sa stane:**
   - Hetzner strhne z karty €1 (alebo podobnú malú sumu)
   - Peniaze ti VRÁTIA do pár dní
   - Slúži to len na overenie že karta je tvoja

5. **✅ HOTOVO!** Overenie je okamžité. Môžeš pokračovať na KROK 2.

---

### MOŽNOSŤ B: PayPal

1. **Vyber možnosť "PayPal"**
2. **Prihlásiš sa do svojho PayPal účtu**
3. **Potvrdíš prepojenie**
4. **✅ Overenie je zvyčajne okamžité**

---

### MOŽNOSŤ C: Doklad totožnosti (trvá dlhšie)

1. **Vyber možnosť "ID verification" alebo "Identity document"**

2. **Nafoť svoj občiansky preukaz alebo pas:**
   - Prednú stranu
   - Zadnú stranu (ak treba)
   - Fotka musí byť ostrá a čitateľná!

3. **Nahraj fotky na stránku**

4. **Čakaj na schválenie:**
   - Môže trvať 1-24 hodín
   - Dostaneš email keď bude schválené

---

**✅ Pokračuj na KROK 2 až keď máš overený účet!**

---

---

---

# 🖥️ KROK 2: Vytvorenie servera

## 2.1 Prihlás sa do Hetzner Console

1. **Choď na:** `console.hetzner.cloud`

2. **Prihlás sa** svojím emailom a heslom (čo si vytvoril v KROKU 1)

3. **Čo uvidíš po prihlásení:**
   ```
   ┌──────────────────────────────────────────────────────────┐
   │  Console                              [tvoj@email.sk]    │
   ├──────────────────────────────────────────────────────────┤
   │                                                          │
   │  Default                 (toto je tvoj projekt)          │
   │                                                          │
   │  [+ Create Server]       (toto tlačidlo hľadáš!)         │
   │                                                          │
   └──────────────────────────────────────────────────────────┘
   ```

---

## 2.2 Klikni na "Create Server"

1. **Nájdi tlačidlo "Create Server"** alebo "Add Server" alebo "+ Create Server"
   - Môže byť červené alebo modré
   - Je to veľké tlačidlo, neunikne ti

2. **Klikni na neho**

3. **Otvorí sa ti DLHÝ formulár** - neboj sa, vyplníme ho spolu!

---

## 2.3 LOCATION (Lokalita servera)

**Čo to je:** Vyberáš v ktorej krajine bude tvoj server fyzicky umiestnený.

**Čo uvidíš:** Mapu alebo zoznam miest (Falkenstein, Nuremberg, Helsinki, Ashburn...)

**Čo máš urobiť:**

```
KLIKNI NA: "Falkenstein" (FSN1)

┌─────────────────────────────────────────────────────┐
│  LOCATION                                           │
│                                                     │
│  [Falkenstein]  [Nuremberg]  [Helsinki]  [Ashburn]  │
│   FSN1 - DE      NBG1 - DE    HEL1 - FI   ASH - US  │
│      ↑                                              │
│      │                                              │
│   KLIKNI SEM! (je najbližšie k Slovensku)           │
└─────────────────────────────────────────────────────┘
```

**✅ Po kliknutí by mal byť Falkenstein zvýraznený/označený**

---

## 2.4 IMAGE (Operačný systém)

**Čo to je:** Vyberáš aký operačný systém bude na serveri nainštalovaný.

**Čo uvidíš:** Záložky "OS Images" a "Apps", pod nimi logá systémov (Ubuntu, Debian, Fedora...)

**Čo máš urobiť:**

```
1. KLIKNI na záložku "OS Images" (ak nie je už vybraná)

2. KLIKNI na "Ubuntu" (oranžové logo s kruhom)

3. Zobrazí sa výber verzie:

   ┌─────────────────────────────────────────────────────┐
   │  Ubuntu                                             │
   │                                                     │
   │  Version:  [24.04 ▼]                                │
   │                                                     │
   │  Klikni na šípku a vyber:  22.04                    │
   └─────────────────────────────────────────────────────┘

4. VYBER verziu "22.04" (NIE 24.04!)
```

**✅ Malo by ti ukazovať: Ubuntu 22.04**

---

## 2.5 TYPE (Typ servera - DÔLEŽITÉ!)

**Čo to je:** Vyberáš aký výkonný server chceš (a koľko budeš platiť).

**Čo uvidíš:** Záložky "Shared vCPU" a "Dedicated vCPU", potom "x86" a "Arm64"

**Čo máš urobiť PRESNE v tomto poradí:**

```
KROK 1: Klikni na "Shared vCPU" (zdieľané zdroje - lacnejšie)
        ┌────────────────────────────────────────────┐
        │  [Shared vCPU]      [Dedicated vCPU]       │
        │       ↑                                    │
        │    TOTO!                                   │
        └────────────────────────────────────────────┘

KROK 2: Klikni na "x86 (Intel/AMD)"
        ┌────────────────────────────────────────────┐
        │  [x86 (Intel/AMD)]      [Arm64]            │
        │         ↑                                  │
        │      TOTO!                                 │
        └────────────────────────────────────────────┘

KROK 3: Nájdi a klikni na "CX22"
        ┌────────────────────────────────────────────┐
        │                                            │
        │  CX11        CX22        CX32        CX42  │
        │  €4.35       €5.39       €12.49      ...   │
        │  1 vCPU      2 vCPU      3 vCPU            │
        │  2 GB        4 GB        8 GB              │
        │              ↑                             │
        │           VYBER TENTO!                     │
        │                                            │
        └────────────────────────────────────────────┘
```

**✅ Musí byť vybraté: CX22 za €5.39/mesiac**

**Čo dostaneš:**
- 2 vCPU (dva procesory)
- 4 GB RAM (pamäť)
- 40 GB SSD (disk)
- 20 TB Traffic (prenos dát)

---

## 2.6 NETWORKING (Sieť)

**Čo to je:** Nastavenie siete pre tvoj server.

**Čo uvidíš:** Checkboxy pre IPv4, IPv6, Private networks

**Čo máš urobiť:**

```
┌─────────────────────────────────────────────────────┐
│  NETWORKING                                         │
│                                                     │
│  ☑ Public IPv4  (NECHAJ ZAŠKRTNUTÉ!)               │
│    Cena: €0.0008/h = ~€0.58/mesiac                 │
│                                                     │
│  ☑ Public IPv6  (NECHAJ ZAŠKRTNUTÉ - je zadarmo!) │
│                                                     │
│  ☐ Private networks  (NECHAJ PRÁZDNE)              │
└─────────────────────────────────────────────────────┘
```

**⚠️ IPv4 MUSÍŠ mať zaškrtnuté! Bez toho sa na server nedostaneš!**

---

## 2.7 SSH KEYS (Kľúče)

**Čo to je:** Bezpečnejší spôsob prihlasovania. Pre začiatočníkov zbytočné.

**Čo máš urobiť:**

```
┌─────────────────────────────────────────────────────┐
│  SSH KEYS                                           │
│                                                     │
│  No SSH key selected.                               │
│                                                     │
│  ⚠️ We recommend using an SSH key. Otherwise you   │
│     will receive the root password via email.       │
│                                                     │
│  [Add SSH key]  ← NEKLIKAJ NA TOTO!                │
│                                                     │
│  PRESKOC TÚTO SEKCIU!                              │
│  Heslo ti príde emailom - je to OK pre začiatok.   │
└─────────────────────────────────────────────────────┘
```

**✅ Nerob nič. Pokračuj ďalej.**

---

## 2.8 VOLUMES (Dodatočné disky)

**Čo to je:** Extra úložisko. Nepotrebuješ.

**Čo máš urobiť:**

```
PRESKOC - NEKLIKAJ NA NIČ
```

---

## 2.9 FIREWALLS (Firewall)

**Čo to je:** Ochrana servera. Nastavíme inak, neskôr.

**Čo máš urobiť:**

```
PRESKOC - NEKLIKAJ NA NIČ
```

---

## 2.10 BACKUPS (Zálohy)

**Čo to je:** Automatické zálohy servera. Stojí +20% navyše.

**Čo máš urobiť:**

```
┌─────────────────────────────────────────────────────┐
│  BACKUPS                                            │
│                                                     │
│  ☐ Enable Backups  (+20% = ~€1.08/mesiac navyše)   │
│                                                     │
│  NECHAJ NEZAŠKRTNUTÉ (zatiaľ)                       │
│  Môžeš zapnúť neskôr ak budeš chcieť               │
└─────────────────────────────────────────────────────┘
```

---

## 2.11 PLACEMENT GROUPS, LABELS, CLOUD CONFIG

**Čo máš urobiť:**

```
PRESKOC VŠETKO - NEROB NIČ
```

---

## 2.12 NAME (Názov servera)

**Čo to je:** Ako sa bude tvoj server volať.

**Čo máš urobiť:**

```
┌─────────────────────────────────────────────────────┐
│  NAME                                               │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ scamnemesis-prod                            │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  Vymaž čo tam je a napíš: scamnemesis-prod          │
└─────────────────────────────────────────────────────┘
```

---

## 2.13 VYTVOR SERVER!

1. **Pozri sa napravo** - mal by si vidieť súhrn a cenu:
   ```
   ┌─────────────────────────────┐
   │  SUMMARY                    │
   │                             │
   │  CX22                       │
   │  Ubuntu 22.04               │
   │  Falkenstein                │
   │                             │
   │  €5.39/mo + €0.58 (IPv4)    │
   │  ≈ €5.97/mesiac             │
   │                             │
   │  [CREATE & BUY NOW]  ← TOTO │
   └─────────────────────────────┘
   ```

2. **Klikni na veľké tlačidlo "CREATE & BUY NOW"**

3. **POČKAJ** - server sa vytvára (30-60 sekúnd)

---

## 2.14 📝 ZAPÍŠ SI PRIHLASOVACIE ÚDAJE!!!

**⚠️⚠️⚠️ TOTO JE NAJDÔLEŽITEJŠIE! ⚠️⚠️⚠️**

Po vytvorení servera sa ti zobrazí HESLO:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   ✅ Server created successfully!                   │
│                                                     │
│   IPv4 Address:  123.45.67.89                      │
│                                                     │
│   Root password: xK9#mP2$vL5@nQ8                   │
│                                                     │
│   ⚠️ SAVE THIS PASSWORD NOW!                       │
│      It will not be shown again!                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**📝 OKAMŽITE SI NAPÍŠ NA PAPIER:**

```
IP ADRESA:    ___.___.___.___
ROOT HESLO:   ____________________

(Heslo bude dlhé a divné - prepíš ho PRESNE!)
```

**Heslo ti príde aj emailom, ale ZAPÍŠ SI HO TERAZ!**

---

**✅ Keď vidíš status "Running" - server beží! Pokračuj na KROK 3.**

---

---

---

# 🔌 KROK 3: Pripojenie na server

Teraz sa pripojíme na tvoj nový server. Postup závisí od toho, aký počítač máš.

---

## 🪟 PRE WINDOWS (väčšina ľudí)

### 3.1 Stiahni program PuTTY

1. **Otvor prehliadač**

2. **Choď na stránku:**
   ```
   putty.org
   ```

3. **Klikni na "Download PuTTY"**

4. **Na stránke nájdi "Alternative binary files"** a klikni na odkaz

5. **Stiahni súbor `putty.exe`:**
   - Hľadaj riadok "putty.exe" (64-bit x86)
   - Klikni na odkaz
   - Súbor sa stiahne do priečinka "Stiahnuté súbory" (Downloads)

6. **Nájdi stiahnutý súbor:**
   - Otvor Prieskumník (žltý priečinok v lište)
   - Klikni na "Stiahnuté súbory" alebo "Downloads"
   - Nájdi `putty.exe`

### 3.2 Spusti PuTTY a pripoj sa

1. **Dvojklikom spusti `putty.exe`**

2. **Zobrazí sa okno PuTTY:**
   ```
   ┌─────────────────────────────────────────────────────┐
   │  PuTTY Configuration                                │
   ├─────────────────────────────────────────────────────┤
   │                                                     │
   │  Host Name (or IP address):                         │
   │  ┌─────────────────────────────────────────────┐    │
   │  │                                             │    │
   │  └─────────────────────────────────────────────┘    │
   │                      ↑                              │
   │         SEM NAPÍŠ SVOJU IP ADRESU                   │
   │                                                     │
   │  Port: [22]     ← NEMEŇ!                           │
   │                                                     │
   │  Connection type:                                   │
   │  ● SSH  ○ Telnet  ○ Rlogin  ○ Raw                  │
   │    ↑                                                │
   │  TOTO MUSÍ BYŤ VYBRATÉ                              │
   │                                                     │
   │                    [Open]    ← POTOM KLIKNI SEM    │
   └─────────────────────────────────────────────────────┘
   ```

3. **Do poľa "Host Name" napíš svoju IP adresu** (čo si si zapísal)
   - Príklad: `123.45.67.89`

4. **Skontroluj:**
   - Port je `22`
   - Connection type je `SSH`

5. **Klikni na tlačidlo "Open"**

### 3.3 Prvé pripojenie - bezpečnostné upozornenie

1. **Zobrazí sa varovanie "PuTTY Security Alert":**
   ```
   ┌─────────────────────────────────────────────────────┐
   │  PuTTY Security Alert                               │
   │                                                     │
   │  The host key is not cached...                      │
   │  blah blah blah...                                  │
   │                                                     │
   │  [Yes]    [No]    [Cancel]                         │
   │    ↑                                                │
   │  KLIKNI "Yes"                                       │
   └─────────────────────────────────────────────────────┘
   ```

2. **Klikni "Yes"** (Áno) - toto je normálne pri prvom pripojení

### 3.4 Prihlásenie

1. **Zobrazí sa čierne okno terminálu:**
   ```
   ┌─────────────────────────────────────────────────────┐
   │                                                     │
   │  login as: _                                        │
   │                                                     │
   └─────────────────────────────────────────────────────┘
   ```

2. **Napíš:**
   ```
   root
   ```

3. **Stlač Enter**

4. **Zobrazí sa:**
   ```
   root@123.45.67.89's password: _
   ```

5. **Napíš svoje ROOT HESLO** (čo si si zapísal z Hetzner)

   **⚠️ POZOR:** Pri písaní hesla sa NIČ NEZOBRAZUJE - žiadne hviezdičky, nič!
   To je normálne! Píš "naslepo" a potom stlač Enter.

6. **Stlač Enter**

### 3.5 Si pripojený!

**✅ Keď vidíš toto, si pripojený:**
```
root@scamnemesis-prod:~# _
```

**Toto je príkazový riadok tvojho servera. Odtiaľto budeš písať príkazy.**

---

## 🍎 PRE MAC

### 3.1 Otvor Terminál

1. **Stlač Command + Medzerník** (otvorí Spotlight)

2. **Napíš:**
   ```
   Terminal
   ```

3. **Stlač Enter**

4. **Otvorí sa čierne/biele okno terminálu**

### 3.2 Pripoj sa na server

1. **Napíš tento príkaz** (nahraď IP_ADRESA svojou IP):
   ```
   ssh root@IP_ADRESA
   ```

   Príklad:
   ```
   ssh root@123.45.67.89
   ```

2. **Stlač Enter**

3. **Ak sa opýta "Are you sure you want to continue connecting (yes/no)?":**
   - Napíš: `yes`
   - Stlač Enter

4. **Napíš svoje heslo** (nič sa nezobrazuje - je to normálne!)

5. **Stlač Enter**

### 3.3 Si pripojený!

**✅ Keď vidíš:**
```
root@scamnemesis-prod:~#
```

---

---

---

# ⚙️ KROK 4: Inštalácia potrebného softvéru

**Teraz budeš kopírovať príkazy a vkladať ich do terminálu.**

### Ako vložiť text do terminálu:

- **PuTTY (Windows):** Pravý klik myšou = vloží text
- **Mac Terminal:** Command + V

---

## 4.1 Aktualizuj systém

**Skopíruj tento príkaz** (označ ho a Ctrl+C):
```bash
apt update && apt upgrade -y
```

**Vlož ho do terminálu** a stlač **Enter**

**Čo sa deje:** Systém sa aktualizuje. Uvidíš veľa textu.

**Čakaj** kým sa dokončí (2-5 minút). Keď znova uvidíš `root@...:~#`, je hotovo.

**Ak sa opýta:** "Do you want to continue? [Y/n]" - napíš `Y` a stlač Enter

---

## 4.2 Nainštaluj základné nástroje

**Skopíruj a spusti:**
```bash
apt install -y curl wget git nano ufw
```

**Čakaj** kým sa dokončí.

---

## 4.3 Nainštaluj Docker

**Skopíruj a spusti:**
```bash
curl -fsSL https://get.docker.com | bash
```

**Čakaj** (1-3 minúty). Uvidíš veľa textu ako sa Docker inštaluje.

---

## 4.4 Over že Docker funguje

**Spusti:**
```bash
docker --version
```

**✅ Mal by si vidieť niečo ako:**
```
Docker version 24.0.7, build afdd53b
```

**Spusti:**
```bash
docker compose version
```

**✅ Mal by si vidieť:**
```
Docker Compose version v2.21.0
```

---

## 4.5 Nastav firewall (ochrana servera)

**Spusti tieto príkazy jeden po druhom:**

```bash
ufw default deny incoming
```

```bash
ufw default allow outgoing
```

```bash
ufw allow ssh
```

```bash
ufw allow http
```

```bash
ufw allow https
```

```bash
ufw --force enable
```

**✅ Mal by si vidieť:**
```
Firewall is active and enabled on system startup
```

---

**✅ HOTOVO! Docker je nainštalovaný, firewall nastavený.**

---

---

---

# 🌐 KROK 5: Nastavenie domény

**Tvoja doména je na Websupport. Teraz ju nasmeruješ na tvoj Hetzner server.**

---

## 5.1 Otvor Websupport administráciu

1. **Otvor novú záložku v prehliadači**

2. **Choď na:**
   ```
   admin.websupport.sk
   ```

3. **Prihlás sa** svojím Websupport účtom

---

## 5.2 Nájdi DNS nastavenia

1. **V ľavom menu klikni na "Domény"**

2. **Klikni na svoju doménu** (napr. scamnemesis.sk)

3. **Klikni na záložku "DNS záznamy"** alebo "DNS"

---

## 5.3 Pridaj DNS záznamy

Teraz pridáš 3 záznamy. Opakuj tento postup 3x:

### ZÁZNAM 1: Hlavná doména

1. **Klikni na "Pridať záznam"** (alebo "+ Add" alebo podobné)

2. **Vyplň:**
   ```
   Typ:      A
   Názov:    @        (zavináč alebo nechaj prázdne)
   Hodnota:  123.45.67.89   (TVOJA IP Z HETZNER!)
   TTL:      3600     (alebo "1 hodina")
   ```

3. **Klikni "Uložiť"**

---

### ZÁZNAM 2: WWW subdoména

1. **Klikni na "Pridať záznam"**

2. **Vyplň:**
   ```
   Typ:      A
   Názov:    www
   Hodnota:  123.45.67.89   (TVOJA IP!)
   TTL:      3600
   ```

3. **Klikni "Uložiť"**

---

### ZÁZNAM 3: WordPress subdoména

1. **Klikni na "Pridať záznam"**

2. **Vyplň:**
   ```
   Typ:      A
   Názov:    wp
   Hodnota:  123.45.67.89   (TVOJA IP!)
   TTL:      3600
   ```

3. **Klikni "Uložiť"**

---

## 5.4 Skontroluj záznamy

**Mal by si teraz vidieť 3 nové A záznamy:**

```
┌─────────────────────────────────────────────────────┐
│  Typ    Názov    Hodnota           TTL              │
├─────────────────────────────────────────────────────┤
│  A      @        123.45.67.89      3600             │
│  A      www      123.45.67.89      3600             │
│  A      wp       123.45.67.89      3600             │
└─────────────────────────────────────────────────────┘
```

---

## 5.5 Počkaj na propagáciu

**DNS zmeny potrebujú čas** - zvyčajne 5-30 minút, niekedy až 2 hodiny.

**Môžeš skontrolovať** v termináli (na serveri):
```bash
ping tvojadomena.sk -c 3
```

**✅ Keď uvidíš svoju IP adresu, DNS funguje:**
```
PING tvojadomena.sk (123.45.67.89) ...
```

---

---

---

# 📥 KROK 6: Stiahnutie Scamnemesis

Vráť sa do terminálu (PuTTY alebo Mac Terminal).

---

## 6.1 Vytvor priečinok pre projekt

**Spusti:**
```bash
mkdir -p /var/www
```

```bash
cd /var/www
```

---

## 6.2 Stiahni projekt z GitHub

**Spusti:**
```bash
git clone https://github.com/cryptotrust1/Scamnemesis.git
```

**Počkaj** kým sa stiahne.

**Potom spusti:**
```bash
cd Scamnemesis
```

---

## 6.3 Over že sa stiahlo

**Spusti:**
```bash
ls -la
```

**✅ Mal by si vidieť zoznam súborov** (docker-compose.yml, package.json, atď.)

---

---

---

# 🔧 KROK 7: Nastavenie konfigurácie

---

## 7.1 Vytvor konfiguračný súbor

**Spusti:**
```bash
cp .env.example .env
```

---

## 7.2 Otvor editor

**Spusti:**
```bash
nano .env
```

**Otvorí sa textový editor** - vyzerá ako poznámkový blok v termináli.

---

## 7.3 Uprav hodnoty

Použi šípky na klávesnici na pohyb. Nájdi a zmeň tieto hodnoty:

**⚠️ NAHRAĎ hodnoty svojimi vlastnými!**

```bash
# TVOJA DOMÉNA (zmeň!)
DOMAIN=tvojadomena.sk

# DATABÁZA - ZMEŇ HESLO!
POSTGRES_PASSWORD=TvojeSuperTajneHeslo123!

# BEZPEČNOSTNÉ KĽÚČE - ZMEŇ!
JWT_SECRET=nieco-dlhe-a-nahodne-aspon-32-znakov-1234567890
JWT_REFRESH_SECRET=iny-dlhy-nahodny-text-abcdefgh-9876543210

# EMAIL PRE SSL (tvoj email!)
ACME_EMAIL=tvoj@email.sk

# OSTATNÉ HESLÁ - ZMEŇ!
TYPESENSE_API_KEY=ZmenNaNiecoNahodne456
S3_SECRET_KEY=TajneHesloPreUlozisko789
WP_DB_PASSWORD=HesloPreWordpress321
```

---

## 7.4 Ulož a zatvor editor

1. **Stlač Ctrl + O** (uložiť)
2. **Stlač Enter** (potvrdiť)
3. **Stlač Ctrl + X** (zatvoriť)

---

---

---

# 🐳 KROK 8: Spustenie aplikácie

---

## 8.1 Spusti Docker Compose

**Spusti:**
```bash
docker compose -f docker-compose.prod.yml up -d
```

**⏳ ČAKAJ!** Toto môže trvať 5-15 minút!

Docker sťahuje všetky potrebné komponenty. Uvidíš veľa textu.

---

## 8.2 Skontroluj či všetko beží

**Spusti:**
```bash
docker compose -f docker-compose.prod.yml ps
```

**✅ Všetky služby by mali mať STATUS "Up":**
```
NAME                       STATUS
scamnemesis-traefik        Up
scamnemesis-app            Up
scamnemesis-postgres       Up
scamnemesis-redis          Up
scamnemesis-wordpress      Up
...
```

---

**✅ APLIKÁCIA BEŽÍ!**

---

---

---

# 🌍 KROK 9: Nastavenie WordPress

---

## 9.1 Otvor WordPress

1. **Otvor prehliadač**
2. **Choď na:** `https://wp.tvojadomena.sk`

---

## 9.2 Dokonči inštaláciu

1. **Vyber jazyk:** Slovenčina
2. **Klikni "Pokračovať"**
3. **Vyplň:**
   - Názov stránky: `Scamnemesis`
   - Používateľské meno: `admin`
   - Heslo: (vymysli a ZAPÍŠ SI!)
   - Email: tvoj@email.sk
4. **Klikni "Inštalovať WordPress"**

---

## 9.3 Aktivuj plugin

1. **Prihlás sa do WordPress**
2. **Klikni "Pluginy"** (v ľavom menu)
3. **Nájdi "Scamnemesis"**
4. **Klikni "Aktivovať"**

---

---

---

# ✅ KROK 10: Otestuj všetko

---

## 10.1 Skontroluj hlavnú stránku

**Otvor:** `https://tvojadomena.sk`

**✅ Mala by sa zobraziť Scamnemesis aplikácia**

---

## 10.2 Skontroluj WordPress

**Otvor:** `https://wp.tvojadomena.sk`

**✅ Mal by si vidieť WordPress**

---

## 10.3 Skontroluj HTTPS

**V prehliadači by si mal vidieť 🔒 zámok** vedľa adresy.

---

---

---

# 🆘 RIEŠENIE PROBLÉMOV

## "Connection refused" alebo stránka nejde

```bash
docker compose -f docker-compose.prod.yml restart
```

## SSL certifikát nefunguje

Počkaj 15-30 minút (DNS propagácia) a potom:
```bash
docker compose -f docker-compose.prod.yml restart traefik
```

## Chcem vidieť čo sa deje (logy)

```bash
docker compose -f docker-compose.prod.yml logs -f
```
(Ctrl+C pre ukončenie)

## Reštart všetkého

```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

---

---

---

# 🎉 HOTOVO!

**Gratulujem! Máš bežiaci:**

- ✅ Server na Hetzner (€5.39/mesiac)
- ✅ Hlavnú aplikáciu na `https://tvojadomena.sk`
- ✅ WordPress na `https://wp.tvojadomena.sk`
- ✅ SSL certifikát (HTTPS)
- ✅ Databázu, cache, vyhľadávanie, úložisko

---

**Celkové náklady: ~€6/mesiac**

---

*Vytvorené: December 2024*
*Pre: Hetzner Cloud CX22 + Ubuntu 22.04*
