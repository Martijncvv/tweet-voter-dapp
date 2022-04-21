import './App.css'
import 'bootstrap/dist/css/bootstrap.css'
import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'

import Dashboard from './Components/Dashboard'
import ConnectWallet from './Components/ConnectWallet'

import TWEET_VOTER_CONTRACT_JSON from './utils/TweetVoter.json'
import TVTOKEN_CONTRACT_JSON from './utils/TVToken.json'

const TWEET_VOTER_CONTRACT_ADDRESS =
	'0xd011cdB042bFF4AdF420FA3Fe359058E4426b6e8'
const TVTOKEN_CONTRACT_ADDRESS = '0xAcdaDa3D89FE6db8665B21f4C08829D5B34493f8'

const tweetContractABI = TWEET_VOTER_CONTRACT_JSON.abi
const tvTokenContractABI = TVTOKEN_CONTRACT_JSON.abi

function App() {
	const [currentAccount, setCurrentAccount] = useState('')
	const [provider, setProvider] = useState('')
	const [signer, setSigner] = useState('')
	const [tweetVoteContract, setTweetVoteContract] = useState('')
	const [tvTokenContract, setTvTokenContract] = useState('')

	useEffect(() => {
		checkIfWalletIsConnected()
	}, [])

	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum } = window

			if (!ethereum) {
				console.log('Make sure you have metamask!')
				return
			} else {
				console.log('We have the ethereum object', ethereum)
			}

			let etherProvider = new ethers.providers.Web3Provider(ethereum)
			let etherSigner = etherProvider.getSigner()

			setSigner(etherSigner)
			setProvider(etherProvider)

			const { chainId } = await etherProvider.getNetwork()

			if (chainId !== 4) {
				alert('Connect to Rinkeby test network')
			}

			const accounts = await ethereum.request({ method: 'eth_accounts' })

			if (accounts.length !== 0) {
				const account = accounts[0]
				console.log('Found an authorized account:', account)
				setCurrentAccount(account)

				const tweetVoteContract = await new ethers.Contract(
					TWEET_VOTER_CONTRACT_ADDRESS,
					tweetContractABI,
					etherSigner
				)
				setTweetVoteContract(tweetVoteContract)

				const tvTokenContract = await new ethers.Contract(
					TVTOKEN_CONTRACT_ADDRESS,
					tvTokenContractABI,
					etherSigner
				)
				setTvTokenContract(tvTokenContract)
			} else {
				console.log('No authorized account found')
			}
		} catch (error) {
			console.log(error)
		}
	}

	const connectWallet = async () => {
		try {
			const { ethereum } = window

			if (!ethereum) {
				alert('Get MetaMask!')
				return
			}

			const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

			console.log('Connected', accounts[0])
			setCurrentAccount(accounts[0])
		} catch (error) {
			console.log(error)
		}
	}

	return (
		<div className="App">
			{tweetVoteContract && (
				<Dashboard
					TWEET_VOTER_CONTRACT_ADDRESS={TWEET_VOTER_CONTRACT_ADDRESS}
					currentAccount={currentAccount}
					provider={provider}
					tweetVoteContract={tweetVoteContract}
					tvTokenContract={tvTokenContract}
				/>
			)}
			<div>
				{!currentAccount && (
					<div>
						<ConnectWallet connectWallet={connectWallet} />
					</div>
				)}
			</div>
		</div>
	)
}

export default App
