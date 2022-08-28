import { useEffect, useState } from 'react';
import { MdDoneOutline } from "react-icons/md";

import { useSelector } from "react-redux";

import { Box, Stack, Text, Input, Button, FormControl } from '@chakra-ui/react';

import { socket } from './Home';

export default function Chat() {
    const username = useSelector((state) => state.userInfo.username);

    const [state, setState] = useState({message: '', name: username});
    const [reply, setReply] = useState([]);

    useEffect(() => {
        socket.on('reply', ({name, message}) => {
            console.log(message)
            setReply([...reply, {name, message}])
        });
    }, [reply]);

    const onTextChange = e => {
        setState({message: e.target.value, name: username});
    };
    
    const onMessageSubmit = (e) => {
        e.preventDefault();
        console.log(state);
        const {name, message} = state;
        console.log({name, message});
        
        socket.emit('message', {name, message});
        setState({message : '', name});
    };

    const renderChat = () => {
        return reply.map(({name, message}, index) => (
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
                    <Stack className="mb-5" direction={['column', 'row']} spacing={2}>
                        <Input placeholder='Start chatting with our bot...' onChange={e => onTextChange(e)} marginRight={"10px"} width={"75%"} className="generic-text" />

                        <Button width={"min-content"} leftIcon={<MdDoneOutline />} colorScheme='orange' variant='solid'>
                            <span className="font-bold">Send</span>
                        </Button>
                    </Stack>

                    {renderChat}
                </FormControl>
            </form>
        </Box>
    );
}