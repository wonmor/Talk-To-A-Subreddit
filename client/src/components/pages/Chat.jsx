import { useEffect, useState, useRef } from 'react';
import { MdSend, MdArrowBack } from "react-icons/md";

import { useSelector, useDispatch } from "react-redux";

import { Box, Stack, Text, Input, Button, FormControl, Spinner } from '@chakra-ui/react';

import { Showcase, socket } from './Home';

import { Mount } from "../utilities/Transitions";

import { addChatMessage, resetChat } from '../../states/userInfoSlice';

import { useNavigate } from 'react-router-dom';

import MetaTag from './MetaTag';

export default function Chat() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const username = useSelector((state) => state.userInfo.username);
    const chatHistory = useSelector((state) => state.userInfo.chatHistory);
    const subredditName = useSelector((state) => state.userInfo.subredditName);
    const openaiApiKey = useSelector((state) => state.userInfo.openaiApiKey);

    const [message, setMessage] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [show, set] = useState(false);

    const chatEndRef = useRef(null);

    useEffect(() => {
        set(true);

        if (!socket || !subredditName || !openaiApiKey) {
            navigate('/');
            return;
        }

        const handleReply = ({ name, message: replyMsg, keywords }) => {
            setIsThinking(false);
            setStatusText('');
            dispatch(addChatMessage({ name, message: replyMsg, keywords }));
        };

        const handleStatus = ({ status, message: statusMsg }) => {
            setStatusText(statusMsg || 'Thinking...');
        };

        socket.on('reply', handleReply);
        socket.on('status', handleStatus);

        return () => {
            socket.off('reply', handleReply);
            socket.off('status', handleStatus);
        };
    }, [dispatch, navigate, subredditName, openaiApiKey]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isThinking]);

    const onMessageSubmit = (e) => {
        e.preventDefault();

        if (!message.trim() || isThinking) return;

        const userMsg = message.trim();
        setMessage('');
        setIsThinking(true);

        dispatch(addChatMessage({ name: username, message: userMsg }));

        socket.emit('message', {
            name: username,
            message: userMsg,
            subreddit: subredditName,
            openaiKey: openaiApiKey,
        });
    };

    const handleBack = () => {
        dispatch(resetChat());
        if (socket) socket.disconnect();
        navigate('/');
    };

    return (
        <>
            <MetaTag title={`Chatting with r/${subredditName}`}
                description={`Talk to r/${subredditName} as if it were a person.`}
                keywords={"ai chatbot, reddit chatbot, talk to subreddit"}
                imgsrc={"talkreddit_character.png"}
                url={"https://talkreddit.apps.johnseong.info"} />

            <Box className="border-t-2 border-white md:border-transparent">
                <Mount content={
                    <Box className="flex items-center gap-4 mb-5 mt-5 md:mt-0">
                        <Button size="sm" variant="ghost" colorScheme="orange" onClick={handleBack} leftIcon={<MdArrowBack />}>
                            Back
                        </Button>
                        <Text className="text-4xl">
                            Howdy, <b>{username}</b>. I'm r/<b className='text-orange-400'>{subredditName}</b>.
                        </Text>
                    </Box>
                } show={show} />

                <form onSubmit={onMessageSubmit}>
                    <FormControl>
                        <Stack direction={['column', 'row']} spacing={2}>
                            <Input
                                placeholder={`Ask r/${subredditName} anything...`}
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                marginRight={"10px"}
                                width={"80%"}
                                className="generic-text"
                                disabled={isThinking}
                            />
                            <Button
                                onClick={onMessageSubmit}
                                width={"min-content"}
                                leftIcon={<MdSend />}
                                colorScheme='orange'
                                variant='solid'
                                isLoading={isThinking}
                                loadingText="Thinking"
                            >
                                <span className="font-bold">Send</span>
                            </Button>
                        </Stack>
                    </FormControl>
                </form>

                {/* Status indicator */}
                {isThinking && statusText && (
                    <Box className="flex items-center gap-2 mt-3" style={{ color: "#bdefff" }}>
                        <Spinner size="sm" />
                        <Text className="text-sm italic">{statusText}</Text>
                    </Box>
                )}

                {/* Chat messages */}
                <Box style={{ marginTop: "15px" }}>
                    {chatHistory.map(({ name, message: msg, keywords }, index) => (
                        <Box key={index} className="mb-3">
                            <Text>
                                <b style={{ color: name === username ? "#ffbdf4" : "#bdefff" }}>{name}</b>: {msg}
                            </Text>
                            {keywords && (
                                <Text className="text-xs italic mt-1" style={{ color: "#666" }}>
                                    searched: {keywords}
                                </Text>
                            )}
                        </Box>
                    ))}
                    <div ref={chatEndRef} />
                </Box>

                <Showcase />
            </Box>
        </>
    );
}
