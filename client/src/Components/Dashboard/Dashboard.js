import './Dashboard.css'
import 'bootstrap/dist/css/bootstrap.css'
import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { TwitterTweetEmbed } from 'react-twitter-embed'
const TwitterLogo = require('../../static/twitter_logo.png')

const Dashboard = ({
	TWEET_VOTER_CONTRACT_ADDRESS,
	TVTOKEN_CONTRACT_ADDRESS,
	ethereum,
	currentAccount,
	provider,
	tweetVoteContract,
	tvTokenContract,
}) => {
	const [tweetUrlInput, setTweetUrlInput] = useState('')
	const [feeAddressInput, setFeeAddressInput] = useState('')

	const [totalPlatformTweets, setTotalPlatformTweets] = useState('')
	const [platformFees, setPlatformFees] = useState('')
	const [platformBalance, setPlatformBalance] = useState('')
	const [allTweets, setAllTweets] = useState([])

	const [accountTweetIds, setAccountTweetIds] = useState('')
	const [accountTweetAmount, setAccountTweetAmount] = useState('')
	const [accountTokenBalance, setAccountTokenBalance] = useState('')

	const [infoBar, setInfoBar] = useState('')
	const [sortingOption, setSortingOption] = useState('likes')

	useEffect(() => {
		getPlatformStats()
		getAccountStats()
		getAllTweets()
	}, [infoBar])

	const getPlatformStats = async () => {
		try {
			const amount = await tweetVoteContract.getTotalTweets()
			setTotalPlatformTweets(amount.toNumber())
		} catch (error) {
			console.log(error)
		}

		try {
			const platformFees = await tweetVoteContract.getFees()

			let platformFeesCleaned = {
				platformFee: platformFees.platformFee.toNumber(),
				tweetEthFee: ethers.utils.formatEther(platformFees.tweetWeiFee),
				likeEthFee: ethers.utils.formatEther(platformFees.likeWeiFee),
				likeTokenFee: ethers.utils.formatEther(platformFees.likeTokenFee),
				tweetTokenFee: ethers.utils.formatEther(platformFees.tweetTokenFee),
			}
			console.log('platformFeesCleaned', platformFeesCleaned)
			setPlatformFees(platformFeesCleaned)
		} catch (error) {
			console.log(error)
		}

		try {
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
		} catch (error) {
			console.log(error)
		}

		try {
			const accountTweetAmount = await tweetVoteContract.getAccountTweetsAmount(
				currentAccount
			)
			setAccountTweetAmount(accountTweetAmount.toNumber())
		} catch (error) {
			console.log(error)
		}

		try {
			const accountTokenBalance = await tvTokenContract.balanceOf(
				currentAccount
			)
			setAccountTokenBalance(ethers.utils.formatEther(accountTokenBalance))
		} catch (error) {
			console.log(error)
		}
	}

	const getAllTweets = async () => {
		try {
			const allTweets = await tweetVoteContract.getAllTweets()

			let cleanedTweets = []
			allTweets.forEach((tweet) => {
				cleanedTweets.push({
					id: tweet.tweetId.toNumber(),
					url: tweet.tweetUrl.split('/').at(-1),
					likes: tweet.likes.toNumber(),
					owner: tweet.tweetOwner,
					feeReceiver: tweet.feeReceiver,
					timestamp: tweet.timestamp.toNumber(),
				})
			})
			setAllTweets(cleanedTweets)
			console.log(cleanedTweets)
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
			getAllTweets()

			setTimeout(function () {
				setInfoBar('')
			}, 2000)
		}
	}
	const handleLikeTweetButton = async (feeType, tweetId) => {
		console.log('tweetId', tweetId)
		if (feeType === 'ethPayment') {
			console.log('likeEthFee', platformFees.likeEthFee)

			try {
				let submitLikeTx = await tweetVoteContract.likeTweet(tweetId, {
					value: platformFees.likeEthFee * 10 ** 18,
				})

				console.log(submitLikeTx)

				setInfoBar(`Mining... Tx${submitLikeTx.hash}`)
				console.log('Mining... Tx', submitLikeTx.hash)
				await submitLikeTx.wait()
				setInfoBar(`Mined -- Tx${submitLikeTx.hash}`)
				console.log('Mined -- Tx', submitLikeTx.hash)
			} catch (error) {
				console.log(error)
			}
		} else {
			try {
				let submitLikeTx = await tweetVoteContract.likeTweet(tweetId)

				setInfoBar(`Mining... Tx${submitLikeTx.hash}`)
				console.log('Mining... Tx', submitLikeTx.hash)
				await submitLikeTx.wait()
				setInfoBar(`Mined -- Tx${submitLikeTx.hash}`)
				console.log('Mined -- Tx', submitLikeTx.hash)
			} catch (error) {
				console.log(error)
			}
		}
		getAllTweets()
		setTimeout(function () {
			setInfoBar('')
		}, 2000)
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
						address: tokenAddress, // The address that the token is at.
						symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
						decimals: tokenDecimals, // The number of decimals in the token
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
	const handleTestnetEthRequestButton = async () => {
		try {
			// let submitLikeTx = await tweetVoteContract.likeTweet(tweetId, {
			// 	value: platformFees.likeEthFee * 10 ** 18,
			// })
			// console.log(submitLikeTx)
			// setInfoBar(`Requestin ETH... Tx${submitLikeTx.hash}`)
			// console.log('Requestin ETH... Tx', submitLikeTx.hash)
			// await submitLikeTx.wait()
			// setInfoBar(`Request Completed -- Tx${submitLikeTx.hash}`)
			// console.log('Request Completed -- Tx', submitLikeTx.hash)
		} catch (error) {
			console.log(error)
		}
	}

	const handleSortingChange = (_sortingOption) => {
		setSortingOption(_sortingOption)
	}

	const sortTweets = (tweets) => {
		switch (sortingOption) {
			case 'date':
				return tweets.sort(compareDate)
			default:
				return tweets.sort(compareLikes)
		}
	}

	const compareDate = (a, b) => {
		if (a.timestamp > b.timestamp) {
			return -1
		}
		if (a.timestamp < b.timestamp) {
			return 1
		}
		return 0
	}
	const compareLikes = (a, b) => {
		if (a.likes > b.likes) {
			return -1
		}
		if (a.likes < b.likes) {
			return 1
		}
		return 0
	}

	console.log('allTweets ', allTweets)

	return (
		<div className="container-fluid px-4 py-3">
			<nav className="navbar navbar-light bg-light">
				<span className="navbar-brand mb-0 ">
					<img
						src={TwitterLogo}
						alt="twitt3r orange logo"
						width="24"
						height="20"
						className="d-inline-block align-text-top mx-1"
					/>
					Twitt3r Orange
				</span>

				{infoBar && (
					<div className="alert alert-info w-50 " role="alert">
						{infoBar}
					</div>
				)}

				<div
					className="col-2 btn btn-group-toggle "
					aria-label="Basic example"
					data-toggle="buttons"
				>
					<button
						type="button"
						className={
							sortingOption === 'date'
								? 'btn btn-primary mx-1'
								: 'btn btn-outline-primary mx-1'
						}
						onClick={() => handleSortingChange('date')}
					>
						Date
					</button>
					<button
						type="button"
						className={
							sortingOption === 'likes'
								? 'btn btn-primary mx-1'
								: 'btn btn-outline-primary mx-1'
						}
						onClick={() => handleSortingChange('likes')}
					>
						Likes
					</button>
				</div>
			</nav>
			<div id="dashboard-field" className="row">
				{accountTweetAmount && platformBalance && (
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
									<td>
										{accountTweetIds.map((tweetId, index) => (
											<span key={index}> {tweetId},</span>
										))}
									</td>
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
						<div
							className="btn-group-sm"
							role="group"
							aria-label="Basic example"
						>
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
										{parseInt(platformFees.tweetTokenFee)} TVT ||{' '}
										{platformFees.tweetEthFee} Ξ
									</td>
								</tr>
								<tr>
									<td>Poster Tip</td>
									<td>
										{' '}
										{parseInt(platformFees.likeTokenFee)} TVT || *
										{platformFees.likeEthFee} Ξ
									</td>
								</tr>

								<tr>
									<td>*Platform fee</td>
									<td>{platformFees.platformFee}%</td>
								</tr>
								<tr>
									<td>Tweet </td>
									<td>Receive 5 TVT</td>
								</tr>
								<tr>
									<td>Like</td>
									<td>Receive 1 TVT</td>
								</tr>
							</tbody>
						</table>
					</div>
				)}

				<div id="dashboard-main" className="col-10">
					<div className="row row-cols-auto">
						{allTweets.length > 0 &&
							platformFees &&
							sortTweets(allTweets).map(
								(tweet, index) =>
									tweet.url.match(/^[0-9]+$/) != null && (
										<div className="dashboard-tweet col-3 mx-5" key={index}>
											<div className="dashboard-tweet-interaction-field mb-5">
												<TwitterTweetEmbed tweetId={tweet.url} />

												{tweet.url}
												<div
													className="btn-group-sm"
													role="group"
													aria-label="Basic example"
												>
													<button className="btn ">❤️ {tweet.likes} </button>

													<button
														className="btn btn-outline-primary mx-1"
														disabled={accountTokenBalance < 1}
														onClick={() =>
															handleLikeTweetButton('tokenPayment', tweet.id)
														}
													>
														♡ ({parseInt(platformFees.likeTokenFee)} TVT)
													</button>
													<button
														className="btn btn-outline-primary mx-1"
														onClick={() =>
															handleLikeTweetButton('ethPayment', tweet.id)
														}
													>
														♡ ({platformFees.likeEthFee} Ξ)
													</button>
													<button className="btn mx-1">
														{tweet.feeReceiver.substring(0, 5) +
															'...' +
															tweet.feeReceiver.substring(
																tweet.feeReceiver.length - 3
															)}
													</button>
												</div>
											</div>
										</div>
									)
							)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default Dashboard
