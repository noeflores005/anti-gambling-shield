# 🛡️ Anti-Gambling Shield

A Chrome extension that blocks 5,000+ gambling and sports betting sites to help users stay protected and accountable.

## Features

- **5,200+ sites blocked** — casinos, sportsbooks, DFS platforms, poker, crypto betting, horse racing, lottery
- **Two blocking modes** — Strict (hard block) or Soft (warning overlay with override option)
- **Auto-updates** — Community blocklist refreshed weekly from GitHub
- **Custom lists** — Add your own domains to block or whitelist
- **Clean UI** — Stats, easy toggle, one-click update

## Installation

1. **Download** — Extract/clone this folder to your computer

2. **Open Chrome Extensions** — Navigate to `chrome://extensions/`

3. **Enable Developer Mode** — Toggle switch in the top-right corner

4. **Load Extension** — Click "Load unpacked" and select the `anti-gambling-extension` folder

5. **Done!** — The extension auto-fetches the full blocklist on first load (10–15 seconds). You'll see the shield icon in your toolbar.

## Usage

Click the shield icon in Chrome's toolbar to:
- Toggle protection ON/OFF
- Switch between **Strict** (network-level block) and **Soft** (warning overlay) mode
- View stats: sites blocked, domains protected, last update
- Manually refresh the blocklist
- Add custom domains to block or whitelist

## Blocking Coverage

| Category | Examples |
|----------|---------|
| US Sportsbooks | FanDuel, DraftKings, BetMGM, Caesars, BetRivers |
| DFS Platforms | PrizePicks, Underdog, Sleeper, Betr, Boom |
| Offshore Books | Bovada, BetOnline, MyBookie, XBet |
| International | Bet365, Betway, Betfair, William Hill, Paddy Power |
| Online Casinos | PokerStars, 888, Casumo, LeoVegas, Party |
| Crypto Betting | Stake, Roobet, Cloudbet, Sportsbet.io, BC.Game |
| Horse Racing | TwinSpires, TVG, NYRABets, XpressBet |
| Lottery | Lottoland, TheLotter, Jackpot.com |

## Files

```
anti-gambling-extension/
├── manifest.json        # Chrome extension config (MV3)
├── background.js        # Service worker — blocking rules + updates
├── content.js           # Soft mode warning overlay
├── popup.html           # Extension popup UI
├── popup.js             # Popup logic
├── rules/
│   └── gambling_rules.json  # Static declarativeNetRequest rules (initially empty)
└── icons/               # Extension icons
```

## Technical Details

- **Manifest V3** with `declarativeNetRequest` API for efficient, battery-friendly blocking
- Blocklist sourced from [nicehash/blocklists](https://github.com/nicehash/blocklists) + 200+ built-in domains
- Up to 4,999 dynamic rules applied (Chrome limit)
- Settings persist via `chrome.storage.local`
- Weekly auto-update via `chrome.alarms`

## Need Help?

**National Council on Problem Gambling**  
📞 1-800-522-4700 (24/7 Helpline)  
🌐 [ncpgambling.org](https://www.ncpgambling.org/)
