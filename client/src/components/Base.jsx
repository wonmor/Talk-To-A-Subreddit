import './Base.css';

import { Suspense } from 'react';
import { useNavigate } from "react-router-dom";
import { FaGithub, FaLinkedin, FaMoneyBillWave } from 'react-icons/fa'

import { Mount } from "./utilities/Transitions";

import {
  Box,
  Flex,
  HStack,
  Button,
  Link,
  Image,
  IconButton,
  Container,
  Text,
  ButtonGroup,
  useDisclosure,
  useColorModeValue,
  Stack,
} from '@chakra-ui/react';

import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';

const Links = ['Docs', 'API', 'About'];

function NavLink({ children, onClose }) {
  const navigate = useNavigate();
  const pathname = window.location.pathname;

  return (
    <Link
      px={2}
      py={1}
      bg={pathname.replace("/", "") === children ? 'gray.700' : 'transparent'}
      rounded={'md'}
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.700', 'gray.700'),
      }}
      onClick={() => {
        navigate(`/${children}`);
        onClose();
      }}>
      {children}
    </Link>
  );
}

const Footer = () => {
  return (
    <Container as="footer" role="contentinfo" py={{ base: '12', md: '16' }}>
      <Stack spacing={{ base: '4', md: '5' }}>
        <Stack justify="space-between" direction="row" align="center">
          <ButtonGroup variant="outline">
            <IconButton
              as="a"
              href="https://www.linkedin.com/in/john-seong-9194321a9/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              icon={<FaLinkedin fontSize="1.25rem" />}
            />
            <IconButton as="a" href="https://github.com/wonmor" target="_blank" rel="noopener noreferrer" aria-label="GitHub" icon={<FaGithub fontSize="1.25rem" />} />
          </ButtonGroup>
        </Stack>
        <Text fontSize="sm" color="subtle">
          &copy; {new Date().getFullYear()} <b>John Seong</b>. Served under the <b>MIT</b> License.
        </Text>
      </Stack>
    </Container>
  );
}

export default function Base(props) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const navigate = useNavigate();

  return (
    <Box textColor={'white'}>
      <Box bg={useColorModeValue('gray.900', 'gray.100')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            colorScheme={'transparent'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />

          <HStack spacing={8} alignItems={'center'}>

            <Image className="logo-button" src="logo.svg" onClick={() => {
              navigate('/');
              onClose();
            }} />

            <HStack
              as={'nav'}
              spacing={4}
              display={{ base: 'none', md: 'flex' }}>
              {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
            </HStack>
          </HStack>

          <Flex alignItems={'center'}>
            <Button
              variant={'solid'}
              colorScheme={'cyan'}
              size={'sm'}
              leftIcon={<FaMoneyBillWave />}>
              <span className='font-bold'>
                Donate
              </span>
            </Button>
          </Flex>
        </Flex>

        {isOpen &&
          <Mount content={
            <Box pb={4} display={{ md: 'none' }}>
              <Stack as={'nav'} spacing={4}>
                {Links.map((link) => (
                  <NavLink key={link} onClose={onClose}>{link}</NavLink>
                ))}
              </Stack>
            </Box>
          } show={true} />}
      </Box>

      <Box p={4}>
        <Image className="logo-button pb-2" src="logo.svg" onClick={() => {
          navigate('/');
          onClose();
        }} marginBottom="20px" display={{ md: 'none' }} />
        {/* Main Content goes here... */}
        <Suspense>
          <props.content />
        </Suspense>
        <Footer />
      </Box>
    </Box>
  );
}