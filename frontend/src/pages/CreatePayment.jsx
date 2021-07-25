import { useState } from 'react';
import SelectorGroup from '../components/SelectorGroup';
import Switcher from '../components/Switcher';
import { CgArrowsExchangeV } from 'react-icons/cg'
import USDCLogo from '../assets/usdc-logo.svg'
import Web3 from 'web3';

const CreatePayment = ({ signerAdx, accountState, web3, TDInstance }) => {
    const registry = '0x4545e91d2e3647808670DD045eA5f4079B436EbC'
    const priceModelState = useState(0);
    const [tokenA, setTokenA] = useState('');
    const [tokenB, setTokenB] = useState('');
    const splitState = useState(0);
    const [id, setId] = useState('');
    const [usdcAmt, setUsdcAmt] = useState(0)
    const [poolExists, setPoolExists] = useState(true)

    let inputStyle = "p-2 rounded-lg bg-gray-100 w-full outline-none placeholder-gray-600 text-gray-400";
    const ContComp = <SelectorGroup items={['25', '50', '75']} state={splitState} space={2} title="Token A Split" />

    async function submitEvent() {
        let AID = tokenA.indexOf('-') > -1 ? tokenA.split('-')[0] : tokenA.split(':')[1];
        let BID = tokenB.indexOf('-') > -1 ? tokenB.split('-')[0] : tokenB.split(':')[1];

        if (priceModelState[0] === 0)
            setId(AID + BID + 'x')
        else {
            let ASplit = 25 * Number(splitState[0] + 1);
            let BSplit = 100 - Number(ASplit);

            setId(AID + ASplit.toString() + BID + BSplit.toString())
        }

        console.log(id);
        console.log("Checking if pool exists")
        let exists = await TDInstance.methods.tokenPairExists(web3.utils.asciiToHex(id)).call()
        console.log(exists)
        setPoolExists(exists)

        //set price

    }

    async function buyEvent() {
        console.log(25 * Number(splitState[0] + 1))
        //Create Pool
        if (!poolExists) {
            await TDInstance.methods.createNewBlend(web3.utils.asciiToHex(tokenA),
                web3.utils.asciiToHex(tokenB),
                priceModelState[0],
                (25 * Number(splitState[0] + 1) * 100).toString(),
                web3.utils.asciiToHex(id),
                registry).call()
        }
        // Buy Function
    }

    return (
        <div>
            <div className="flex pt-20 items-center space-x-2">
                <div className="rounded-full h-6 w-10 bg-green-300 border-4 border-green-200"></div>
                <span className="text-3xl font-bold text-gray-700">Buy Blends</span>
            </div>

            <h3 className="text-sm text-gray-400 mt-5">Deposit address <i className="italic">(from Metamask)</i></h3>
            <p className="text-xs overflow-hidden p-3 w-full rounded-md text-gray-800 outline-none active:border-green-500 bg-gray-100" >{accountState[0]}</p>

            <SelectorGroup title='Price Model' items={['Product', 'wSum']} state={priceModelState} />

            <div className={`py-1 space-y-2`}>
                <div className="flex space-x-2 w-full ">
                    <div className="border-2 w-1/2 p-2 cursor-pointer rounded-lg text-center">Token A</div>
                    <input type="text" className={inputStyle} placeholder={tokenA} onChange={e => setTokenA(e.target.value)} />
                </div>
                <div className="flex space-x-2 w-full ">
                    <div className="border-2 w-1/2 p-2 cursor-pointer rounded-lg text-center">Token B</div>
                    <input type="text" className={inputStyle} placeholder={tokenB} onChange={e => setTokenB(e.target.value)} />
                </div>
            </div>

            {/* <SelectorGroup title="Payment type" items={['Single', 'Continuous']} state={typeState} /> */}
            <Switcher components={[<></>, ContComp]} state={priceModelState} />
            <button onClick={submitEvent} className='p-2 w-full rounded-lg bg-green-400 hover:bg-green-300 transition-colors text-white font-bold text-lg tracking-wide border-2 mt-8 mb-8'>Submit</button>

            <h3 className="pt-6 text-sm text-gray-400">Enter Amount ({id})</h3>
            <div className="flex items-center space-x-2">
                <img src={USDCLogo} alt="" className="h-8 w-8" />
                <input type="number" className={inputStyle} placeholder={usdcAmt} onChange={e => setTokenA(e.target.value)} />
            </div>
            <CgArrowsExchangeV className="mx-auto my-2 text-3xl text-green-400" />
            <input type="number" className={inputStyle} onChange={e => setUsdcAmt(e.target.value)} />


            <button onClick={buyEvent} className='p-2 w-full rounded-lg bg-green-400 hover:bg-green-300 transition-colors text-white font-bold text-lg tracking-wide border-2 mt-8 mb-8'>{poolExists ? "Buy Tokens" : "Create Pool"}</button>
        </div>
    )
}

export default CreatePayment
