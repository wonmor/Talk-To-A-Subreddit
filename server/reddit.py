import praw
from praw.models import MoreComments

import pandas as pd
import os

# Tutorial used: https://www.geeksforgeeks.org/scraping-reddit-using-python/

class Reddit(object):
    def __init__(self):
        env_client_id = os.environ.get("reddit_client_id")
        env_client_secret = os.environ.get("reddit_client_secret")
        env_user_agent = os.environ.get("reddit_user_agent")
        
        global reddit_read_only
        reddit_read_only = praw.Reddit(client_id=env_client_id,         # your client id
                                    client_secret=env_client_secret,      # your client secret
                                    user_agent=env_user_agent)        # your user agent
 
    def set_time_frame(self, subreddit_name="aspergers"):
        subreddit = reddit_read_only.subreddit(subreddit_name)
        
        self.posts = subreddit.top("month")
        # Scraping the top posts of the current month
        
        self.posts_dict = {"Title": [], "Post Text": [],
                    "ID": [], "Score": [],
                    "Total Comments": [], "Post URL": []
                    }

    def retrieve_posts(self):
        for post in self.posts:
            # Title of each post
            self.posts_dict["Title"].append(post.title)
            
            # Text inside a post
            self.posts_dict["Post Text"].append(post.selftext)
            
            # Unique ID of each post
            self.posts_dict["ID"].append(post.id)
            
            # The score of a post
            self.posts_dict["Score"].append(post.score)
            
            # Total number of comments inside the post
            self.posts_dict["Total Comments"].append(post.num_comments)
            
            # URL of each post
            self.posts_dict["Post URL"].append(post.url)

        # Saving the data in a pandas dataframe
        self.top_posts = pd.DataFrame(self.posts_dict)
        self.top_posts.to_csv("server/datasets/reddit_posts.csv", index=True)

    def retrieve_comments(self, post_url="https://www.reddit.com/r/aspergers/comments/w5mhei/wooo_im_getting_my_first_ever_promotion/"):
        # Creating a submission object
        submission = reddit_read_only.submission(url=post_url)

        self.post_comments = []
        
        for comment in submission.comments:
            if type(comment) == MoreComments:
                continue
        
            self.post_comments.append(comment.body)

        # creating a dataframe
        self.comments_df = pd.DataFrame(self.post_comments, columns=['comment'])
        self.comments_df.to_csv("server/datasets/reddit_comments.csv", index=True)


# Entry point...
reddit = Reddit()
# Don't erase the line below...
reddit.set_time_frame()
reddit.retrieve_posts()
reddit.retrieve_comments()