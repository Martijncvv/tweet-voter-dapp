import './App.css'
import 'bootstrap/dist/css/bootstrap.css'
import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'

import Dashboard from './Components/Dashboard'
import ConnectWallet from './Components/ConnectWallet'

import TWEET_VOTER_CONTRACT_JSON from './utils/TweetVoter.json'
import TVTOKEN_CONTRACT_JSON from './utils/TVToken.json'

const TWEET_VOTER_CONTRACT_ADDRESS =
	'0xAD24CEe9C6E4f51124634B2b9C923115333A8456'
const TVTOKEN_CONTRACT_ADDRESS = '0xFbAb7b6d17B0cF5804d6D354c34Ca2607a274302'

const tweetContractABI = TWEET_VOTER_CONTRACT_JSON.abi
const tvTokenContractABI = TVTOKEN_CONTRACT_JSON.abi

function App() {
	const [currentAccount, setCurrentAccount] = useState('')
	const [ethereum, setEthereum] = useState('')
	const [provider, setProvider] = useState('')

	const [tweetVoteContract, setTweetVoteContract] = useState('')
	const [tvTokenContract, setTvTokenContract] = useState('')

	useEffect(() => {
		checkIfWalletIsConnected()
	}, [currentAccount])

	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum } = window
			setEthereum(ethereum)

			if (!ethereum) {
				console.log('Make sure you have metamask!')
				return
			} else {
				console.log('We have the ethereum object', ethereum)
			}

			let etherProvider = new ethers.providers.Web3Provider(ethereum)
			let etherSigner = etherProvider.getSigner()

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
					TVTOKEN_CONTRACT_ADDRESS={TVTOKEN_CONTRACT_ADDRESS}
					ethereum={ethereum}
					currentAccount={currentAccount}
					provider={provider}
					tweetVoteContract={tweetVoteContract}
					tvTokenContract={tvTokenContract}
				/>
			)}
			<div>
				{!currentAccount && (
					<div>
						<div id="background"></div>

						<div className="container">
							<div className="row mt-5"></div>
							<div className="row mt-5"></div>
							<div className="row mt-5"></div>
							<div className="row mt-5">
								<div className="col-sm-2"></div>
								<div className="col-sm-8">
									<div className="card border-primary text-center">
										<div className="card-header "></div>
										<div className="card-body">
											<h5 className="card-title">Twitter Orange3</h5>
											<p className="card-text ">
												Web3 platform to share and view valuable Tweets
											</p>
											<ConnectWallet connectWallet={connectWallet} />
										</div>
										<div className="card-footer  text-muted">By Marty_cFly</div>
									</div>
								</div>
								<div className="col-sm-2"></div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default App
