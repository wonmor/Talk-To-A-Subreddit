import { Box, Input, Text } from '@chakra-ui/react'

export default function Home() {
    return (
        <Box className="flex flex-col">
        <Text className="mb-2 text-5xl">
            I am so <b>proud</b> of you for making all the way here.
        </Text>

        <Text className="mb-5 text-5xl">
            If you don't mind me asking, <b>what should I call you?</b>
        </Text>

        <Text className="mb-5 text-2xl">
            This is a safe space where you can share anything that you would like to.<br></br>
            I am powered by <b>machine learning</b>, so I sort of think like a human, although the technology itself isn't perfect.
        </Text>

        <Input placeholder='Enter your response...' width={"50%"} className="generic-text mb-5" />

        <Text className="text-xl">
            View our Zero-tolerant <span className="text-blue-200 font-bold">Privacy Policy</span>. We cannot access or sell any <b>encrypted</b> private information that you have provided us.
        </Text>

        <Text className="mb-5 text-xl">
            We advise you to enter a <b>fake name</b> just for our bot to recognize you the next time you talk to them.
        </Text>
        </Box>
    );
}