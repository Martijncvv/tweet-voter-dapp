import './TweetDisplay.css'
import React, { useEffect, useState } from 'react'
import { TwitterTweetEmbed } from 'react-twitter-embed'

const TweetDisplay = ({
	tweetVoteContract,
	infoBar,
	setInfoBar,
	platformFees,
	accountTokenBalance,
	sortingOption,
}) => {
	const [cleanedTweets, setCleanedTweets] = useState([])
	useEffect(() => {
		getAllTweets()
	}, [infoBar, sortingOption])

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
			setCleanedTweets(sortTweets(cleanedTweets))
			console.log('cleanedTweets', cleanedTweets)
			TwitterTweetEmbed.forceUpdate()
		} catch (error) {
			console.log(error)
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
				window.location.reload(true)
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
	return (
		<div className="col-10">
			<div className="row row-cols-auto">
				{cleanedTweets.length > 0 &&
					cleanedTweets.map(
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
	)
}

export default TweetDisplay
