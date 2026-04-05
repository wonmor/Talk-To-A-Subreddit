import requests
import time

"""
Reddit Web Scraper - No API credentials required.
Uses Reddit's public JSON endpoints to fetch posts and comments.
"""

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/120.0.0.0 Safari/537.36"
}

REQUEST_TIMEOUT = 15


def search_subreddit(subreddit_name, query, limit=20):
    """
    Search a subreddit for posts matching a query using Reddit's public JSON endpoint.

    Returns a list of dicts with keys: title, selftext, score, num_comments, permalink, comments
    """
    url = f"https://www.reddit.com/r/{subreddit_name}/search.json"
    params = {
        "q": query,
        "restrict_sr": 1,
        "sort": "relevance",
        "limit": limit,
        "t": "all",
    }

    try:
        resp = requests.get(url, headers=HEADERS, params=params, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"[scraper] search failed: {e}")
        return []

    posts = []
    for child in data.get("data", {}).get("children", []):
        post = child.get("data", {})
        posts.append({
            "title": post.get("title", ""),
            "selftext": (post.get("selftext") or "")[:500],
            "score": post.get("score", 0),
            "num_comments": post.get("num_comments", 0),
            "permalink": post.get("permalink", ""),
            "id": post.get("id", ""),
        })

    return posts


def fetch_top_comments(subreddit_name, post_id, limit=5):
    """
    Fetch the top comments for a specific post.
    """
    url = f"https://www.reddit.com/r/{subreddit_name}/comments/{post_id}.json"
    params = {"sort": "top", "limit": limit}

    try:
        resp = requests.get(url, headers=HEADERS, params=params, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"[scraper] comments fetch failed for {post_id}: {e}")
        return []

    comments = []
    if len(data) >= 2:
        for child in data[1].get("data", {}).get("children", []):
            body = child.get("data", {}).get("body")
            if body and child.get("kind") == "t1":
                comments.append(body[:300])
            if len(comments) >= limit:
                break

    return comments


def get_hot_posts(subreddit_name, limit=20):
    """
    Fetch the current hot posts from a subreddit.
    """
    url = f"https://www.reddit.com/r/{subreddit_name}/hot.json"
    params = {"limit": limit}

    try:
        resp = requests.get(url, headers=HEADERS, params=params, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"[scraper] hot posts fetch failed: {e}")
        return []

    posts = []
    for child in data.get("data", {}).get("children", []):
        post = child.get("data", {})
        if post.get("stickied"):
            continue
        posts.append({
            "title": post.get("title", ""),
            "selftext": (post.get("selftext") or "")[:500],
            "score": post.get("score", 0),
            "num_comments": post.get("num_comments", 0),
            "permalink": post.get("permalink", ""),
            "id": post.get("id", ""),
        })

    return posts


def scrape_posts_with_comments(subreddit_name, query, limit=20, comments_per_post=3):
    """
    Search subreddit, then fetch top comments for each post.
    Returns enriched post dicts with a 'comments' key.
    Rate-limits requests to avoid Reddit throttling.
    """
    posts = search_subreddit(subreddit_name, query, limit=limit)

    for i, post in enumerate(posts):
        if i > 0 and i % 5 == 0:
            time.sleep(1)  # rate limit
        post["comments"] = fetch_top_comments(subreddit_name, post["id"], limit=comments_per_post)

    return posts
