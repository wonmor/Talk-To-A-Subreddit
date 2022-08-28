import nltk
from nltk.stem.lancaster import LancasterStemmer
from nltk.corpus import wordnet

import pandas as pd
import numpy as np
import tflearn
import tensorflow as tf
import json
import pickle
import random
import codecs
from flask_socketio import emit

from server.reddit import Reddit

'''
Talk to a Subreddit: An AI Chatbot
TRAINING MODULE FOR SEQ2SEQ MACHINE LEARNING

Developed and Designed by John Seong.
Served under the MIT License.

Used the tutorial for ML: 
https://www.pycodemates.com/2021/11/build-a-AI-chatbot-using-python-and-deep-learning.html

Keyword extraction tutorial:
https://towardsdatascience.com/keyword-extraction-a-benchmark-of-7-algorithms-in-python-8a905326d93f

Continual learning implementation tutorial (make it retrieve reddit database automatically at the end of every month):
https://towardsdatascience.com/how-to-apply-continual-learning-to-your-machine-learning-models-4754adcd7f7f

USEFUL TIPS:
To activate virtual environment on Windows, simply type venv\Scripts\Activate.ps1 on Windows Powershell (different from macOS)

HOW TO INSTALL TENSORFLOW ON A MACOS (ARM64, a.k.a. Apple Silicon) DEVICE:
    I was able to install tensorflow-macos and tensrflow-metal on intel based iMac
    $ python3 -m venv tensorflow-metal-test
    $ source tensorflow-metal-test/bin/activate
    $ cd tensorflow-metal-test/
    $ python -m pip install -U pip
    $ pip install tensorflow-macos
    $ pip install tensorflow-metal
'''

class Train(object):
    def __init__(self, debug_mode=False):
        self.debug_mode = debug_mode

    @staticmethod
    def download_nltk():
        print("Downloading the NLTK models...")

        nltk.download("punkt")
        nltk.download('wordnet')
        nltk.download('omw-1.4')

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

    def send_chat(self, inp):
        print("\n\nChatting process has been started!")

        if inp:
            # Probability of correct response 
            results = self.model.predict([self.bag_of_words(inp, self.words)])

            # Picking the greatest number from probability
            results_index = np.argmax(results)

            tag = self.labels[results_index]

            self.use_reddit_comments = False

            for tg in self.data['intents']:
                if tg['tag'] == tag:
                    responses = tg['responses']
                    print("\n\nBot: " + random.choice(responses))
                    self.use_reddit_comments = False
                    break
                else:
                    self.use_reddit_comments = True

            if self.use_reddit_comments:
                comment_list = []

                emit('thought', list({'Bot', f"\n\nThinking about something related to {tag.strip('[').strip(']')}..."}))

                for key, value in enumerate(self.reddit_posts['Tag'].values()):
                    # Converting the string to list...
                    temp_value = str(value).replace('["', '').replace('"]', '').replace("['", "").replace("']", "").split(", ")
                    temp_tag = str(tag).replace('["', '').replace('"]', '').replace("['", "").replace("']", "").split(", ")
                    temp_tag_synonyms = []

                    # Find the synonyms of the tag and also take into account...
                    for temp_single_tag in temp_tag:
                        for syn in wordnet.synsets(temp_single_tag):
                            for i in syn.lemmas():
                                temp_tag_synonyms.append(i.name())

                    # To-Do: Add a feature where the program only searches for a snonym if and only if there's no matching word detected in the corresponding list...

                    temp_tag += temp_tag_synonyms

                    print(temp_tag) if self.debug_mode else None
                    print(temp_value) if self.debug_mode else None

                    flag = []
                    res = False
                    
                    # This part of the code is only used when there're more than one word for the tag of each question (x variable)...
                    for t in temp_tag:
                        print(f"Current t value: {t}") if self.debug_mode else None

                        if t in temp_value:
                            flag.append(t)

                    print(flag) if self.debug_mode else None

                    if flag:
                        res = True

                    # Used when the tag only contains one word each...
                    if temp_tag in temp_value or temp_tag == temp_value:
                        res = True

                    print(res) if self.debug_mode else None
                    
                    if res:
                        print("Matching key found!") if self.debug_mode else None

                        comment_list.append(str(self.reddit_posts['Total Comments']).replace('["', '').replace('"]', '').replace("['", "").replace("']", "").split(", ")[key])
                
                # Print the decoded encoded string of a random selection that has been made amongst closest matches determined by the trained data...
                return_value = codecs.decode(random.choice(comment_list).replace("\\", "").strip('\"').strip('\'').capitalize(), 'unicode_escape')

                self.use_reddit_comments = False

            return return_value
        else:
            return "Please enter a valid text!"
