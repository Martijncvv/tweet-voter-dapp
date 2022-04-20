const keccak256 = require('keccak256')
const { ethers, waffle } = require('hardhat')

// TVTokenContract Contract deployed to: 0xAcdaDa3D89FE6db8665B21f4C08829D5B34493f8
// tweetvoter Contract deployed to: 0xd011cdB042bFF4AdF420FA3Fe359058E4426b6e8

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
