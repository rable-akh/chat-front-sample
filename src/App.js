import logo from './logo.svg';
import './App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

import {ThemeProvider} from 'react-bootstrap'
import RouterConfig from './route';
import { PeerProvider } from './cores/Peer.Provider';

function App() {
  return (
    <ThemeProvider>
      <PeerProvider>
        <RouterConfig/>
      </PeerProvider>
    </ThemeProvider>
  );
}

export default App;
