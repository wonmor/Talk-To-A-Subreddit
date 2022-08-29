import { Box, Stack, Input, Text, Button, FormControl, FormErrorMessage } from '@chakra-ui/react';

import { MdDoneOutline } from "react-icons/md";

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';

import { Canvas, useFrame, extend } from "@react-three/fiber";
import { useGLTF } from '@react-three/drei'

import axios from 'axios';

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

import { Mount } from "../utilities/Transitions";

import quicksand from '../../assets/Quicksand.json';

import { io } from 'socket.io-client';

import {
    setUsername,
    setGoodToGo,
    setIsSocketChannelOpen,
    setBuildHistory
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
    /*
    This is a component function in JSX that contains the HTML markup that represent each graphical element on the webpage
    Parameters
    ----------
    props: React element
      Represents all the other properties that have to be rendered prior to this operation
    Returns
    -------
    DOM File
        A HTML markup that contains graphical elements
    */
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
        <Box style={{ width: "fit-parent", height: "85vh" }}>
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

    const [input, setInput] = useState('');

    const [show, set] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const username = useSelector((state) => state.userInfo.username);
    const goodToGo = useSelector((state) => state.userInfo.goodToGo);
    const isSocketChannelOpen = useSelector((state) => state.userInfo.isSocketChannelOpen);
    const buildHistory = useSelector((state) => state.userInfo.buildHistory);

    const handleInputChange = (e) => setInput(e.target.value);

    const statusMessage = (goodToGo) => {
        if (goodToGo) {
            return (
                <div className="flex flex-col">
                    <span className="mt-5 md:mt-0 mb-5 text-3xl" style={{ color: "#bdefff" }}>
                        Welcome Back, <b>{username}</b>.
                    </span>

                    <span className="mb-5 text-5xl mt-5 md:mt-0">
                        Choose a <b style={{ color: "#ffbdf4" }}>Subreddit</b> Bot.
                    </span>
                </div>
            );
        } else {
            return (<span>Sorry, An <b>Error</b> Occured!</span>);
        }
    };

    const openSocketChannel = (debugMode = false) => {
        setIsLoading(true);

        axios.post('/api/connect')
            .then(function () {
                dispatch(setGoodToGo(true));
                dispatch(setIsSocketChannelOpen(true));

                setIsLoading(false);

                // Depending on the environment, dynamically change the URL or the IP address used for making a secure WebSocket connection...
                socket = io(process.env.NODE_EnV === "development" ? "localhost:5000/" : "https://talkreddit.apps.johnseong.info", {
                    transports: ["websocket"],
                    cors: {
                        origin: process.env.NODE_EnV === "development" ? "http://localhost:3000/" : "https://talkreddit.apps.johnseong.info",
                    },
                });
            })
            .catch(function () {
                dispatch(setGoodToGo(false));
            });
    };

    const inputSubmitAction = (e) => {
        e.preventDefault();

        const isInputEmpty = input === '';

        setIsError(isInputEmpty);

        if (!isInputEmpty) {
            dispatch(setUsername(input));

            if (!isSocketChannelOpen) {
                openSocketChannel();
            }
        }
    };

    useEffect(() => {
        set(true);
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('build', (data) => {
                const type = data[0];
                const message = data[1];

                dispatch(setBuildHistory([...setBuildHistory, { type, message }]));
            });
        }
    }, [buildHistory, dispatch])

    return (
        <>
            <Box className="flex flex-col border-t-2 border-white md:border-transparent">
                <Mount content={
                    <>
                        <Text className="mt-5 md:mt-0 mb-2 text-5xl">
                            {!goodToGo ? <span>I am so <b>proud</b> of you for making all the way here.</span> : <Mount content={statusMessage(goodToGo)} show={goodToGo} />}
                        </Text>

                        {!goodToGo &&
                            <Text className="mb-5 text-5xl mt-5 md:mt-0">
                                If you don't mind me asking, <b style={{ color: "#ffbdf4" }}>what should I call you?</b>
                            </Text>
                        }
                    </>
                } show={show} />

                <Text className="mb-5 text-2xl mt-2 md:mt-0">
                    I am powered by <b>deep learning</b>, so my conversation skills will improve from time to time as we get to know each other a bit more.
                </Text>

                {!goodToGo ?
                    <>
                        {!isLoading ?
                            <form onSubmit={inputSubmitAction}>
                                <FormControl isRequired isInvalid={isError}>
                                    <Stack direction={['column', 'row']} spacing={2}>
                                        <Input placeholder='Enter your response...' onChange={handleInputChange} marginRight={"10px"} width={"75%"} className="generic-text" />

                                        <Button className="drop-shadow-xl" width={"min-content"} leftIcon={<MdDoneOutline />} colorScheme='orange' variant='solid' onClick={inputSubmitAction}>
                                            <span className="font-bold">Submit</span>
                                        </Button>
                                    </Stack>

                                    {isError && (
                                        <FormErrorMessage className="generic-text">Invalid entry. Please try it again.</FormErrorMessage>
                                    )}
                                </FormControl>
                            </form>
                            : <Box className="flex flex-col"><code className="text-2xl font-bold" style={{ color: "#bdefff" }}>Loading...</code>
                                {buildHistory && <>
                                    {buildHistory.map(({ type, message }, index) => (<code className={type === 'log' ? 'text-white' : type === 'error' && 'text-red-200'}>message</code>))}</>}</Box>}
                    </>
                    : <Button width='min-content' colorScheme='orange' variant='outline' onClick={() => { navigate('/chat') }}>
                        <span>r/<b>Aspegers</b></span>
                    </Button>}

                <Text className="text-xl mb-5 mt-5">
                    View our Zero-tolerant <button onClick={() => { navigate('/about') }} className="font-bold hover:underline" style={{ color: "#bdefff" }}>Privacy Policy</button>. We cannot access or sell any <b>encrypted</b> private information that you have provided us.
                </Text>
            </Box>

            <Showcase />
        </>
    );
}