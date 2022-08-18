import praw
from praw.models import MoreComments

import pandas as pd
import os

# Tutorial used: https://www.geeksforgeeks.org/scraping-reddit-using-python/

env_client_id = os.environ.get("reddit_client_id")
env_client_secret = os.environ.get("reddit_client_secret")
env_user_agent = os.environ.get("reddit_user_agent")
 
reddit_read_only = praw.Reddit(client_id=env_client_id,         # your client id
                               client_secret=env_client_secret,      # your client secret
                               user_agent=env_user_agent)        # your user agent
 
 
subreddit = reddit_read_only.subreddit("aspergers")
 
posts = subreddit.top("month")
# Scraping the top posts of the current month
 
posts_dict = {"Title": [], "Post Text": [],
              "ID": [], "Score": [],
              "Total Comments": [], "Post URL": []
              }
 
for post in posts:
    # Title of each post
    posts_dict["Title"].append(post.title)
     
    # Text inside a post
    posts_dict["Post Text"].append(post.selftext)
     
    # Unique ID of each post
    posts_dict["ID"].append(post.id)
     
    # The score of a post
    posts_dict["Score"].append(post.score)
     
    # Total number of comments inside the post
    posts_dict["Total Comments"].append(post.num_comments)
     
    # URL of each post
    posts_dict["Post URL"].append(post.url)
 
# Saving the data in a pandas dataframe
top_posts = pd.DataFrame(posts_dict)
top_posts.to_csv("server/datasets/reddit_posts.csv", index=True)

# URL of the post
url = "https://www.reddit.com/r/aspergers/comments/w5mhei/wooo_im_getting_my_first_ever_promotion/"
 
# Creating a submission object
submission = reddit_read_only.submission(url=url)

post_comments = []
 
for comment in submission.comments:
    if type(comment) == MoreComments:
        continue
 
    post_comments.append(comment.body)
 
# creating a dataframe
comments_df = pd.DataFrame(post_comments, columns=['comment'])
comments_df.to_csv("server/datasets/reddit_comments.csv", index=True)