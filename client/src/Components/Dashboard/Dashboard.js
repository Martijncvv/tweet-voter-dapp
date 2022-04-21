import './Dashboard.css'
import 'bootstrap/dist/css/bootstrap.css'
import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { TwitterTweetEmbed } from 'react-twitter-embed'

import Button from 'react-bootstrap/Button'

const Dashboard = ({
	TWEET_VOTER_CONTRACT_ADDRESS,
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

	const [infoBar, setInfoBar] = useState('This is a info alert—check it out')
	const [sortingOption, setSortingOption] = useState('date')

	useEffect(() => {
		getPlatformStats()
		getAccountStats()
		getAllTweets()
	}, [])

	const getPlatformStats = async () => {
		const amount = await tweetVoteContract.getTotalTweets()
		setTotalPlatformTweets(amount.toNumber())

		const platformFees = await tweetVoteContract.getFees()
		let platformFeesCleaned = {
			platformFee: platformFees.platformFee.toNumber(),
			tweetTokenFee: platformFees.tweetTokenFee.toNumber(),
			tweetWeiFee: platformFees.tweetEthFee.toNumber(),
			likeTokenFee: platformFees.likeTokenFee.toNumber(),
			likeWeiFee: platformFees.likeEthFee.toNumber(),
		}

		setPlatformFees(platformFeesCleaned)

		const platformBalance = await provider.getBalance(
			TWEET_VOTER_CONTRACT_ADDRESS
		)
		setPlatformBalance(platformBalance.toNumber())
	}

	const getAccountStats = async () => {
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

		const accountTokenBalance = await tvTokenContract.balanceOf(currentAccount)
		setAccountTokenBalance(accountTokenBalance.toNumber())
	}

	const getAllTweets = async () => {
		const allTweets = await tweetVoteContract.getAllTweets()

		let cleanedTweets = []
		allTweets.forEach((tweet) => {
			cleanedTweets.push({
				id: tweet.tweetId.toNumber(),
				url: tweet.tweetUrl.substring(tweet.tweetUrl.length - 19),
				likes: tweet.likes.toNumber(),
				owner: tweet.tweetOwner,
				feeReceiver: tweet.feeReceiver,
				timestamp: tweet.timestamp.toNumber(),
			})
		})
		setAllTweets(cleanedTweets)
		console.log(cleanedTweets)
	}

	const handleSubmitTweetButton = async (feeType) => {
		if (tweetUrlInput && feeAddressInput) {
			if (feeType === 'ethPayment') {
				let submitTweetTx = await tweetVoteContract.submitTweet(
					tweetUrlInput,
					feeAddressInput,
					{
						value: platformFees.tweetWeiFee.toString(),
					}
				)
				setInfoBar(`Mining... Tx ${submitTweetTx.hash}`)
				console.log('Mining...Tx', submitTweetTx.hash)
				await submitTweetTx.wait()
				setInfoBar(`Mined -- Tx ${submitTweetTx.hash}`)
				console.log('Mined -- Tx', submitTweetTx.hash)
			} else {
				let submitTweetTx = await tweetVoteContract.submitTweet(
					tweetUrlInput,
					feeAddressInput
				)

				setInfoBar(`Mining... Tx${submitTweetTx.hash}`)
				console.log('Mining... Tx', submitTweetTx.hash)
				await submitTweetTx.wait()
				setInfoBar(`Mined -- Tx${submitTweetTx.hash}`)
				console.log('Mined -- Tx', submitTweetTx.hash)
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
			let submitLikeTx = await tweetVoteContract.likeTweet(tweetId, {
				value: platformFees.likeWeiFee.toString(),
			})

			setInfoBar(`Mining... Tx${submitLikeTx.hash}`)
			console.log('Mining... Tx', submitLikeTx.hash)
			await submitLikeTx.wait()
			setInfoBar(`Mined -- Tx${submitLikeTx.hash}`)
			console.log('Mined -- Tx', submitLikeTx.hash)
		} else {
			let submitLikeTx = await tweetVoteContract.likeTweet(tweetId)

			console.log('Mining... Tx', submitLikeTx.hash)
			await submitLikeTx.wait()
			console.log('Mined -- Tx', submitLikeTx.hash)
		}
		getAllTweets()
		setTimeout(function () {
			setInfoBar('')
		}, 2000)
	}

	const handleSortingChange = (_sortingOption) => {
		setSortingOption(_sortingOption)
	}

	const sortTweets = (tweets) => {
		switch (sortingOption) {
			case 'date':
				return tweets.sort(compareDate)
			case 'likes':
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

	return (
		<div className="container-fluid px-4 py-3">
			<nav className="navbar navbar-light bg-light">
				<span className="navbar-brand mb-0 h1">Twitt3r</span>

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
					<button type="button" className="btn mx-1">
						Sort Tweets
					</button>
					<button
						type="button"
						className={
							sortingOption === 'date'
								? 'btn btn-info mx-1'
								: 'btn btn-outline-info mx-1'
						}
						onClick={() => handleSortingChange('date')}
					>
						Date
					</button>
					<button
						type="button"
						className={
							sortingOption === 'likes'
								? 'btn btn-info mx-1'
								: 'btn btn-outline-info mx-1'
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
						<table className="table table-striped">
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
										{platformFees.tweetTokenFee} TVT ||{' '}
										{ethers.utils.formatEther(platformFees.tweetWeiFee)} Ξ
									</td>
								</tr>
								<tr>
									<td>Like fee</td>
									<td>
										{' '}
										{platformFees.likeTokenFee} TVT || *
										{ethers.utils.formatEther(platformFees.likeWeiFee)} Ξ
									</td>
								</tr>
								<tr>
									<td>*Platform fee</td>
									<td>{platformFees.platformFee}%</td>
								</tr>
							</tbody>
						</table>

						<table className="table table-striped">
							<thead>
								<tr>
									<th>Account Stats</th>
								</tr>
							</thead>
							<tbody>
								<tr>
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
									<td>{accountTokenBalance}</td>
								</tr>
							</tbody>
						</table>

						<div id="dashboard-input-form">
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
									placeholder="Like Fee Receiver Address"
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
									className="btn btn-outline-info mx-1"
									disabled={
										!tweetUrlInput ||
										!feeAddressInput ||
										accountTokenBalance < 5
									}
									onClick={() => handleSubmitTweetButton('tokenPayment')}
								>
									Submit ({platformFees.tweetTokenFee} TVT)
								</button>
								<button
									type="button"
									className="btn btn-outline-info mx-1"
									disabled={!tweetUrlInput || !feeAddressInput}
									onClick={() => handleSubmitTweetButton('ethPayment')}
								>
									Submit ({ethers.utils.formatEther(platformFees.tweetWeiFee)}{' '}
									Ξ)
								</button>
							</div>
						</div>
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
												<div
													className="btn-group-sm"
													role="group"
													aria-label="Basic example"
												>
													<div className="btn ">❤️ {tweet.likes} </div>
													<button
														className="btn btn-outline-info mx-1"
														disabled={accountTokenBalance < 1}
														onClick={() =>
															handleLikeTweetButton('tokenPayment', tweet.id)
														}
													>
														♡ ({platformFees.likeTokenFee} TVT)
													</button>
													<button
														className="btn btn-outline-info mx-1"
														onClick={() =>
															handleLikeTweetButton('ethPayment', tweet.id)
														}
													>
														♡ (
														{ethers.utils.formatEther(platformFees.likeWeiFee)}{' '}
														Ξ)
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
