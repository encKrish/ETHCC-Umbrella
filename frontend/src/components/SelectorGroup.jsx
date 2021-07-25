const SelectorGroup = ({ items, state, title, space }) => {
    space = space === undefined ? 4 : space;
    const disabledStyle = "text-gray-500 hover:text-gray-400 hover:bg-gray-100 border-gray-300 bg-gray-200";
    const activeStyle = "text-white font-bold bg-green-400";
    return (
        <div>
            {title !== undefined ? <h3 className="pt-6 text-sm text-gray-400">{title}</h3> : <></>}
            <div className={`py-1 flex space-x-${space}`}>
                {items.map((item, idx) => <button key={idx} className={`border-2 w-1/2 p-2 cursor-pointer rounded-lg text-center ${state[0] === idx ? activeStyle : disabledStyle}`} onClick={() => state[1](idx)}>{item}</button>)}
            </div>
        </div>
    )
}

export default SelectorGroup
