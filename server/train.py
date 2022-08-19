import nltk
from nltk.stem.lancaster import LancasterStemmer
import pandas as pd
import numpy as np
import tflearn
import tensorflow as tf
import json
import pickle
import random

from reddit import Reddit

'''
HeyBuddy: An AI Chatbot that heals you
TRAINING MODULE FOR SEQ2SEQ MACHINE LEARNING

Developed and Designed by John Seong.
Served under the MIT License.

Used the tutorial for ML: 
https://www.pycodemates.com/2021/11/build-a-AI-chatbot-using-python-and-deep-learning.html

Keyword extraction tutorial:
https://towardsdatascience.com/keyword-extraction-a-benchmark-of-7-algorithms-in-python-8a905326d93f

Continual learning implementation tutorial (make it retrieve reddit database automatically at the end of every month):
https://towardsdatascience.com/how-to-apply-continual-learning-to-your-machine-learning-models-4754adcd7f7f

ACTIVATE VIRTUAL ENV. ON WINDOWS: venv\Scripts\Activate.ps1 
'''

class Train(object):
    @staticmethod
    def download_nltk():
        print("Downloading the NLTK model...")

        nltk.download("punkt")

    def retrieve(self):
        print("Retrieving the user-generated dataset...")

        # Loading intents.json
        with open('server/datasets/intents.json') as intents:
            self.data = json.load(intents)

        print("Retrieving the pre-generated Reddit posts' datasets...")

        # Read the pre-generated reddit post CSV file...
        self.reddit_posts = pd.read_csv('server/datasets/reddit_posts.csv').to_dict()

        global stemmer
        stemmer = LancasterStemmer()

    def parse(self):
        print("Parsing the user-generated dataset...")

        # getting informations from intents.json--
        self.words = []
        self.labels = []
        self.x_docs = []
        self.y_docs = []

        for intent in self.data['intents']:
            for pattern in intent['patterns']:
                print(f"USER-GENERATED: Parsing the word: {pattern}")

                wrds = nltk.word_tokenize(pattern)
                self.words.extend(wrds)
                self.x_docs.append(wrds)
                self.y_docs.append(intent['tag'])

                if intent['tag'] not in self.labels:
                    self.labels.append(intent['tag'])

        print("Parsing the pre-generated Reddit posts' datasets...")

        # getting data from the parsed reddit posts...
        for index, title in enumerate(self.reddit_posts['Title'].values()):
            print(f"REDDIT POST: Parsing the word: {title}")

            wrds = nltk.word_tokenize(title)
            self.words.extend(wrds)
            self.x_docs.append(wrds)
            self.y_docs.append(self.reddit_posts['Tag'][index])

            if self.reddit_posts['Tag'][index] not in self.labels:
                self.labels.append(self.reddit_posts['Tag'][index])

    def preprocess(self):
        print("Stemming the words and removing duplicate elements...")

        # Stemming the words and removing duplicate elements.
        self.words = [stemmer.stem(w.lower()) for w in self.words if w not in "?"]
        self.words = sorted(list(set(self.words)))
        self.labels = sorted(self.labels)

    def hot_encode(self):
        print("Hot Encoding: Converting the words to numerals...")

        self.training = []
        self.output = []
        self.out_empty = [0 for _ in range(len(self.labels))]

        # One hot encoding, Converting the words to numerals
        for x, doc in enumerate(self.x_docs):
            bag = []
            wrds = [stemmer.stem(w) for w in doc]
            for w in self.words:
                if w in wrds:
                    bag.append(1)
                else:
                    bag.append(0)

            output_row = self.out_empty[:]
            output_row[self.labels.index(self.y_docs[x])] = 1

            self.training.append(bag)
            self.output.append(output_row)


        self.training = np.array(self.training)
        self.output = np.array(self.output)

        with open('server/datasets/data.pickle','wb') as f:
            pickle.dump((self.words, self.labels, self.training, self.output), f)

    def create_model(self):
        print("Creating a ML model...")

        net = tflearn.input_data(shape=[None, len(self.training[0])])
        net = tflearn.fully_connected(net, 10)
        net = tflearn.fully_connected(net, 10)
        net = tflearn.fully_connected(net, 10)
        net = tflearn.fully_connected(net, len(self.output[0]), activation='softmax')
        net = tflearn.regression(net)

        self.model = tflearn.DNN(net)

        # When runtime error occurs at this point... use the tutorial: https://stackoverflow.com/questions/65022518/runtimeerror-attempted-to-use-a-closed-session-with-tflearn-dnn
        
        try:
            self.model.load("server/datasets/model.tflearn")
        except:
            self.model = tflearn.DNN(net) # Needs to write this line twice for some reason...
            self.model.fit(self.training, self.output, n_epoch=500, batch_size=8, show_metric=True)
            self.model.save('server/datasets/model.tflearn')

    @staticmethod
    def bag_of_words(s, words):
        bag = [0 for _ in range(len(words))]
        s_words = nltk.word_tokenize(s)
        
        try:
            s_words = [stemmer.stem(word.lower()) for word in s_words]
        except:
            print("Need to retrieve the data first!")

        for s_word in s_words:
            for i, w in enumerate(words): 
                if w == s_word:
                    bag[i] = 1

        return np.array(bag)

    def start_training(self):
        print("Training process has been started!")

        self.retrieve()

        try:
            with open('server/datasets/data.pickle','rb') as f:
                self.words, self.labels, self.training, self.output = pickle.load(f)
        except:
            self.parse()
            self.preprocess()
            self.hot_encode()
            
        self.create_model()

    def start_chatting(self):
        print("Chatting process has been started!")

        while True:
            inp = input("\n\nYou: ")
            if inp.lower() == 'quit':
                break

            # Probability of correct response 
            results = self.model.predict([self.bag_of_words(inp, self.words)])

            # Picking the greatest number from probability
            results_index = np.argmax(results)

            tag = self.labels[results_index]

            self.use_reddit_comments = False

            for tg in self.data['intents']:
                if tg['tag'] == tag:
                    responses = tg['responses']
                    print("Bot: " + random.choice(responses))
                    self.use_reddit_comments = False
                    break
                else:
                    self.use_reddit_comments = True
            
            if self.use_reddit_comments:
                urls = []
                comment_list = []

                for key, value in enumerate(self.reddit_posts['Tag'].values()):
                    # Converting the string to list...
                    value = str(value).replace("[", "").replace("]", "").replace("'", "").split(", ")
                    tag = str(tag).replace("[", "").replace("]", "").replace("'", "").split(", ")

                    print(tag)
                    print(value)

                    flag = []
                    res = False
                    
                    for t in tag:
                        print(f"Current t value: {t}")
                        if t in value:
                            flag.append(t)

                    print(flag)

                    if flag:
                        res = True

                    if tag in value or tag == value:
                        res = True

                    print(res)
                    
                    if res:
                        print("Matching key found!")

                        urls.append(self.reddit_posts['Post URL'][key])

                if urls:
                    for url in urls:
                        comment_list += Reddit.retrieve_comments(post_url=url)

                print("Bot: " + random.choice(comment_list))

                self.use_reddit_comments = False
            

# Entry point...
Train.download_nltk()
train = Train()
train.start_training()
train.start_chatting()

