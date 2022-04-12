const main = async () => {
	const TVTokenContractFactory = await hre.ethers.getContractFactory('TVToken')
	const TVTokenContract = await TVTokenContractFactory.deploy()
	await TVTokenContract.deployed()
	console.log('TVTokenContract Contract deployed to:', TVTokenContract.address)

	const tweetVoterContractFactory = await hre.ethers.getContractFactory(
		'TweetVoter'
	)
	const tweetVoterContract = await tweetVoterContractFactory.deploy()
	await tweetVoterContract.deployed(TVTokenContract.address)
	console.log('Contract deployed to:', tweetVoterContract.address)
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
