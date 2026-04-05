import json
from openai import OpenAI

from server.scraper import scrape_posts_with_comments, get_hot_posts, fetch_top_comments

"""
OpenAI-powered chatbot with live Reddit RAG.

Flow:
1. Extract keywords from user message using GPT
2. Search subreddit for relevant posts using those keywords
3. Fetch top comments from matching posts
4. Build context and generate a response as the subreddit's personality
"""


def extract_keywords(message, openai_key):
    """
    Use OpenAI to extract 2-4 search keywords from user's message.
    """
    client = OpenAI(api_key=openai_key)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "Extract 2-4 concise search keywords from the user's message "
                    "that would be useful for searching Reddit posts. "
                    "Return ONLY the keywords separated by spaces, nothing else. "
                    "Do not include common words like 'what', 'how', 'the', etc."
                ),
            },
            {"role": "user", "content": message},
        ],
        max_tokens=50,
        temperature=0.3,
    )

    keywords = response.choices[0].message.content.strip()
    return keywords


def build_context(posts):
    """
    Build a context string from scraped posts and their comments.
    """
    if not posts:
        return "No relevant posts were found."

    context_parts = []
    for i, post in enumerate(posts[:20], 1):
        part = f"POST {i}: {post['title']}"
        if post.get("selftext"):
            part += f"\nBody: {post['selftext']}"
        if post.get("comments"):
            part += "\nTop comments:"
            for j, comment in enumerate(post["comments"], 1):
                part += f"\n  {j}. {comment}"
        part += f"\n(Score: {post['score']}, Comments: {post['num_comments']})"
        context_parts.append(part)

    return "\n\n".join(context_parts)


def generate_response(message, subreddit_name, openai_key, chat_history=None):
    """
    Full RAG pipeline:
    1. Extract keywords from message
    2. Scrape relevant Reddit posts
    3. Generate response using posts as context

    Returns (response_text, keywords_used)
    """
    client = OpenAI(api_key=openai_key)

    # Step 1: Extract keywords
    keywords = extract_keywords(message, openai_key)

    # Step 2: Scrape subreddit for relevant posts
    posts = scrape_posts_with_comments(
        subreddit_name, keywords, limit=20, comments_per_post=3
    )

    # If keyword search returns few results, supplement with hot posts
    if len(posts) < 5:
        hot = get_hot_posts(subreddit_name, limit=10)
        for p in hot:
            p["comments"] = fetch_top_comments(subreddit_name, p["id"], limit=2)
        existing_ids = {p["id"] for p in posts}
        for p in hot:
            if p["id"] not in existing_ids:
                posts.append(p)

    # Step 3: Build context
    context = build_context(posts)

    # Step 4: Build conversation messages
    system_prompt = (
        f"You are a chatbot that embodies the collective personality of r/{subreddit_name}. "
        f"You speak as if you are a typical, passionate member of r/{subreddit_name}. "
        f"Your opinions, tone, humor, and knowledge reflect what users of that subreddit "
        f"would typically say. You reference real discussions happening in the subreddit.\n\n"
        f"Use the following recent posts and comments from r/{subreddit_name} as your "
        f"knowledge base. Draw from them naturally in conversation — reference specific "
        f"discussions, opinions, and themes without quoting them verbatim.\n\n"
        f"IMPORTANT RULES:\n"
        f"- Stay in character as a r/{subreddit_name} community member at all times\n"
        f"- Be conversational, not robotic\n"
        f"- If the posts don't cover the topic, still respond in character but mention "
        f"you haven't seen much discussion about it on the subreddit\n"
        f"- Keep responses concise (2-4 sentences unless more detail is needed)\n\n"
        f"--- SUBREDDIT CONTEXT ---\n{context}"
    )

    messages = [{"role": "system", "content": system_prompt}]

    # Add chat history for multi-turn conversation
    if chat_history:
        for entry in chat_history[-10:]:  # last 10 messages for context
            role = "user" if entry.get("role") == "user" else "assistant"
            messages.append({"role": role, "content": entry["content"]})

    messages.append({"role": "user", "content": message})

    # Step 5: Generate response
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        max_tokens=500,
        temperature=0.8,
    )

    reply = response.choices[0].message.content.strip()
    return reply, keywords
