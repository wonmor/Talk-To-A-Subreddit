import { useEffect, useState } from 'react';
import { MdSend } from "react-icons/md";

import { FormErrorMessage } from '@chakra-ui/react';

import { useSelector, useDispatch } from "react-redux";

import { Box, Stack, Text, Input, Button, FormControl } from '@chakra-ui/react';

import { Showcase, socket } from './Home';

import { Mount } from "../utilities/Transitions";

import { setChatHistory } from '../../states/userInfoSlice';

import { useNavigate } from 'react-router-dom';

import MetaTag from './MetaTag';

export default function Chat() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const username = useSelector((state) => state.userInfo.username);
    const chatHistory = useSelector((state) => state.userInfo.chatHistory);
    const selectedSubRedditName = useSelector((state) => state.userInfo.selectedSubRedditName);

    const [state, setState] = useState({ message: '', name: username });

    const [show, set] = useState(false);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        set(true);
    }, []);

    useEffect(() => {
        try {
            socket.on('reply', ({ name, message }) => {
                dispatch(setChatHistory([...chatHistory, { name, message }]));
            });
        } catch (e) {
            navigate('/');
            window.location.reload();
        }
    }, [chatHistory, dispatch, navigate]);

    const onTextChange = e => {
        setState({ message: e.target.value, name: username });
    };

    const onMessageSubmit = (e) => {
        e.preventDefault();

        const { name, message } = state;
        const isInputEmpty = message === '';

        setIsError(isInputEmpty);

        if (!isInputEmpty) {
            socket.emit('message', { name, message });

            setState({ message: '', name });
            dispatch(setChatHistory([...chatHistory, { name, message }]));
        }
    };

    const ChatList = () => {
        if (chatHistory) {
            return (
                // Slice creates a duplicate array...
                <Box style={{ marginTop: "15px" }}>
                    {chatHistory.slice().reverse().map(({ name, message }, index) => (
                        <span key={index}>
                            <h3><b>{name}</b>: <span className={message.includes('Thinking') && 'italic'} style={{ color: message.includes("Thinking") && "#bdefff" }}>{message}</span></h3>
                        </span>
                    ))}
                </Box>
            );
        }
    };

    return (
        <>
            <MetaTag title={"Talk to a Subreddit: An AI Chatbot"}
                description={"Talk to a Subreddit is an AI chatbot that lets you talk to any subreddits on Reddit with its own unique personality."}
                keywords={"ai chatbot, google ai chatbot sentient, ai chatbot free, best ai chatbot, ai chatbot online, ai chatbot for fun, reddit ai chatbot, conversational ai chatbot, ai chatbot friend"}
                imgsrc={"talkreddit_character.png"}
                url={"https://talkreddit.com"} />

            <Box className="border-t-2 border-white md:border-transparent">
                {selectedSubRedditName &&
                    <Mount content={
                        <Text className="text-4xl mb-5 mt-5 md:mt-0">
                            Howdy, <b>{username}</b>. I'm r/<b className='text-orange-400'>{selectedSubRedditName}</b>.
                        </Text>
                    } show={show} />
                }

                <form onSubmit={onMessageSubmit}>
                    <FormControl isRequired isInvalid={isError}>
                        <Stack direction={['column', 'row']} spacing={2}>
                            <Input placeholder='Start chatting with me...' value={state['message']} onChange={e => onTextChange(e)} marginRight={"10px"} width={"80%"} className="generic-text" />

                            <Button onClick={onMessageSubmit} width={"min-content"} leftIcon={<MdSend />} colorScheme='orange' variant='solid'>
                                <span className="font-bold">Send</span>
                            </Button>
                        </Stack>

                        {isError && (
                            <FormErrorMessage className="generic-text">Invalid entry. Please try it again.</FormErrorMessage>
                        )}
                        <ChatList />
                    </FormControl>
                </form>

                <Showcase />
            </Box>
        </>
    );
}