import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import io from 'socket.io-client'

import {serverConfig} from '../config/config'

import Layout from "../components/Layout";
import Login from "../components/pages/login";
import Main from "../components/pages/Main";
import ChatPage from "../components/pages/ChatPage";

const socket = io(serverConfig.socketIP,{
    withCredentials: false,
});


export default function RouterConfig() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout/>}>
                    <Route index element={<ChatPage socket={socket}/>}/>
                </Route>
                <Route path="/login" element={<Login socket={socket}/>}/>
                <Route path="*" element={<p>Not Found</p>} />
            </Routes>
        </Router>
    )
}