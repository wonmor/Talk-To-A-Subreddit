import { useEffect, useState } from 'react';

import io from 'socket.io-client';

const socket = io.connect('https://localhost:5000')

export default function Chat() {
    const [state, setState] = useState({message: '', name: ''})
    const [chat,setChat] = useState([])

    useEffect(() => {
        socket.on('message',({name,message}) => {
            setChat([...chat,{name,message}])
        });
    }, [chat]);

    const onTextChange = e =>{
        setState({...state,[e.target.name]: e.target.value});
    };
    
    const onMessageSubmit =(e)=>{
        e.preventDefault()
        const {name, message} = state
        socket.emit('message',{name, message})
        setState({message : '', name})
    };

    const renderChat =()=>{
        return chat.map(({name, message}, index) => (
            <div key={index}>
                <h3>{name}:<span>{message}</span></h3>
            </div>
        ));
    }; 

    return (
        <h1 className="text-4xl">
            This is <b>chat</b> page. Website is currently under construction.
        </h1>
    );
}