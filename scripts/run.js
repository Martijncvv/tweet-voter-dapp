const keccak256 = require('keccak256')
const { ethers, waffle } = require('hardhat')

const main = async () => {
	const provider = waffle.provider

	//
	//
	console.log('\nSETUP')
	const [owner, person_2, person_3, person_4, person_5, person_6] =
		await hre.ethers.getSigners()

	const TVTokenContractFactory = await hre.ethers.getContractFactory('TVToken')
	const TVTokenContract = await TVTokenContractFactory.deploy()
	await TVTokenContract.deployed()
	console.log('TVTokenContract Contract deployed to:', TVTokenContract.address)

	const tweetVoterContractFactory = await hre.ethers.getContractFactory(
		'TweetVoter'
	)
	const tweetVoterContract = await tweetVoterContractFactory.deploy(
		TVTokenContract.address
	)
	await tweetVoterContract.deployed()
	console.log('tweetvoter Contract deployed to:', tweetVoterContract.address)

	let grantMINTRole = await TVTokenContract.grantRole(
		keccak256('MINTER_ROLE'),
		tweetVoterContract.address
	)
	await grantMINTRole
	console.log('grantMINTRole Done: ', tweetVoterContract.address)

	let grantBURNRole = await TVTokenContract.grantRole(
		keccak256('BURNER_ROLE'),
		tweetVoterContract.address
	)
	await grantBURNRole
	console.log('grantBURNRole Done: ', tweetVoterContract.address)
	//
	//
	console.log('\nSUBMIT TWEETS')
	let token_balance_pers2 = await TVTokenContract.connect(owner).balanceOf(
		person_2.address
	)
	await token_balance_pers2
	console.log('token_balance_pers2 Confirmed:', token_balance_pers2)

	let pers2_tweet1_eth = await tweetVoterContract
		.connect(person_2)
		.submitTweet(
			'https://twitter.com/Marty_cFly/status/1380145053830631426',
			person_4.address,
			{ value: ethers.utils.parseEther('0.05') }
		)
	await pers2_tweet1_eth
	console.log('pers2_tweet1_eth Confirmed')

	token_balance_pers2 = await TVTokenContract.connect(owner).balanceOf(
		person_2.address
	)
	await token_balance_pers2
	console.log('token_balance_pers2 Confirmed:', token_balance_pers2)

	let pers2_tweet2_eth = await tweetVoterContract
		.connect(person_2)
		.submitTweet(
			'https://twitter.com/Marty_cFly/status/1516248898666434562',
			person_4.address,
			{ value: ethers.utils.parseEther('1.05') }
		)
	await pers2_tweet2_eth
	console.log('pers2_tweet2_eth Confirmed')

	token_balance_pers2 = await TVTokenContract.connect(owner).balanceOf(
		person_2.address
	)
	await token_balance_pers2
	console.log('token_balance_pers2 Confirmed:', token_balance_pers2)

	let pers2_tweet3_token = await tweetVoterContract
		.connect(person_2)
		.submitTweet(
			'https://twitter.com/Marty_cFly/status/1516127328665063426',
			person_4.address
		)
	await pers2_tweet3_token
	console.log('pers2_tweet3_token Confirmed')

	token_balance_pers2 = await TVTokenContract.connect(owner).balanceOf(
		person_2.address
	)
	await token_balance_pers2
	console.log('token_balance_pers2 Confirmed:', token_balance_pers2)

	let pers3_tweet1_eth = await tweetVoterContract
		.connect(person_3)
		.submitTweet(
			'https://twitter.com/Marty_cFly/status/1516193904936341505',
			person_4.address,
			{ value: ethers.utils.parseEther('0.1') }
		)
	await pers3_tweet1_eth
	console.log('pers3_tweet1_eth Confirmed')

	let token_balance_pers3 = await TVTokenContract.connect(owner).balanceOf(
		person_3.address
	)
	await token_balance_pers3
	console.log('token_balance_pers3 Confirmed:', token_balance_pers3)

	// let pers4_tweet1_token_fail = await tweetVoterContract
	// 	.connect(person_4)
	// 	.submitTweet(
	// 		'https://twitter.com/Marty_cFly/status/1516193904936341505',
	// 		person_4.address
	// 	)
	// await pers4_tweet1_token_fail
	// console.log('pers4_tweet1_token_fail Confirmed:', failedTweetSubmitTx_5)
	//
	//
	console.log('\nGET BALANCES')

	token_balance_pers2 = await TVTokenContract.connect(owner).balanceOf(
		person_2.address
	)
	await token_balance_pers2
	console.log('token_balance_pers2 Confirmed:', token_balance_pers2)

	token_balance_pers3 = await TVTokenContract.connect(owner).balanceOf(
		person_3.address
	)
	await token_balance_pers3
	console.log('token_balance_pers3 Confirmed:', token_balance_pers3)
	//

	let balance_in_wei = await provider.getBalance(tweetVoterContract.address)
	console.log('eth_balance_tweetVoterContract Confirmed:', balance_in_wei)

	balance_in_wei = await provider.getBalance(person_4.address)
	console.log('eth_balance_person_4 Confirmed:', balance_in_wei)
	//
	//
	console.log('\nTWEETS INFO')

	let getTotalTweets = await tweetVoterContract
		.connect(person_2)
		.getTotalTweets()
	await getTotalTweets
	console.log('getTotalTweets Confirmed ', getTotalTweets)

	let getAccountTweetsAmount = await tweetVoterContract
		.connect(person_2)
		.getAccountTweetsAmount(person_2.address)
	await getAccountTweetsAmount
	console.log('getAccountTweetsAmount Confirmed ', getAccountTweetsAmount)

	let getAllTweetIdsByAccount = await tweetVoterContract
		.connect(person_2)
		.getAllTweetIdsByAccount(person_2.address)
	await getAllTweetIdsByAccount
	console.log('getAllTweetIdsByAccount Confirmed')
	console.log(getAllTweetIdsByAccount)

	let getTweetById = await tweetVoterContract.connect(person_2).getTweetById(2)
	await getTweetById
	console.log('getTweetById Confirmed')
	console.log(getTweetById)

	// console.log('\nALL TWEETS')
	// let all_tweets = await tweetVoterContract.connect(person_2).getAllTweets()
	// await all_tweets
	// console.log('all_tweets Confirmed')
	// console.log(all_tweets)

	//
	//

	console.log('\nBALANCES')
	// getTweetById = await tweetVoterContract.connect(person_2).getTweetById(2)
	// await getTweetById
	// console.log('getTweetById Confirmed')
	// console.log(getTweetById)

	balance_in_wei = await provider.getBalance(tweetVoterContract.address)
	console.log(
		'eth_balance_tweetVoterContract Confirmed:',
		ethers.utils.formatEther(balance_in_wei)
	)

	balance_in_wei = await provider.getBalance(person_4.address)
	console.log(
		'eth_balance_person_4 Confirmed:',
		ethers.utils.formatEther(balance_in_wei)
	)

	token_balance_pers4 = await TVTokenContract.connect(owner).balanceOf(
		person_4.address
	)
	await token_balance_pers4
	console.log('token_balance_pers4 Confirmed:', token_balance_pers4)

	token_balance_pers5 = await TVTokenContract.connect(owner).balanceOf(
		person_5.address
	)
	await token_balance_pers5
	console.log('token_balance_pers5 Confirmed:', token_balance_pers5)
	//
	//
	console.log('\nLIKE TWEETS')
	let pers5_like1_eth = await tweetVoterContract
		.connect(person_5)
		.likeTweet(2, { value: ethers.utils.parseEther('1') })
	await pers5_like1_eth
	console.log('pers5_like1_eth Confirmed')

	token_balance_pers5 = await TVTokenContract.connect(owner).balanceOf(
		person_5.address
	)
	await token_balance_pers5
	console.log('token_balance_pers5 Confirmed:', token_balance_pers5)

	let pers5_like2_token = await tweetVoterContract
		.connect(person_5)
		.likeTweet(2)
	await pers5_like2_token
	console.log('pers5_like2_token Confirmed')

	let pers6_like1_eth = await tweetVoterContract
		.connect(person_6)
		.likeTweet(2, { value: ethers.utils.parseEther('1') })
	await pers6_like1_eth
	console.log('pers6_like1_eth Confirmed')
	//
	//
	console.log('\nBALANCES')
	// getTweetById = await tweetVoterContract.connect(person_2).getTweetById(2)
	// await getTweetById
	// console.log('getTweetById Confirmed')
	// console.log(getTweetById)

	balance_in_wei = await provider.getBalance(tweetVoterContract.address)
	console.log(
		'eth_balance_tweetVoterContract Confirmed:',
		ethers.utils.formatEther(balance_in_wei)
	)

	balance_in_wei = await provider.getBalance(person_4.address)
	console.log(
		'eth_balance_person_4 Confirmed:',
		ethers.utils.formatEther(balance_in_wei)
	)

	token_balance_pers4 = await TVTokenContract.connect(owner).balanceOf(
		person_4.address
	)
	await token_balance_pers4
	console.log('token_balance_pers4 Confirmed:', token_balance_pers4)

	token_balance_pers5 = await TVTokenContract.connect(owner).balanceOf(
		person_5.address
	)
	await token_balance_pers5
	console.log('token_balance_pers5 Confirmed:', token_balance_pers5)

	//
	//
	console.log('\nTWEETS INFO')
	getTweetById = await tweetVoterContract.connect(person_2).getTweetById(2)
	await getTweetById
	console.log('getTweetById Confirmed')
	console.log(getTweetById)
}

const runMain = async () => {
	try {
		await main()
		process.exit(0) // exit Node process without error
	} catch (error) {
		console.log(error)
		process.exit(1) // exit Node process while indicating 'Uncaught Fatal Exception' error
	}
	// Read more about Node exit ('process.exit(num)') status codes here: https://stackoverflow.com/a/47163396/7974948
}

runMain()
