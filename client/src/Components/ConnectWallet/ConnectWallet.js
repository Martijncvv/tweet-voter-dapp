import './ConnectWallet.css'
import React, { useEffect, useState } from 'react'

import Button from 'react-bootstrap/Button'

const ConnectWallet = ({ connectWallet }) => {
	const [isLoading, setIsLoading] = useState(false)

	const handleClick = async () => {
		setIsLoading(true)
		await connectWallet()
		setIsLoading(false)
	}

	return (
		<div id="ConnectWallet-field">
			<Button
				variant="primary"
				disabled={isLoading}
				onClick={() => (!isLoading ? handleClick() : null)}
			>
				{isLoading ? 'Connecting…' : 'Connect'}
			</Button>
		</div>
	)
}

export default ConnectWallet
