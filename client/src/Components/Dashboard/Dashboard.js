import './Dashboard.css'
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
		console.log(platformFeesCleaned)

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
		console.log(accountTokenBalance.toNumber())
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

				console.log('Mining...', tweetUrlInput.hash)
				await submitTweetTx.wait()
				console.log('Mined -- ', submitTweetTx.hash)
			} else {
				let submitTweetTx = await tweetVoteContract.submitTweet(
					tweetUrlInput,
					feeAddressInput
				)

				console.log('Mining...', tweetUrlInput.hash)
				await submitTweetTx.wait()
				console.log('Mined -- ', submitTweetTx.hash)
			}
			getAllTweets()
		}
	}
	const handleLikeTweetButton = async (feeType, tweetId) => {
		console.log('tweetId', tweetId)
		if (feeType === 'ethPayment') {
			let submitTweetTx = await tweetVoteContract.likeTweet(tweetId, {
				value: platformFees.likeWeiFee.toString(),
			})

			console.log('Mining...', tweetUrlInput.hash)
			await submitTweetTx.wait()
			console.log('Mined -- ', submitTweetTx.hash)
		} else {
			let submitTweetTx = await tweetVoteContract.likeTweet(tweetId)

			console.log('Mining...', tweetUrlInput.hash)
			await submitTweetTx.wait()
			console.log('Mined -- ', submitTweetTx.hash)
		}
		getAllTweets()
	}

	return (
		<div id="dashboard-field">
			{accountTweetAmount && platformBalance && (
				<div id="dashboard-sidebar">
					<h1>TWITT3R</h1>
					<div id="dashboard-platform-info">
						<h3>Platform Stats</h3>
						<div>Total Tweets {totalPlatformTweets}</div>
						<div>Balance {ethers.utils.formatEther(platformBalance)} Ξ</div>
						<h4>Platform fees</h4>

						<div>
							Tweet Fee {platformFees.tweetTokenFee} TVT ||{' '}
							{ethers.utils.formatEther(platformFees.tweetWeiFee)} Ξ
						</div>

						<div>
							Like fee {platformFees.likeTokenFee} TVT || *
							{ethers.utils.formatEther(platformFees.likeWeiFee)} Ξ
						</div>

						<div>*platform fee: {platformFees.platformFee}% </div>
					</div>

					<div id="dashboard-account-info">
						<h3>Account Stats</h3>
						<div>{currentAccount}</div>
						<div id="dashboard-account-tweetids">
							Tweet IDs{'  '}
							{accountTweetIds.map((tweetId, index) => (
								<div key={index}> {tweetId},</div>
							))}
						</div>
						<div>Tweets {accountTweetAmount}</div>
						<div>TVT {accountTokenBalance}</div>
					</div>

					<div id="dashboard-input-form">
						<h3>Submit Tweet</h3>
						<div>
							<input
								className="dashboard-input"
								placeholder="Tweet URL"
								autoComplete="off"
								value={tweetUrlInput}
								onChange={(event) => setTweetUrlInput(event.target.value)}
								onClick={() => setTweetUrlInput('')}
							/>
						</div>
						<div>
							<input
								className="dashboard-input"
								placeholder="Fee receiver Address"
								autoComplete="off"
								value={feeAddressInput}
								onChange={(event) => setFeeAddressInput(event.target.value)}
								onClick={() => setFeeAddressInput('')}
							/>
						</div>
						<div>
							<Button
								variant="primary"
								disabled={
									!tweetUrlInput || !feeAddressInput || accountTokenBalance < 5
								}
								onClick={() => handleSubmitTweetButton('tokenPayment')}
							>
								Submit ({platformFees.tweetTokenFee} TVT)
							</Button>
							<Button
								variant="primary"
								disabled={!tweetUrlInput || !feeAddressInput}
								onClick={() => handleSubmitTweetButton('ethPayment')}
							>
								Submit ({ethers.utils.formatEther(platformFees.tweetWeiFee)} Ξ)
							</Button>
						</div>
					</div>
				</div>
			)}

			<div id="dashboard-main">
				{allTweets.length > 0 &&
					platformFees &&
					allTweets.map(
						(tweet, index) =>
							tweet.url.match(/^[0-9]+$/) != null && (
								<div className="dashboard-tweet" key={index}>
									<div className="dashboard-tweet-interaction-field">
										<div>♡ {tweet.likes} </div>

										<Button
											variant="primary"
											disabled={accountTokenBalance < 1}
											onClick={() =>
												handleLikeTweetButton('tokenPayment', tweet.id)
											}
										>
											♡ ({platformFees.likeTokenFee} TVT)
										</Button>
										<Button
											variant="primary"
											onClick={() =>
												handleLikeTweetButton('ethPayment', tweet.id)
											}
										>
											♡ ({ethers.utils.formatEther(platformFees.likeWeiFee)} Ξ)
										</Button>
									</div>

									<TwitterTweetEmbed tweetId={tweet.url} />
								</div>
							)
					)}
			</div>
		</div>
	)
}

export default Dashboard
