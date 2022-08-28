import { useEffect, useState } from 'react';
import { MdDoneOutline } from "react-icons/md";

import { useSelector, useDispatch } from "react-redux";

import { Box, Stack, Text, Input, Button, FormControl } from '@chakra-ui/react';

import { socket } from './Home';

import { setChatHistory } from '../../states/userInfoSlice';

export default function Chat() {
    const dispatch = useDispatch();

    const username = useSelector((state) => state.userInfo.username);
    const chatHistory = useSelector((state) => state.userInfo.chatHistory);

    const [state, setState] = useState({message: '', name: username});

    useEffect(() => {
        socket.on('reply', ({name, message}) => {
            console.log(message)
            dispatch(setChatHistory([...chatHistory, {name, message}]));
        });
    }, [chatHistory, dispatch]);

    const onTextChange = e => {
        setState({message: e.target.value, name: username});
    };
    
    const onMessageSubmit = (e) => {
        e.preventDefault();

        const {name, message} = state;
        
        socket.emit('message', {name, message});

        setState({message : '', name});
        dispatch(setChatHistory([...chatHistory, {name, message}]));
    };

    const ChatList = () => {
        if (chatHistory) {
            return chatHistory.map(({name, message}, index) => (
                <span key={index}>
                    <h3><b>{name}</b>: <span className={message.includes('Thinking') && 'italic'}>{message}</span></h3>
                </span>
            ));
        }
    }; 

    return (
        <Box>
            <Text className="text-4xl mb-5">
                Bonjour, <b>{username}</b>. How was your day?
            </Text>

            <form onSubmit={onMessageSubmit}>
                <FormControl isRequired>
                    <Stack className="mb-5" direction={['column', 'row']} spacing={2}>
                        <Input placeholder='Start chatting with our bot...' onChange={e => onTextChange(e)} marginRight={"10px"} width={"75%"} className="generic-text" />

                        <Button width={"min-content"} leftIcon={<MdDoneOutline />} colorScheme='orange' variant='solid'>
                            <span className="font-bold">Send</span>
                        </Button>
                    </Stack>

                    <ChatList />
                </FormControl>
            </form>
        </Box>
    );
}