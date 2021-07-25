import { useState } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import CreatePayment from './pages/CreatePayment';
import Payments from './pages/Payments';
import NavBar from './components/NavBar';

function App() {
  const accountState = useState('Signer Address');
  let [page, updatePage] = useState(0);
  const [web3, setWeb3] = useState()
  const [TDInstance, setTDInstance] = useState()

  return (
    <div className="App">
      <Router>
        <NavBar items={[{ title: 'Create', href: '/' }, { title: 'Pay', href: '/pay' }]} state={[page, updatePage]} accountState={accountState} setWeb3={setWeb3} setTDInstance={setTDInstance}/>
        <div className="px-4">
          <Route exact path="/">
            <CreatePayment signerAdx={"signerAdx"} accountState={accountState} web3={web3} TDInstance={TDInstance}/>
          </Route>

          <Route path='/pay'>
            <Payments signerAdx={"signerAdx"} />
          </Route>
        </div>
      </Router>
    </div>
  );
}

export default App;