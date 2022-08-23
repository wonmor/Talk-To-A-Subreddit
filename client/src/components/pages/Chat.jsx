import { useEffect, useState } from 'react';
import { MdDoneOutline } from "react-icons/md";

import { Box, Stack, Text, Input, Button, FormControl } from '@chakra-ui/react';

import io from 'socket.io-client';

const socket = io("localhost:5000/", {
    transports: ["websocket"],
    cors: {
      origin: "http://localhost:3000/",
    },
});

export default function Chat() {
    const [state, setState] = useState({message: '', name: ''});
    const [chat, setChat] = useState([]);

    useEffect(() => {
        socket.on('message', ({name, message}) => {
            setChat([...chat, {name, message}])
        });
    }, [chat]);

    const onTextChange = e => {
        setState({...state,[e.target.name]: e.target.value});
    };
    
    const onMessageSubmit = (e) => {
        e.preventDefault()
        const {name, message} = state
        
        socket.emit('message', {name, message})
        setState({message : '', name})
    };

    const renderChat = () => {
        return chat.map(({name, message}, index) => (
            <div key={index}>
                <h3>{name}:<span>{message}</span></h3>
            </div>
        ));
    }; 

    return (
        <Box>
            <Text className="text-4xl mb-5">
                This is the <b>chat</b> page. Website is currently under construction.
            </Text>

            <form onSubmit={onMessageSubmit}>
                <FormControl isRequired>
                    <Stack direction={['column', 'row']} spacing={2}>
                        {renderChat}

                        <Input placeholder='Start chatting with our bot...' onChange={e => onTextChange(e)} marginRight={"10px"} width={"75%"} className="generic-text" />

                        <Button width={"min-content"} leftIcon={<MdDoneOutline />} colorScheme='orange' variant='solid'>
                            <span className="font-bold">Submit</span>
                        </Button>
                    </Stack>
                </FormControl>
            </form>
        </Box>
    );
}