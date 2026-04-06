import re
import random
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from server.scraper import scrape_posts_with_comments, get_hot_posts, fetch_top_comments

"""
Lightweight on-device chatbot using TF-IDF retrieval.
No API keys, no LLMs — just cosine similarity over scraped Reddit content.

Flow:
1. Extract keywords from user message (stopword removal)
2. Scrape subreddit for relevant posts
3. TF-IDF match user message against all comments
4. Return the best-matching comments as a conversational response
"""

STOPWORDS = {
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your",
    "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her",
    "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs",
    "themselves", "what", "which", "who", "whom", "this", "that", "these", "those",
    "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if",
    "or", "because", "as", "until", "while", "of", "at", "by", "for", "with",
    "about", "against", "between", "through", "during", "before", "after", "above",
    "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under",
    "again", "further", "then", "once", "here", "there", "when", "where", "why",
    "how", "all", "both", "each", "few", "more", "most", "other", "some", "such",
    "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s",
    "t", "can", "will", "just", "don", "should", "now", "d", "ll", "m", "o", "re",
    "ve", "y", "ain", "aren", "couldn", "didn", "doesn", "hadn", "hasn", "haven",
    "isn", "ma", "mightn", "mustn", "needn", "shan", "shouldn", "wasn", "weren",
    "won", "wouldn", "hey", "hi", "hello", "yeah", "yes", "no", "ok", "okay",
    "please", "thanks", "thank", "like", "really", "think", "know", "want", "get",
    "got", "would", "could", "also", "much", "many", "well", "even", "still",
    "tell", "say", "said", "go", "going", "went", "come", "make", "made",
}


def extract_keywords(message):
    """Extract search keywords by removing stopwords. Pure string ops, no libraries."""
    words = re.findall(r'[a-zA-Z]+', message.lower())
    keywords = [w for w in words if w not in STOPWORDS and len(w) > 2]
    # If everything got filtered, fall back to longest words
    if not keywords:
        words_by_len = sorted(set(re.findall(r'[a-zA-Z]+', message.lower())), key=len, reverse=True)
        keywords = words_by_len[:3]
    return " ".join(keywords[:5])


def _collect_texts(posts):
    """
    Collect all comment texts and post titles from scraped posts.
    Returns (texts, sources) where sources[i] describes where texts[i] came from.
    """
    texts = []
    sources = []

    for post in posts:
        # Add the post title + body as a candidate
        title_text = post["title"]
        if post.get("selftext"):
            title_text += " " + post["selftext"]
        texts.append(title_text)
        sources.append({
            "type": "post",
            "title": post["title"],
            "text": title_text,
            "score": post.get("score", 0),
        })

        # Add each comment as a candidate
        for comment in post.get("comments", []):
            if len(comment.strip()) > 15:  # skip very short comments
                texts.append(comment)
                sources.append({
                    "type": "comment",
                    "title": post["title"],
                    "text": comment,
                    "score": post.get("score", 0),
                })

    return texts, sources


def _rank_by_similarity(query, texts, sources, top_k=5):
    """
    Use TF-IDF + cosine similarity to rank texts against the query.
    Returns top_k (source, score) pairs.
    """
    if not texts:
        return []

    corpus = [query] + texts
    vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
    tfidf_matrix = vectorizer.fit_transform(corpus)

    # Cosine similarity of query (index 0) against all others
    similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

    # Rank by similarity
    ranked = sorted(
        zip(sources, similarities),
        key=lambda x: x[1],
        reverse=True,
    )

    return ranked[:top_k]


def _format_response(ranked_results, subreddit_name):
    """
    Format the top matching Reddit content into a conversational response.
    """
    if not ranked_results:
        return "Hmm, I couldn't find anything relevant on the subreddit for that. Try asking something else!"

    # Filter to results with meaningful similarity
    good_results = [(src, score) for src, score in ranked_results if score > 0.05]

    if not good_results:
        return "I don't have a strong take on that from what's being discussed on the subreddit right now. Try rephrasing?"

    # Pick the best comment-type result, or fall back to post
    best_comments = [(s, sc) for s, sc in good_results if s["type"] == "comment"]
    best_posts = [(s, sc) for s, sc in good_results if s["type"] == "post"]

    parts = []

    if best_comments:
        # Use top 1-2 comments as the main response
        main = best_comments[0][0]["text"]
        parts.append(main)

        # If there's a second good comment, add it as a different perspective
        if len(best_comments) > 1 and best_comments[1][1] > 0.1:
            parts.append(f"Also, someone else pointed out: {best_comments[1][0]['text']}")
    elif best_posts:
        post = best_posts[0][0]
        parts.append(f"There's a discussion about this: \"{post['title']}\"")
        if post.get("text") and len(post["text"]) > len(post["title"]) + 10:
            body = post["text"][len(post["title"]):].strip()
            if body:
                parts.append(body[:300])

    # Add a reference to what thread it came from
    if best_comments or best_posts:
        top = (best_comments or best_posts)[0][0]
        if top.get("title") and top["type"] == "comment":
            parts.append(f'(from the thread: "{top["title"][:80]}")')

    return " ".join(parts)


def generate_response(message, subreddit_name, chat_history=None):
    """
    Full lightweight RAG pipeline:
    1. Extract keywords from message
    2. Scrape relevant Reddit posts
    3. TF-IDF rank all comments against user message
    4. Return best-matching content formatted conversationally

    Returns (response_text, keywords_used)
    """
    # Step 1: Extract keywords
    keywords = extract_keywords(message)

    # Step 2: Scrape subreddit
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

    # Step 3: Collect all texts
    texts, sources = _collect_texts(posts)

    if not texts:
        return (
            f"I couldn't find any posts on r/{subreddit_name} about that. "
            "The subreddit might be private, or try a different topic!",
            keywords,
        )

    # Step 4: Rank by similarity
    ranked = _rank_by_similarity(message, texts, sources, top_k=5)

    # Step 5: Format response
    response = _format_response(ranked, subreddit_name)

    return response, keywords
