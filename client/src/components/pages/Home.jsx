import { Box, Stack, Input, Text, Button, FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react';

import { MdDoneOutline, MdChat } from "react-icons/md";

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';

import { Canvas, useFrame, extend } from "@react-three/fiber";
import { useGLTF } from '@react-three/drei'

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

import { Mount } from "../utilities/Transitions";

import quicksand from '../../assets/Quicksand.json';

import MetaTag from './MetaTag';

import { io } from 'socket.io-client';

import {
    setUsername,
    setOpenaiApiKey,
    setSubredditName,
    setChatHistory,
    setIsConnected,
} from "../../states/userInfoSlice";

export let socket;

const GroundPlane = () => {
    return (
        <mesh receiveShadow rotation={[5, 0, 0]} position={[0, -7.5, 0]}>
            <planeBufferGeometry attach="geometry" args={[500, 500]} />
            <meshStandardMaterial attach="material" color="gray" />
        </mesh>
    );
}
const BackDrop = () => {
    return (
        <mesh receiveShadow position={[0, -1, -5]}>
            <planeBufferGeometry attach="geometry" args={[500, 500]} />
            <meshStandardMaterial attach="material" color="gray" />
        </mesh>
    );
}

function Character(props) {
    const group = useRef();
    const { scene } = useGLTF('character.glb');

    useFrame((state, delta) => {
        group.current.rotation.y += delta / 1.25;
    });

    return (
        <group ref={group} {...props} dispose={null}>
            <primitive castShadow receiveShadow object={scene} />
        </group>
    );
}

function LoadingText(props) {
    const group = useRef();
    const font = new FontLoader().parse(quicksand);
    extend({ TextGeometry });

    useEffect(() => {
        if (group.current?.rotation) {
            group.current.rotation.y += -90;
        }
    });

    return (
        <mesh receiveShadow ref={group} {...props}>
            <textGeometry args={['Loading...', { font, size: 1, height: 0.1 }]} />
            <meshPhongMaterial attach='material' color={'white'} />
        </mesh>
    );
}

export function Showcase() {
    return (
        <Box style={{ width: "fit-parent", height: "85vh", marginTop: "20px" }}>
            <Canvas className="border-2 border-gray-600 rounded" style={{ borderColor: "#bdefff" }} camera={{ fov: 15, position: [-25, 0, 0] }}>
                <mesh rotation={[-8, 0, 0]}>
                    <GroundPlane />
                    <BackDrop />
                </mesh>

                <Suspense fallback={(<LoadingText position={[0, 0, -1]} scale={0.4} />)}>
                    <Character />
                </Suspense>

                <ambientLight color="#bdefff" intensity={0.25} castShadow />
                <spotLight color="#bdefff" position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
                <pointLight color="#ffbdf4" position={[-10, -10, -10]} castShadow />
            </Canvas>
        </Box>
    );
}

export default function Home() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: name, 2: api key + subreddit
    const [nameInput, setNameInput] = useState('');
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [subredditInput, setSubredditInput] = useState('');
    const [isError, setIsError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [show, set] = useState(false);

    const username = useSelector((state) => state.userInfo.username);

    const popularSubreddits = ['AskReddit', 'technology', 'science', 'gaming', 'movies', 'music', 'worldnews', 'philosophy'];

    useEffect(() => {
        set(true);
    }, []);

    const handleNameSubmit = (e) => {
        e.preventDefault();
        if (!nameInput.trim()) {
            setIsError(true);
            setErrorMsg('Please enter your name.');
            return;
        }
        setIsError(false);
        dispatch(setUsername(nameInput.trim()));
        setStep(2);
    };

    const handleConnect = (e) => {
        e?.preventDefault();

        const subreddit = subredditInput.trim().replace(/^r\//, '');

        if (!apiKeyInput.trim()) {
            setIsError(true);
            setErrorMsg('Please enter your OpenAI API key.');
            return;
        }
        if (!subreddit) {
            setIsError(true);
            setErrorMsg('Please enter a subreddit name.');
            return;
        }

        setIsError(false);
        dispatch(setOpenaiApiKey(apiKeyInput.trim()));
        dispatch(setSubredditName(subreddit));
        dispatch(setChatHistory([]));

        // Create socket connection
        socket = io(process.env.NODE_ENV === "development" ? "localhost:5000/" : "/", {
            transports: ["websocket"],
            cors: {
                origin: process.env.NODE_ENV === "development" ? "http://localhost:3000/" : window.location.origin,
            },
        });

        socket.on('connect', () => {
            dispatch(setIsConnected(true));
            navigate('/chat');
        });

        socket.on('connect_error', () => {
            setIsError(true);
            setErrorMsg('Failed to connect to the server. Please try again.');
        });
    };

    const selectQuickSubreddit = (name) => {
        setSubredditInput(name);
    };

    return (
        <>
            <MetaTag title={"Talk to a Subreddit: An AI Chatbot"}
                description={"Talk to a Subreddit is an AI chatbot that lets you talk to any subreddits on Reddit with its own unique personality."}
                keywords={"ai chatbot, reddit chatbot, talk to subreddit, ai chatbot free, reddit ai, conversational ai chatbot"}
                imgsrc={"talkreddit_character.png"}
                url={"https://talkreddit.apps.johnseong.info"} />

            <Box className="flex flex-col border-t-2 border-white md:border-transparent">
                <Mount content={
                    <>
                        {step === 1 ? (
                            <>
                                <Text className="mt-5 md:mt-0 mb-2 text-3xl md:text-5xl">
                                    <span>Talk to any <b style={{ color: "#bdefff" }}>Subreddit</b> as if it were a person.</span>
                                </Text>
                                <Text className="mb-5 text-3xl md:text-5xl mt-5 md:mt-0">
                                    First, <b style={{ color: "#ffbdf4" }}>what should I call you?</b>
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text className="mt-5 md:mt-0 mb-2 text-3xl" style={{ color: "#bdefff" }}>
                                    Welcome, <b>{username}</b>.
                                </Text>
                                <Text className="mb-5 text-5xl mt-5 md:mt-0">
                                    Set up your <b style={{ color: "#ffbdf4" }}>connection</b>.
                                </Text>
                            </>
                        )}
                    </>
                } show={show} />

                <Text className="mb-5 text-lg md:text-2xl mt-2 md:mt-0">
                    Powered by <b>OpenAI GPT</b> with live Reddit data. The chatbot adopts the personality of your chosen subreddit.
                </Text>

                {step === 1 ? (
                    <form onSubmit={handleNameSubmit}>
                        <FormControl isRequired isInvalid={isError}>
                            <Stack direction={['column', 'row']} spacing={2}>
                                <Input
                                    placeholder='Enter your name...'
                                    onChange={(e) => setNameInput(e.target.value)}
                                    marginRight={"10px"}
                                    width={"75%"}
                                    className="generic-text"
                                />
                                <Button
                                    className="drop-shadow-xl"
                                    width={"min-content"}
                                    leftIcon={<MdDoneOutline />}
                                    colorScheme='orange'
                                    variant='solid'
                                    type="submit"
                                >
                                    <span className="font-bold">Continue</span>
                                </Button>
                            </Stack>
                            {isError && (
                                <FormErrorMessage className="generic-text">{errorMsg}</FormErrorMessage>
                            )}
                        </FormControl>
                    </form>
                ) : (
                    <form onSubmit={handleConnect}>
                        <FormControl isInvalid={isError}>
                            <Stack spacing={4}>
                                <Box>
                                    <FormLabel className="generic-text" style={{ color: "#bdefff" }}>OpenAI API Key</FormLabel>
                                    <Input
                                        type="password"
                                        placeholder='sk-...'
                                        value={apiKeyInput}
                                        onChange={(e) => setApiKeyInput(e.target.value)}
                                        width={"75%"}
                                        className="generic-text"
                                    />
                                    <Text className="text-sm mt-1" style={{ color: "#999" }}>
                                        Your key is never stored on our servers. It's sent directly to OpenAI per request.
                                    </Text>
                                </Box>

                                <Box>
                                    <FormLabel className="generic-text" style={{ color: "#bdefff" }}>Subreddit</FormLabel>
                                    <Stack direction={['column', 'row']} spacing={2}>
                                        <Input
                                            placeholder='e.g. AskReddit, philosophy, gaming...'
                                            value={subredditInput}
                                            onChange={(e) => setSubredditInput(e.target.value)}
                                            width={"75%"}
                                            className="generic-text"
                                        />
                                    </Stack>

                                    <Stack direction='row' spacing={2} mt={3} flexWrap="wrap">
                                        {popularSubreddits.map((name) => (
                                            <Button
                                                key={name}
                                                size="sm"
                                                variant={subredditInput === name ? 'solid' : 'outline'}
                                                colorScheme='orange'
                                                onClick={() => selectQuickSubreddit(name)}
                                            >
                                                r/{name}
                                            </Button>
                                        ))}
                                    </Stack>
                                </Box>

                                {isError && (
                                    <Text className="generic-text" color="red.300">{errorMsg}</Text>
                                )}

                                <Button
                                    className="drop-shadow-xl"
                                    width={"min-content"}
                                    leftIcon={<MdChat />}
                                    colorScheme='orange'
                                    variant='solid'
                                    type="submit"
                                >
                                    <span className="font-bold">Start Chatting</span>
                                </Button>
                            </Stack>
                        </FormControl>
                    </form>
                )}

                <Text className="text-xl mb-5 mt-5">
                    View our Zero-tolerant <button onClick={() => { navigate('/about') }} className="font-bold hover:underline" style={{ color: "#bdefff" }}>Privacy Policy</button>. Your API key is only used in-session and <b>never stored</b>.
                </Text>
            </Box>

            <Showcase />
        </>
    );
}
