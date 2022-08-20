import { Box, Stack, Input, Text, Button, FormControl, FormErrorMessage } from '@chakra-ui/react'
import { MdDoneOutline } from "react-icons/md"

import { useState, useRef, useEffect, Suspense } from 'react'

import { Canvas } from "@react-three/fiber";
import { useGLTF } from '@react-three/drei'

import { useSelector, useDispatch } from "react-redux";

import {
    setUsername,
    setEmail,
} from "../../states/userInfoSlice";

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

    useEffect(() => {
        if (group.current?.rotation) {
          group.current.rotation.y += -180
        }
    })
  
    return (
      <group ref={group} {...props} dispose={null}>
        <primitive castShadow receiveShadow object={scene} />
      </group>
    );
  }

export default function Home() {
    const dispatch = useDispatch();

    const [input, setInput] = useState('')
    const handleInputChange = (e) => setInput(e.target.value)

    const isError = input === ''

    const username = useSelector((state) => state.userInfo.username);
    const email = useSelector((state) => state.userInfo.email);

    return (
        <>
            <Box className="flex flex-col border-t border-gray-600 md:border-transparent">
                <Text className="mt-2 md:mt-0 mb-2 text-5xl">
                    I am so <b>proud</b> of you for making all the way here.
                </Text>

                <Text className="mb-5 text-5xl mt-5 md:mt-0">
                    If you don't mind me asking, <b>what should I call you?</b>
                </Text>

                <Text className="mb-5 text-2xl mt-5 md:mt-0">
                    This is a safe space where you can share anything that you would like to.<br></br>
                    <span className="mt-10 md:mt-0">I am powered by <b>deep learning</b>, so my conversation skills will improve from time to time as we get to know each other a bit more.</span>
                </Text>

                <FormControl isInvalid={isError}>
                    <Stack direction={['column', 'row']} spacing={2}>
                        <Input placeholder='Enter your response...' marginRight={"10px"} width={"75%"} className="generic-text" />

                        <Button width={"min-content"} leftIcon={<MdDoneOutline />} colorScheme='orange' variant='solid' onClick={() => {
                            dispatch(setUsername(""));
                        }}>
                            <span className="font-bold">Submit</span>
                        </Button>
                    </Stack>

                    {isError && (
                        <FormErrorMessage className="generic-text">Invalid entry. Please try it again.</FormErrorMessage>
                    )}
                </FormControl>

                <Text className="text-xl mb-5 mt-2">
                    View our Zero-tolerant <span className="text-blue-200 font-bold hover:underline">Privacy Policy</span>. We cannot access or sell any <b>encrypted</b> private information that you have provided us.
                </Text>
            </Box>

            <Box style={{ width: "fit-parent", height: "85vh" }}>
                <Canvas camera={{ fov: 15, position: [-25, 0, 0] }}>
                    <Suspense fallback={null}>
                        <Character />
                    </Suspense>

                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                    <pointLight position={[-10, -10, -10]} />
                </Canvas>
            </Box>
        </>
    );
}