<img width="700" alt="logo" src="client/public/logo.png">

**Talk to a Subreddit** is an AI chatbot that lets you talk to any subreddit on Reddit as if it were a person. Powered by **OpenAI GPT** with a live **RAG (Retrieval-Augmented Generation)** pipeline that scrapes Reddit in real-time.

Enter your OpenAI API key, pick any subreddit, and start chatting. The bot extracts keywords from your messages, searches the subreddit for relevant posts, and generates responses that embody the collective personality of that community.

### [Launch Website](https://talkreddit.apps.johnseong.com)

---

## How It Works

1. **You type a message** to the chatbot
2. **Keywords are extracted** from your message using GPT
3. **Reddit is searched** for the top 20 relevant posts in your chosen subreddit (via web scraping, no Reddit API key needed)
4. **Top comments are fetched** from each post
5. **GPT generates a response** using all that context, speaking as a typical member of the subreddit

This is a full **RAG pipeline** — the chatbot's knowledge is always live and up-to-date with current subreddit discussions.

---

## Features

- **Any Subreddit**: Type in any subreddit name — not limited to a predefined list
- **Live Data**: Every response pulls fresh data from Reddit in real-time
- **Subreddit Personality**: The bot adopts the tone, opinions, and humor of the community
- **Multi-turn Conversation**: Chat history is maintained for contextual follow-ups
- **Your API Key**: Bring your own OpenAI key — it's never stored on our servers
- **3D Character**: Interactive Three.js character on the landing page

---

## Dependencies

### Server

- Flask + Flask-SocketIO
- OpenAI Python SDK
- Requests (Reddit web scraping)

### Client

- React
- Three.js / React Three Fiber
- Redux Toolkit
- Chakra UI
- Socket.IO Client
- Tailwind CSS

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 16+
- An OpenAI API key (get one at [platform.openai.com](https://platform.openai.com))

### Setup

```bash
# Install backend dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd client && npm install

# Run the development server
cd .. && python run.py
```

In a separate terminal:
```bash
cd client && npm start
```

The app will be available at `http://localhost:3000` (frontend) proxying to `http://localhost:5000` (backend).

---

## Architecture

```
User Message
  → OpenAI: Extract Keywords
  → Reddit Web Scraper: Search subreddit for top 20 posts
  → Fetch top comments per post
  → OpenAI GPT: Generate response with subreddit context
  → Stream response back via SocketIO
```

No Reddit API credentials required — uses Reddit's public JSON endpoints.
