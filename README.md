# CryptoLab – Paper Crypto Trading API

CryptoLab is a paper trading platform for cryptocurrencies.  
It allows users to register, authenticate, view live market prices, and simulate buy/sell trades without using real money.

This backend is built as part of a bachelor exam project and focuses on:
- REST API design
- Authentication with JWT
- Real-time market data via WebSockets
- MongoDB persistence
- Clean architecture with modules and validation

---

## 🚀 Features

- User registration & login (JWT auth)
- Portfolio & positions
- Paper trading (buy / sell crypto)
- Live price feed (Finnhub WebSocket proxy)
- Market history (Binance candles)
- Favorites / watchlist per user
- Swagger API documentation

---

## 🧱 Tech Stack

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT authentication
- WebSockets (Finnhub)
- Joi validation
- Swagger (OpenAPI)

---

## ⚙️ Setup

### 1. Install dependencies

npm install

### 2. RUN

npm run dev