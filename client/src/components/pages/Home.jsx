import { Box, HStack, Input, Text } from '@chakra-ui/react'

export default function Home() {
    return (
        <Box className="flex flex-col">
        <Text className="mb-2 text-5xl">
            I am so <b>proud</b> of you for making all the way here.
        </Text>

        <Text className="mb-5 text-5xl mt-5 md:mt-0">
            If you don't mind me asking, <b>what should I call you?</b>
        </Text>

        <Text className="mb-5 text-2xl mt-5 md:mt-0">
            This is a safe space where you can share anything that you would like to.<br></br>
            <div className="mt-10 md:mt-0">I am powered by <b>deep learning</b>, so my conversation skills will improve from time to time as we get to know each other a bit more.</div>
        </Text>

        <HStack spacing={4}>
        <Input placeholder='Enter your response...' width={"75%"} className="generic-text mb-5" />
        </HStack>

        <Text className="text-xl">
            View our Zero-tolerant <span className="text-blue-200 font-bold hover:underline">Privacy Policy</span>. We cannot access or sell any <b>encrypted</b> private information that you have provided us.
        </Text>

        <Text className="mb-5 text-xl mt-10 md:mt-0">
            We advise you to enter a <b>fake name</b> just for our bot to recognize you the next time you talk to them.
        </Text>
        </Box>
    );
}