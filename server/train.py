import nltk
from nltk.stem.lancaster import LancasterStemmer
import numpy as np
import tflearn
import tensorflow as tf
import json
import random

'''
HeyBuddy: An AI Chatbot that heals you
TRAINING FOR SEQ2SEQ MACHINE LEARNING

Developed and Designed by John Seong.
Served under the MIT License.

Used the tutorial: 
https://www.pycodemates.com/2021/11/build-a-AI-chatbot-using-python-and-deep-learning.html
'''

class Train(object):
    @staticmethod
    def download_nltk():
        nltk.download("punkt")

    def retrieve(self):
        #Loading intents.json
        with open('server/intents.json') as intents:
            self.data = json.load(intents)

        global stemmer
        stemmer = LancasterStemmer()

        # getting informations from intents.json--
        self.words = []
        self.labels = []
        self.x_docs = []
        self.y_docs = []

        for intent in self.data['intents']:
            for pattern in intent['patterns']:
                wrds = nltk.word_tokenize(pattern)
                self.words.extend(wrds)
                self.x_docs.append(wrds)
                self.y_docs.append(intent['tag'])

                if intent['tag'] not in self.labels:
                    self.labels.append(intent['tag'])

    def preprocess(self):
        # Stemming the words and removing duplicate elements.
        self.words = [stemmer.stem(w.lower()) for w in self.words if w not in "?"]
        self.words = sorted(list(set(self.words)))
        self.labels = sorted(self.labels)

    def hot_encode(self):
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

    def create_model(self):
        net = tflearn.input_data(shape=[None, len(self.training[0])])
        net = tflearn.fully_connected(net, 10)
        net = tflearn.fully_connected(net, 10)
        net = tflearn.fully_connected(net, 10)
        net = tflearn.fully_connected(net, len(self.output[0]), activation='softmax')
        net = tflearn.regression(net)

        self.model = tflearn.DNN(net)
        self.model.fit(self.training, self.output, n_epoch=500, batch_size=8, show_metric=True)
        self.model.save('model.tflearn')

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
        self.retrieve()
        self.preprocess()
        self.hot_encode()
        self.create_model()

    def start_chatting(self):
        while True:
            inp = input("\n\nYou: ")
            if inp.lower() == 'quit':
                break

        #Porbability of correct response 
            results = self.model.predict([self.bag_of_words(inp, self.words)])

        # Picking the greatest number from probability
            results_index = np.argmax(results)

            tag = self.labels[results_index]

            for tg in self.data['intents']:

                if tg['tag'] == tag:
                    responses = tg['responses']
                    print("Bot:\t" + random.choice(responses))

# Entry point...
Train.download_nltk()
train = Train()
train.start_training()
train.start_chatting()

