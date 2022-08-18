import nltk
from nltk.stem.lancaster import LancasterStemmer
import numpy as np
import tflearn
import tensorflow as tf
import json
import pickle
import random

class Train(object):
    def __init__(self):
        nltk.download("punkt")

    def retrieve(self):
        #Loading intents.json
        with open('intents.json') as intents:
            self.data = json.load(intents)

        self.stemmer = LancasterStemmer()

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
        words = [self.stemmer.stem(w.lower()) for w in words if w not in "?"]
        words = sorted(list(set(words)))
        labels = sorted(labels)