# HYDRA Engage & Earn

Create a website called "HydraTrack" — a social engagement rewards platform for the HYDRA ecosystem on Radix DLT. The entire site must be in English.

CONCEPT:
HydraTrack tracks and rewards users with $HYDR tokens for completing social and on-chain engagement tasks related to the HYDRA ecosystem (a memecoin battle game project on Radix).

CORE FEATURES:

1. User Dashboard
- Wallet connect button (Radix Wallet Connector integration)
- Display connected wallet address, total $HYDR earned, and completion progress bar
- Task history log showing completed vs. pending tasks with reward amount per task

2. Task/Quest System with Links, Completion Criteria, and $HYDR Reward Values:

Social Media Tasks (50 $HYDR each):
- Follow HYDRA on X (Twitter) → https://x.com/hydraxrd — 50 $HYDR
- Follow HYDRA on Instagram → https://www.instagram.com/hydraxrd — 50 $HYDR
- Follow HYDRA on TikTok → https://www.tiktok.com/@hydraxrd — 50 $HYDR
- Join the HYDRA Telegram group → https://t.me/hydraxrd — 50 $HYDR
- Like and Share a specific X post → https://x.com/hydraxrd — 50 $HYDR
- Comment on a specific X post → https://x.com/hydraxrd — 50 $HYDR

On-Chain & Game Tasks:
- Buy 1,000,000 $HYDR tokens on HydraSwap → https://hydraxrd.com/swap — reward: 1000 $HYDR
- Stake 100,000 $HYDR on DefiPlaza → link to DefiPlaza staking page for $HYDR — reward: 1000 $HYDR
- Burn 100,000 $HYDR tokens → https://hydraxrd.com/burn — reward: 1000 $HYDR
- Use HydraBubbles tool → https://hydraxrd.com/bubbles — reward: 100 $HYDR
- Win the Final Battle in Battle Arena game → https://hydraxrd.com/battlearena — reward: 250 $HYDR

Each task card must include: icon, title, short description with exact requirement, clickable external link (opens in new tab) to the destination above, reward badge (e.g., "+1000 $HYDR"), and a "Verify" or "Complete" button.

3. Verification Logic
- Social tasks: open the corresponding link, then manual "I've done this" confirmation, or API-based verification via X API where available
- Buy task: verify via Radix Gateway API that the connected wallet purchased/holds at least 1,000,000 $HYDR from https://hydraxrd.com/swap
- Stake task: verify via Radix Gateway API an active stake position of at least 100,000 $HYDR on DefiPlaza
- Burn task: verify via Radix Gateway API that the wallet executed a burn transaction totaling at least 100,000 $HYDR via https://hydraxrd.com/burn
- HydraBubbles task: verify usage via Radix Gateway API transaction history from https://hydraxrd.com/bubbles
- Battle Arena task: verify "Final Battle Won" status via Battle Arena's game API at https://hydraxrd.com/battlearena, or manual confirmation if no API exists
- Status indicators: "Not Started" / "Pending Verification" / "Completed" ✅ + reward $HYDR amount displayed on completion

4. Rewards & Leaderboard
- Running total of $HYDR earned per user, displayed prominently on the dashboard
- Public leaderboard ranking top users by total $HYDR earned
- Optional badge/tier system (Bronze, Silver, Gold) based on total $HYDR accumulated

5. Design & Branding
- Modern, crypto-native dark theme with HYDRA brand colors (purple/teal gradient accents)
- Hero section with HydraTrack logo, tagline ("Engage. Earn. Grow with HYDRA."), and a "Connect Wallet" CTA
- Footer with all official HYDRA social links (X, Instagram, TikTok, Telegram) and official site link (https://hydraxrd.com)
- Responsive, mobile-first layout
- Micro-animations for task completion (checkmark + "+X $HYDR" popup)

TECH REQUIREMENTS:
- Built with React + Vite, deployable on Vercel
- Radix Wallet Connector for wallet authentication
- Integration placeholders for Radix Gateway API (on-chain verification) and Battle Arena game API (Final Battle verification)
- Clean component structure: Navbar, Dashboard, TaskCard, Leaderboard, Footer
- Store user progress and $HYDR balances in Supabase, linked to wallet address

PAGES:
1. Landing page (hero, project explanation, official links, CTA to connect wallet)
2. Dashboard (task list with links, requirements, and reward values, progress, total $HYDR earned)
3. Leaderboard (top users ranked by total $HYDR earned)
4. About/FAQ (explain the HYDRA ecosystem: HydraSwap, Battle Arena, HydraBubbles, DefiPlaza staking, with official links)
Use como base: www.hydraxrd.com
All text, buttons, and content must be written in English throughout the entire website.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9e3661a8-aa13-463e-ad92-a71d90928cfd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
