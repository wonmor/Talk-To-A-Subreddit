from train import Train

'''
HeyBuddy: An AI Chatbot that heals you
POWERED BY SEQ2SEQ MACHINE LEARNING

Developed and Designed by John Seong.
Served under the MIT License.
'''

def chat():
    while True:
        inp = input("\n\nYou: ")
        if inp.lower() == 'quit':
            break

    #Porbability of correct response 
        results = model.predict([bag_of_words(inp, words)])

    # Picking the greatest number from probability
        results_index = np.argmax(results)

        tag = labels[results_index]

        for tg in data['intents']:

            if tg['tag'] == tag:
                responses = tg['responses']
                print("Bot:\t" + random.choice(responses))