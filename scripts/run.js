const keccak256 = require('keccak256')

const main = async () => {
	const [owner, randomPerson_2, randomPerson_3, randomPerson_4] =
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

	let tweetSubmitTx_1 = await tweetVoterContract
		.connect(randomPerson_2)
		.submitTweet(
			'https://twitter.com/Marty_cFly/status/1380145053830631426',
			randomPerson_3.address,
			{ value: ethers.utils.parseEther('0.005') }
		)
	await tweetSubmitTx_1
	console.log('tweetSubmitTx_1 Confirmed')

	let tweetSubmitTx_2 = await tweetVoterContract
		.connect(randomPerson_2)
		.submitTweet(
			'https://twitter.com/Marty_cFly/status/1516248898666434562',
			randomPerson_3.address,
			{ value: ethers.utils.parseEther('0.05') }
		)
	await tweetSubmitTx_2
	console.log('tweetSubmitTx_2 Confirmed')

	let tweetSubmitTx_3 = await tweetVoterContract
		.connect(randomPerson_2)
		.submitTweet(
			'https://twitter.com/Marty_cFly/status/1516127328665063426',
			randomPerson_3.address
		)
	await tweetSubmitTx_3
	console.log('tweetSubmitTx_3 Confirmed')

	let tweetSubmitTx_4 = await tweetVoterContract
		.connect(randomPerson_3)
		.submitTweet(
			'https://twitter.com/Marty_cFly/status/1516193904936341505',
			randomPerson_4.address,
			{ value: ethers.utils.parseEther('0.07') }
		)
	await tweetSubmitTx_4
	console.log('tweetSubmitTx_4 Confirmed')

	let failedTweetSubmitTx_5 = await tweetVoterContract
		.connect(randomPerson_4)
		.submitTweet(
			'https://twitter.com/Marty_cFly/status/1516193904936341505',
			randomPerson_4.address
		)
	await failedTweetSubmitTx_5
	console.log('failedTweetSubmitTx_5 Confirmed:', failedTweetSubmitTx_5)
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
