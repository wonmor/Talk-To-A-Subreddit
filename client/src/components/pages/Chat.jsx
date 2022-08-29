import { useEffect, useState } from 'react';
import { MdSend } from "react-icons/md";

import { FormErrorMessage } from '@chakra-ui/react';

import { useSelector, useDispatch } from "react-redux";

import { Box, Stack, Text, Input, Button, FormControl } from '@chakra-ui/react';

import { Showcase, socket } from './Home';

import { Mount } from "../utilities/Transitions";

import { setChatHistory } from '../../states/userInfoSlice';

import { useNavigate } from 'react-router-dom';

export default function Chat() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const username = useSelector((state) => state.userInfo.username);
    const chatHistory = useSelector((state) => state.userInfo.chatHistory);

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
        <Box className="border-t-2 border-white md:border-transparent">
            <Mount content={
                <Text className="text-4xl mb-5 mt-5 md:mt-0">
                    Bonjour, <b>{username}</b>. How was your day?
                </Text>
            } show={show} />

            <form onSubmit={onMessageSubmit}>
                <FormControl isRequired isInvalid={isError}>
                    <Stack direction={['column', 'row']} spacing={2}>
                        <Input placeholder='Start chatting with our bot...' value={state['message']} onChange={e => onTextChange(e)} marginRight={"10px"} width={"80%"} className="generic-text" />

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
    );
}