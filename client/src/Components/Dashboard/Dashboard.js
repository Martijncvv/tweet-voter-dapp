import './Dashboard.css'
import 'bootstrap/dist/css/bootstrap.css'
import React, { useState } from 'react'

import Navbar from '../Navbar'
import Sidebar from '../Sidebar'
import TweetDisplay from '../TweetDisplay'

const Dashboard = ({
	TWEET_VOTER_CONTRACT_ADDRESS,
	TVTOKEN_CONTRACT_ADDRESS,
	ethereum,
	currentAccount,
	provider,
	tweetVoteContract,
	tvTokenContract,
}) => {
	const [infoBar, setInfoBar] = useState('')
	const [sortingOption, setSortingOption] = useState('likes')
	const [accountTokenBalance, setAccountTokenBalance] = useState(0)
	const [platformFees, setPlatformFees] = useState(0)

	return (
		<div className="container-fluid px-4 py-3">
			<Navbar
				infoBar={infoBar}
				setSortingOption={setSortingOption}
				sortingOption={sortingOption}
			/>

			<div className="row">
				<Sidebar
					ethereum={ethereum}
					TWEET_VOTER_CONTRACT_ADDRESS={TWEET_VOTER_CONTRACT_ADDRESS}
					TVTOKEN_CONTRACT_ADDRESS={TVTOKEN_CONTRACT_ADDRESS}
					tweetVoteContract={tweetVoteContract}
					tvTokenContract={tvTokenContract}
					provider={provider}
					currentAccount={currentAccount}
					infoBar={infoBar}
					platformFees={platformFees}
					setPlatformFees={setPlatformFees}
					setAccountTokenBalance={setAccountTokenBalance}
					accountTokenBalance={accountTokenBalance}
					setInfoBar={setInfoBar}
				/>

				<TweetDisplay
					tweetVoteContract={tweetVoteContract}
					infoBar={infoBar}
					setInfoBar={setInfoBar}
					platformFees={platformFees}
					accountTokenBalance={accountTokenBalance}
					sortingOption={sortingOption}
				/>
			</div>
		</div>
	)
}

export default Dashboard
