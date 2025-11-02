# 🎮 Illuminate Game  
### Civilization: Rise of Power  
**Genre:** Real-time Online Strategy (RTS), Civilization Builder  
**Platform:** Web / Mobile (React Frontend + Node.js Backend)  
**Perspective:** Vertical (mobile-first), side-scrolling battlefield  
**Multiplayer:** Fully Online (Real-time PvP)

---

## 🌟 Overview
**Illuminate Game** is an ambitious real-time strategy game where you guide your civilization from the **Stone Age** to the **Missile Age**.  
Inspired by *Clash of Clans* and *Stick Empires*, the game blends **city-building progression** with **real-time PvP combat**.

Players construct buildings, research technologies, manage resources, and command armies in battles that evolve with each era.  
Each civilization’s path is unique—driven by player choices in economy, science, and politics.

This version represents the **MVP (Minimum Viable Product)** of the game, developed under the AI project **Jules** 🤖.

---

## 🔷 1. Core Concept
- Begin with a primitive civilization in the **Stone Age**.  
- Build structures, gather resources, and unlock technologies.  
- Evolve through eras: Stone → Iron → Siege → Industrial → Aerospace → Missile.  
- Customize your civilization’s philosophy and tech path.  
- Engage in **real-time online PvP battles** with players across the world.  
- Victories reward resources, XP, and even enemy technologies.

---

## 🔷 2. Civilization Growth Stages

| Era | Prerequisite | Focus | Key Buildings | Units |
|-----|--------------|--------|----------------|--------|
| **Stone Age** | Game start | Survival, basic resources | Farm, House, Fence | Spearmen |
| **Iron Age** | Iron Mine + Smelting | Early Weapons | Sword Workshop, Forge | Swordsman |
| **Siege Age** | Engineering Research | Heavy Warfare | Catapult Workshop | Catapult |
| **Industrial Age** | Science Academy + Metallurgy | Mass Production | Factory, Artillery | Cannon, Modern Soldier |
| **Aerospace Age** | Aerospace Research Lab | Advanced Tech | Runway, Lab | B-2 Bomber, BlackBird |
| **Missile Age** | Missile Tech + Chemical Industry | Long-range Weapons | Missile Base, Defense System | Sajil, Khorramshahr, Kheibarshkan |

---

## 🔷 3. Key Systems

### 🏗️ Buildings & Tech Paths
Buildings unlock along branching technology paths:

| Building | Prerequisite | Effect | Unlocks |
|-----------|--------------|---------|----------|
| Iron Mine | — | Extract metal resources | Metal Military Path |
| Smelting Plant | Iron Mine | Convert ore to ingots | Sword Workshop |
| Sword Workshop | Smelting Plant | Produce early weapons | Swordsman |
| Siege Workshop | Engineering Research | Build siege tools | Catapult |
| Factory | Mines + Power | Produce modern weapons | Cannon & Firearms |
| Aerospace Lab | Academy + Factory | Research aircraft | BlackBird / B-2 |
| Missile Base | Chemical Industry + Launch Research | Produce missiles | Advanced Missiles |
| Propaganda Center | Media + Politics | Increase loyalty | Political influence |
| University | Basic Education + Resources | Increase literacy | Science Path |

---

## 🔷 4. Resources & Stats

| Resource / Stat | Description | Modified By |
|------------------|-------------|--------------|
| 💰 **Coin** | Currency for construction/upgrades | Farm, Factory |
| 💎 **Diamond** | Premium currency | Quests, microtransactions |
| 👥 **Population** | Human workforce | Houses, Food |
| 📚 **Literacy** | Scientific awareness | Schools, University |
| ⚖️ **Loyalty** | Allegiance to government | Temples, Propaganda |
| 😊 **Satisfaction** | Happiness level | Welfare, Food |
| 💀 **Mortality** | Death rate (negative) | Hospitals, Clinics |
| 🛡️ **Military Power** | Army strength | Active units |
| 🧠 **XP** | Civilization experience | Any success or battle |

---

## 🔷 5. Units & Cards

| Card Type | Prerequisite | Role | Description |
|------------|---------------|------|--------------|
| 🪓 Spearmen | Stone Age | Melee | Basic frontline unit |
| ⚔️ Swordsman | Sword Workshop | Melee | Strong, medium speed |
| 🪨 Catapult | Siege Workshop | Siege | Long range, slow |
| 💣 Cannon | Factory | Weapon | High damage, limited |
| 🛩️ BlackBird | Aerospace Lab | Air Unit | Fast, long range |
| ✈️ B-2 Bomber | Aerospace + Stealth | Air Unit | Heavy bombing |
| 🚀 Missiles (Sajil, Khorramshahr, Kheibarshkan) | Missile Base | Long-range Weapon | Devastating base attacks |
| 👤 Proxy Forces | Politics + Resources | Special Unit | Political influence required |

---

## 🔷 6. Battle System
- Real-time **PvP battles** between civilizations.  
- Units are represented as **cards**.  
- Server handles all combat logic and synchronization.  
- Features:
  - Defense systems (e.g., S-300)
  - Air & ground combat
  - Dynamic system messages (`"Enemy attacks with B-2 Bomber"`)
- Battle results:
  - XP gain  
  - Looted resources  
  - Chance to **steal enemy technologies**

---

## 🔷 7. UI / UX Summary
- **Vertical mobile layout**
- **Horizontal scroll** between bases  
- **Top HUD:** Selected card stats (Power, Range, Speed, Energy)  
- **Bottom Bar:** Player cards (max 5)  
- **Gestures:**
  - Swipe → Move camera  
  - Tap → Select  
  - Long press → Show card details  

---

## 🔷 8. Social & Political Systems
- **Temples** → Increase loyalty  
- **Propaganda Centers** → Influence populations  
- **Schools** → Boost literacy, reduce loyalty  
- Future features: revolutions, alliances, cultural domination

---

## 🔷 9. Server Architecture
- **Server-authoritative** (prevents cheating)
- **WebSocket Events:**
  - `battle_start`, `battle_action`, `battle_state_update`, `battle_result`, `unlocks_update`
- **Matchmaking:**
  - Direct (invite player)
  - Public queue (random)
- **Tech Unlock Flow:**
  - Player action → server updates → new cards unlocked

---

## 🔷 10. MVP Scope

| Phase | Features |
|--------|-----------|
| **MVP** | Online building, unlocks, real-time battles, simple HUD |
| **Beta** | Political propaganda, alliances |
| **Full Game** | Colonization, revolutions, alliances, dynamic economy |

---

## 💡 Project Info
**Developed by:** Jules (AI Autonomous Agent)  
**Repository:** [`illuminate_game`](https://github.com/ariaxcpm/illuminate_game)  
**Created from:** Prototype files originally in `badBobots-demo/frontend`

---

## 🚀 Status
This is the **first MVP release** of *Illuminate Game*.  
Future versions will introduce advanced political mechanics, dynamic economy, and deeper AI-driven civilization growth.

---

🧠 *"Every civilization starts with fire — only some learn how to control it."*
