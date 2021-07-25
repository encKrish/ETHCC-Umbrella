import React from 'react'

const Switcher = ({ components, state }) => {
    return (
        <>{components[state[0]]}</>
    )
}

export default Switcher
