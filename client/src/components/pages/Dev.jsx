import { Box, Text } from "@chakra-ui/react";
import { Mount } from "../utilities/Transitions";

import MetaTag from "./MetaTag";

export default function Dev() {
    return (
        <>
            <MetaTag title={"Talk to a Subreddit: An AI Chatbot"}
                description={"Talk to a Subreddit is an AI chatbot that lets you talk to any subreddits on Reddit with its own unique personality."}
                keywords={"ai chatbot, google ai chatbot sentient, ai chatbot free, best ai chatbot, ai chatbot online, ai chatbot for fun, reddit ai chatbot, conversational ai chatbot, ai chatbot friend"}
                imgsrc={"talkreddit_character.png"}
                url={"https://talkreddit.com"} />

            <Box>
                <Mount content={
                    <Text className="text-4xl border-t-2 border-white md:border-transparent mb-5 pt-5 md:pt-0">
                        An App Built by a <b style={{ color: "#bdefff" }}>Developer</b> for <b style={{ color: "#ffbdf4" }}>Developers</b>.
                    </Text>} show={true} />

                <Text>
                    This is an <b>open-source</b> project. The nature of being open source is that anyone can jump in and contribute to our project. This means you, you, and you over there! You guys can all be a part of the <a href="/" className="hover:underline" style={{ color: "#bdefff" }}>Talk to a Subreddit</a> Dev team. If you would like to contact me personally, however, please shoot an email to <span style={{ color: "#ffbdf4" }}>business@johnseong.info</span>.
                </Text>

                <Text className="mt-10 text-3xl">
                    1. <b>RESTful API</b> Methods
                </Text>

                <Text style={{ width: "fit-content" }} className="mt-5 bg-gray-700 rounded p-1">
                    ONE | <code className="font-bold">https://talkreddit.com/api/set</code> — <code>POST</code>: Sets the name of the subreddit, sends it to an instantiated <code>Train</code> object
                </Text>

                <Text style={{ width: "fit-content" }} className="mt-5 bg-gray-700 rounded p-1">
                    TWO | <code className="font-bold">https://talkreddit.com/api/connect</code> — <code>POST</code>: When this API call is made, this function initializes the chat session (powered by <code>SocketIO</code>) with the bot
                </Text>

                <Text className="mt-10 text-3xl">
                    2. Primary <b>Technologies</b> Used
                </Text>

                <Text style={{ width: "fit-content" }} className="mt-5 bg-gray-700 rounded p-1">
                    SERVER-SIDE | <code className="font-bold">Flask,
                        SQLAlchemy,
                        TensorFlow,
                        TFLearn,
                        Natural Language Toolkit (NLTK),
                        KeyBERT,
                        Python Reddit API Wrapper (PRAW)</code>
                </Text>

                <Text style={{ width: "fit-content" }} className="mt-5 bg-gray-700 rounded p-1">
                    CLIENT-SIDE | <code className="font-bold">React,
                        ThreeJS,
                        Redux,
                        Chakra UI,
                        Axios,
                        SocketIO,
                        Docker</code>
                </Text>
            </Box>
        </>
    );
}