import './Sidebar.css'
import 'bootstrap/dist/css/bootstrap.css'
import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'

const Sidebar = ({
	ethereum,
	TWEET_VOTER_CONTRACT_ADDRESS,
	TVTOKEN_CONTRACT_ADDRESS,
	tweetVoteContract,
	tvTokenContract,
	provider,
	currentAccount,
	infoBar,
	platformFees,
	setPlatformFees,
	setAccountTokenBalance,
	accountTokenBalance,
	setInfoBar,
}) => {
	const [tweetUrlInput, setTweetUrlInput] = useState('')
	const [feeAddressInput, setFeeAddressInput] = useState('')

	const [totalPlatformTweets, setTotalPlatformTweets] = useState(0)

	const [platformBalance, setPlatformBalance] = useState(0)

	const [accountTweetIds, setAccountTweetIds] = useState(0)
	const [accountTweetAmount, setAccountTweetAmount] = useState(0)

	useEffect(() => {
		getPlatformStats()
		getAccountStats()
	}, [infoBar])

	const getPlatformStats = async () => {
		try {
			const amount = await tweetVoteContract.getTotalTweets()
			setTotalPlatformTweets(amount.toNumber())

			const platformFees = await tweetVoteContract.getFees()

			let platformFeesCleaned = {
				platformFee: platformFees.platformFee.toNumber(),
				tweetEthFee: ethers.utils.formatEther(platformFees.tweetWeiFee),
				likeEthFee: ethers.utils.formatEther(platformFees.likeWeiFee),
				likeTokenFee: ethers.utils.formatEther(platformFees.likeTokenFee),
				tweetTokenFee: ethers.utils.formatEther(platformFees.tweetTokenFee),
			}

			setPlatformFees(platformFeesCleaned)

			const platformBalance = await provider.getBalance(
				TWEET_VOTER_CONTRACT_ADDRESS
			)
			setPlatformBalance(platformBalance.toNumber())
		} catch (error) {
			console.log(error)
		}
	}

	const getAccountStats = async () => {
		try {
			const accountTweetIds = await tweetVoteContract.getAllTweetIdsByAccount(
				currentAccount
			)
			let accountTweetIdsCleaned = []
			accountTweetIds.forEach((tweetId) => {
				accountTweetIdsCleaned.push(tweetId.toNumber())
			})
			setAccountTweetIds(accountTweetIdsCleaned)

			const accountTweetAmount = await tweetVoteContract.getAccountTweetsAmount(
				currentAccount
			)
			setAccountTweetAmount(accountTweetAmount.toNumber())

			const accountTokenBalance = await tvTokenContract.balanceOf(
				currentAccount
			)
			setAccountTokenBalance(ethers.utils.formatEther(accountTokenBalance))
		} catch (error) {
			console.log(error)
		}
	}

	const handleSubmitTweetButton = async (feeType) => {
		if (tweetUrlInput && feeAddressInput) {
			if (feeType === 'ethPayment') {
				try {
					let submitTweetTx = await tweetVoteContract.submitTweet(
						tweetUrlInput,
						feeAddressInput,
						{
							value: platformFees.tweetEthFee * 10 ** 18,
						}
					)

					setInfoBar(`Mining... Tx ${submitTweetTx.hash}`)
					console.log('Mining...Tx', submitTweetTx.hash)
					await submitTweetTx.wait()
					setInfoBar(`Mined -- Tx ${submitTweetTx.hash}`)
					console.log('Mined -- Tx', submitTweetTx.hash)
				} catch (error) {
					console.log(error)
				}
			} else {
				try {
					let submitTweetTx = await tweetVoteContract.submitTweet(
						tweetUrlInput,
						feeAddressInput
					)
					setInfoBar(`Mining... Tx${submitTweetTx.hash}`)
					console.log('Mining... Tx', submitTweetTx.hash)
					await submitTweetTx.wait()
					setInfoBar(`Mined -- Tx${submitTweetTx.hash}`)
					console.log('Mined -- Tx', submitTweetTx.hash)
				} catch (error) {
					console.log(error)
				}
			}
			setTweetUrlInput('')
			setFeeAddressInput('')

			setTimeout(function () {
				setInfoBar('')
			}, 2000)
		}
	}

	const handleAddTokenMmButton = async () => {
		const tokenAddress = TVTOKEN_CONTRACT_ADDRESS
		const tokenSymbol = 'TVT'
		const tokenDecimals = 18
		const tokenImage =
			'https://iconsplace.com/wp-content/uploads/_icons/ffa500/256/png/twitter-2-icon-11-256.png'

		try {
			const wasAdded = await ethereum.request({
				method: 'wallet_watchAsset',
				params: {
					type: 'ERC20',
					options: {
						address: tokenAddress,
						symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
						decimals: tokenDecimals,
						image: tokenImage, // A string url of the token logo
					},
				},
			})

			if (wasAdded) {
				console.log('Added!')
			} else {
				console.log("Couldn't add")
			}
		} catch (error) {
			console.log(error)
		}
	}

	return (
		<div id="dashboard-sidebar" className="col-2">
			<table className="table table-striped mb-4">
				<thead>
					<tr>
						<th>Account Stats</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Account</td>
						<td>
							{currentAccount.substring(0, 6) +
								'...' +
								currentAccount.substring(currentAccount.length - 4)}
						</td>
						<td></td>
					</tr>
					<tr>
						<td>Tweet IDs</td>
						{accountTweetIds && (
							<td>
								{accountTweetIds.map((tweetId, index) => (
									<span key={index}> {tweetId},</span>
								))}
							</td>
						)}
					</tr>
					<tr>
						<td>Tweet Amount</td>
						<td>{accountTweetAmount}</td>
					</tr>
					<tr>
						<td>TVT Balance</td>
						<td>
							{parseInt(accountTokenBalance)}{' '}
							<button
								type="button"
								className="btn btn-outline-secondary btn-sm mx-2"
								onClick={() => handleAddTokenMmButton()}
							>
								Add
							</button>
						</td>
					</tr>
				</tbody>
			</table>

			<h4>Submit Tweet</h4>

			<div className="input-group mb-3">
				<span className="input-group-text" id="basic-addon1">
					🐦
				</span>
				<input
					type="text"
					className="form-control dashboard-input"
					placeholder="Tweet URL"
					autoComplete="off"
					aria-describedby="basic-addon1"
					value={tweetUrlInput}
					onChange={(event) => setTweetUrlInput(event.target.value)}
					onClick={() => setTweetUrlInput('')}
				/>
			</div>
			<div className="input-group mb-3">
				<span className="input-group-text" id="basic-addon1">
					📩
				</span>
				<input
					className="form-control dashboard-input"
					placeholder="Tip Receiver Address"
					autoComplete="off"
					value={feeAddressInput}
					onChange={(event) => setFeeAddressInput(event.target.value)}
					onClick={() => setFeeAddressInput('')}
				/>
			</div>
			<div className="btn-group-sm" role="group" aria-label="Basic example">
				<button
					type="button"
					className="btn btn-outline-primary mx-1"
					disabled={
						!tweetUrlInput || !feeAddressInput || accountTokenBalance < 5
					}
					onClick={() => handleSubmitTweetButton('tokenPayment')}
				>
					Submit ({parseInt(platformFees.tweetTokenFee)} TVT)
				</button>
				<button
					type="button"
					className="btn btn-outline-primary mx-1"
					disabled={!tweetUrlInput || !feeAddressInput}
					onClick={() => handleSubmitTweetButton('ethPayment')}
				>
					Submit ({platformFees.tweetEthFee} Ξ)
				</button>
			</div>
			<table className="table table-striped mt-4">
				<thead>
					<tr>
						<th>Platform Stats</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Total Tweets</td>
						<td>{totalPlatformTweets}</td>
					</tr>
					<tr>
						<td>Balance</td>
						<td> {ethers.utils.formatEther(platformBalance)} Ξ</td>
					</tr>
				</tbody>
			</table>
			<table className="table table-striped">
				<thead>
					<tr>
						<th>Platform Fees</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Tweet Fee</td>
						<td>
							{' '}
							{parseInt(platformFees.tweetTokenFee)} TVT or{' '}
							{platformFees.tweetEthFee} Ξ
						</td>
					</tr>
					<tr>
						<td>Poster Tip</td>
						<td>
							{' '}
							{parseInt(platformFees.likeTokenFee)} TVT or *
							{platformFees.likeEthFee} Ξ
						</td>
					</tr>

					<tr>
						<td>*Platform fee</td>
						<td>{platformFees.platformFee}%</td>
					</tr>
					<tr>
						<td>Tweet with ETH</td>
						<td>Receive 5 TVT</td>
					</tr>
					<tr>
						<td>Like with ETH</td>
						<td>Receive 1 TVT</td>
					</tr>
				</tbody>
			</table>
			<button
				type="button"
				className="btn btn-outline-secondary"
				onClick={() =>
					window.open('https://faucets.chain.link/rinkeby', '_blank')
				}
			>
				Get free Rinkeby ETH
			</button>
		</div>
	)
}

export default Sidebar
