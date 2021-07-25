import { useEffect } from 'react'
import { NavLink } from 'react-router-dom';
import { BiWallet } from 'react-icons/bi'
import Web3 from 'web3'
import TokenDeployer from '../contracts/TokenDeployer.json'

const NavBar = ({ items, state, colors, accountState, setWeb3, setTDInstance }) => {

    const connectWallet = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        accountState[1](account);

        if (window.ethereum) { //check if Metamask is installed
            try {
                const address = await window.ethereum.enable(); //connect Metamask
                const obj = {
                    connectedStatus: true,
                    status: "",
                    address: address,
                }
                return obj;
            } catch (error) {
                return {
                    connectedStatus: false,
                    status: "🦊 Connect to Metamask using the button on the top right."
                }
            }
        } else {
            return {
                connectedStatus: false,
                status: "🦊 You must install Metamask into your browser: ",
            }
        }
    };



    async function connectToDeployer() {
        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        setWeb3(web3)

        const networkId = await web3.eth.getChainId();
        console.log(networkId)
        const deployedAddress = await TokenDeployer.networks[networkId].address;
        let tdinstance = new web3.eth.Contract(
            TokenDeployer.abi,
            deployedAddress
        );
        setTDInstance(tdinstance);
        console.log(tdinstance)
    }

    useEffect(() => {
        connectToDeployer()
    }, [])

    const disabledStyle = "text-gray-400 hover:text-gray-300";
    const activeStyle = "font-bold";
    return (
        <nav className="flex space-x-2 w-full border-b bg-gray-100 border-gray-200 px-2 py-1 sticky top-0">
            {items.map((item, idx) => <NavLink key={idx} to={item.href}
                className={`w-1/2 p-2 cursor-pointer text-center ${state[0] === idx ? `text-green-400 ${activeStyle}` : disabledStyle}`}
                onClick={() => state[1](idx)}>{item.title}</NavLink>)}

            <button onClick={connectWallet} className="py-2 px-4 rounded-lg bg-green-400 hover:bg-green-300 text-white"><BiWallet /></button>
        </nav>
    )
}

export default NavBar
