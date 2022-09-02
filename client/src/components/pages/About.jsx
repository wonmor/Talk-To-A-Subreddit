import { Box, Text, Image } from "@chakra-ui/react";
import { Mount } from "../utilities/Transitions";

import MetaTag from "./MetaTag";

export default function About() {
    return (
        <>
            <MetaTag title={"Talk to a Subreddit: An AI Chatbot"}
                description={"Talk to a Subreddit is an AI chatbot that lets you talk to any subreddits on Reddit with its own unique personality."}
                keywords={"ai chatbot, google ai chatbot sentient, ai chatbot free, best ai chatbot, ai chatbot online, ai chatbot for fun, reddit ai chatbot, conversational ai chatbot, ai chatbot friend"}
                imgsrc={"talkreddit_character.png"}
                url={"https://talkreddit.apps.johnseong.info"} />
                
            <Box>
                <Mount content={
                    <Text className="text-4xl border-t-2 border-white md:border-transparent mb-5 pt-5 md:pt-0">
                        <b style={{ color: "#bdefff" }}>Behind the Scenes</b>. My First Endeavour in <b style={{ color: "#ffbdf4" }}>Machine Learning</b>.
                    </Text>} show={true} />

                <Text>
                    <b>Who am I</b>? To properly introduce myself, my name is{" "}
                    <b>John Seong</b>, and I am a <b>high school student</b> based in{" "}
                    Oakville, Canada. I am deeply interested in pursuing my dream as a
                    software engineer and the head of Human Interface Design at Apple
                    Inc.
                </Text>

                <Text className="mt-5">
                    Building this website called <b>Talk to the Subreddit</b> from
                    scratch has truly been an unique and a life-changing experience,
                    leading me to this point where I see one object and see lines of
                    codes that are needed to procedurely render it. There were
                    numerous instances where I thought something was impossible — of
                    course — but I managed to perservere through my deep-rooted desire
                    to self-actualize. It was to become a person that sees the beauty
                    even in seemingly chaotic moments. It was by creating this magic
                    app that really shows my skilled background as someone who
                    typically ponders the question of order and disorder.
                </Text>

                <Image className="mt-5 rounded" src="Profile.jpg" alt="profile" />
            </Box>
        </>
    );
}