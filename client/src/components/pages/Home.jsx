import { Box, Stack, Input, Text, Button } from '@chakra-ui/react'
import { MdDoneOutline } from "react-icons/md"

export default function Home() {
    return (
        <Box className="flex flex-col border-t border-gray-600 md:border-transparent">
            <Text className="mt-2 md:mt-0 mb-2 text-5xl">
                I am so <b>proud</b> of you for making all the way here.
            </Text>

            <Text className="mb-5 text-5xl mt-5 md:mt-0">
                If you don't mind me asking, <b>what should I call you?</b>
            </Text>

            <Text className="mb-5 text-2xl mt-5 md:mt-0">
                This is a safe space where you can share anything that you would like to.<br></br>
                <div className="mt-10 md:mt-0">I am powered by <b>deep learning</b>, so my conversation skills will improve from time to time as we get to know each other a bit more.</div>
            </Text>

            <Stack direction={['column', 'row']} spacing={1} marginBottom={"15px"}>
                <Input placeholder='Enter your response...' marginRight={"10px"} width={"75%"} className="generic-text mb-5" />
                <Button width={"min-content"} leftIcon={<MdDoneOutline />} colorScheme='orange' variant='solid'>
                    Submit
                </Button>
            </Stack>

            <Text className="text-xl">
                View our Zero-tolerant <span className="text-blue-200 font-bold hover:underline">Privacy Policy</span>. We cannot access or sell any <b>encrypted</b> private information that you have provided us.
            </Text>

            <Text className="mb-5 text-xl mt-10 md:mt-0">
                We advise you to enter a <b>fake name</b> just for our bot to recognize you the next time you talk to them.
            </Text>
        </Box>
    );
}