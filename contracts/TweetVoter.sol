// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";



contract TVToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");


    constructor() ERC20("TwitterVoteToken", "TVT") AccessControl()
    {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) external {
        require(hasRole(MINTER_ROLE, msg.sender), "Caller is not a minter");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(hasRole(BURNER_ROLE, msg.sender), "Caller is not a burner");
        _burn(from, amount);
    }
}


interface ITVToken {
    function mint(address, uint256) external;
    function burn(address, uint256) external;
    function balanceOf(address) external view returns(uint);
}

// contract TweetVoter is Ownable, AggregatorV3Interface {
contract TweetVoter  is Ownable {
    event SubmitTweet(address indexed user, uint256 indexed tweetId, uint256 timestamp);
    event LikedTweet(uint256 tweetId, uint256 likes, uint256 timestamp);
    event Log(string func, address sender, uint value, bytes data);

    using SafeMath for uint256;

    struct Tweet {
        uint256 tweetId;
        string tweetUrl;
        address feeReceiver;
        address tweetOwner;
        uint256 likes;
        uint256 timestamp;

    }
    struct PlatformFees {
        uint256 platformFee; // %
        uint256 tweetTokenFee;
        uint256 tweetWeiFee; 
        uint256 likeTokenFee; 
        uint256 likeWeiFee;
    }

    ITVToken tvTokenContract;
    AggregatorV3Interface internal priceFeed;
    address private _owner;
    uint256 internal totalTweetsCount  = 0;

    PlatformFees internal Fees = PlatformFees({
        platformFee: 5, // %
        tweetTokenFee: 5,
        tweetWeiFee: 0.00065 ether,
        likeTokenFee: 1,
        likeWeiFee:0.00015 ether
    });
    
   
    mapping(address => uint) public accountTweetsAmount;
    mapping(address => uint[]) public accountToTweetIds;
    mapping(uint => Tweet) public tweetIdToTweet;

    constructor(address _tvTokenContract) {
        console.log("Constructor: Tweet Voter deployed");

        tvTokenContract = ITVToken(_tvTokenContract);
    }

    fallback() external payable {
        emit Log("fallback", msg.sender, msg.value, msg.data);
    }

    /// @notice Receives Ether if no tx data was added
    receive() external payable {
        emit Log("receive", msg.sender, msg.value, "");
    }

    function withdraw(address payable to, uint amount) external onlyOwner {
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Failed to send ETH");
    }

    function submitTweet(
        string memory _tweetUrl,
        address _feeReceiver
    ) external payable {
        require(bytes(_tweetUrl).length > 0,"TweetVoter: tweetUrl_INVALID");
        require(_feeReceiver != address(0),"TweetVoter: feeReceiver_ZERO_ADDR");

        uint accountTokenBalance = tvTokenContract.balanceOf(msg.sender);
        // uint feeInEther = uint(calculateMinRequiredWeiFee());

        require(msg.value >= Fees.tweetWeiFee || accountTokenBalance >= Fees.tweetTokenFee, "TweetVoter: msg.value_TOO_LOW");

        if (msg.value >= Fees.tweetWeiFee) {
            tvTokenContract.mint(msg.sender, 5);
        } else {
            tvTokenContract.burn(msg.sender, 5);   
        }

        totalTweetsCount = totalTweetsCount.add(1);        
       
        uint tweetId = totalTweetsCount;

        Tweet memory newTweet = Tweet(
            tweetId,
            _tweetUrl,
            _feeReceiver,
            msg.sender,
            0,
            block.timestamp
        );

        tweetIdToTweet[tweetId] = newTweet;
        accountToTweetIds[msg.sender].push(tweetId);
        accountTweetsAmount[msg.sender] = accountTweetsAmount[msg.sender].add(1);


        emit SubmitTweet(msg.sender, tweetId, block.timestamp);
    }

    function likeTweet(uint256 tweetId) external payable {
        uint accountTokenBalance = tvTokenContract.balanceOf(msg.sender);
        require(msg.value > Fees.likeWeiFee || accountTokenBalance >= Fees.likeTokenFee, "TweetVoter: likeFee_TOO_LOW");

        Tweet storage likedTweet = tweetIdToTweet[tweetId];

        if (msg.value > Fees.likeWeiFee) {
           
            uint platformFeeAmount = msg.value / 100 * Fees.platformFee;
            (bool sent, ) = likedTweet.feeReceiver.call{value: (msg.value - platformFeeAmount)}("");
            require(sent, "Failed to send ETH");
            tvTokenContract.mint(msg.sender, 1);
        } else {
            tvTokenContract.burn(msg.sender, 1);
        }

        likedTweet.likes = likedTweet.likes.add(1);
        
       
        emit LikedTweet(tweetId, likedTweet.likes, block.timestamp);
    }

    function setPlatformFee(uint _platformFee) external onlyOwner {
        Fees.platformFee = _platformFee;
    }
    function setTweetTokenFee(uint _tweetTokenFee) external onlyOwner {
        Fees.tweetTokenFee = _tweetTokenFee;
    }
    function setTweetWeiFee(uint _tweetWeiFee) external onlyOwner {
        Fees.tweetWeiFee = _tweetWeiFee;
    }
    function setLikeTokenFee(uint _likeTokenFee) external onlyOwner {
        Fees.likeTokenFee = _likeTokenFee;
    }
    function setLikeWeiFee(uint _likeWeiFee) external onlyOwner {
        Fees.likeWeiFee = _likeWeiFee;
    }

    function getAllTweets() external view returns(Tweet[] memory) {
        Tweet[] memory allTweets = new Tweet[](totalTweetsCount);
        for (uint256 i = 0; i < totalTweetsCount; i++) {
            allTweets[i] = tweetIdToTweet[i+1];
        }
        return allTweets;
    }

    function getTweetById(uint tweetId) external view returns(Tweet memory) {
        return tweetIdToTweet[tweetId];
    }

    function getTotalTweets() external view returns (uint) {
        return totalTweetsCount;
    }

    function getAccountTweetsAmount(address account) external view returns (uint) {
        return accountToTweetIds[account].length;
    }

    function getAllTweetIdsByAccount(address account) external view returns(uint[] memory) {
        return  accountToTweetIds[account];
    }

    function getFees() external view returns(PlatformFees memory) {
         return  Fees;
    }

}
    // interface AggregatorV3Interface {
//   function decimals() external view returns (uint8);

//   function description() external view returns (string memory);

//   function version() external view returns (uint256);

//   // getRoundData and latestRoundData should both raise "No data present"
//   // if they do not have data to report, instead of returning unset values
//   // which could be misinterpreted as actual reported values.
//   function getRoundData(uint80 _roundId)
//     external
//     view
//     returns (
//       uint80 roundId,
//       int256 answer,
//       uint256 startedAt,
//       uint256 updatedAt,
//       uint80 answeredInRound
//     );

//   function latestRoundData()
//     external
//     view
//     returns (
//       uint80 roundId,
//       int256 answer,
//       uint256 startedAt,
//       uint256 updatedAt,
//       uint80 answeredInRound
//     );
// }

    // rinkeby eth/usd
    // function getLatestPrice() public view returns (int) {
    //     (
    //         /*uint80 roundID*/,
    //         int price,
    //         /*uint startedAt*/,
    //         /*uint timeStamp*/,
    //         /*uint80 answeredInRound*/
    //     ) = priceFeed.latestRoundData();
    //     return price;
    // }

    // function calculateMinRequiredWeiFee() public view returns(int){
    //     int ethPrice = getLatestPrice();
    //     // console.log("ethPrice", ethPrice);
    //     return 10**18 * 10**8  / ethPrice * 2 ;
    // }
    
   
//    function owner() public view override returns (address)  {
//         return _owner;
//     }

   

//     function renounceOwnership() public override onlyOwner {
//         _transferOwnership(address(0));
//     }

//     function transferOwnership(address newOwner) public override onlyOwner {
//         require(newOwner != address(0), "Ownable: new owner is the zero address");
//         _transferOwnership(newOwner);
//     }

//     function _transferOwnership(address newOwner) internal override {
//         address oldOwner = _owner;
//         _owner = newOwner;
//         emit OwnershipTransferred(oldOwner, newOwner);
//     }


//   function decimals() external view virtual returns (uint8);
//   function description() external view override returns (string memory);

//   function version() external view override returns (uint256);

//   function getRoundData(uint80 _roundId)
//     external
//     view override
//     returns (
//       uint80 roundId,
//       int256 answer,
//       uint256 startedAt,
//       uint256 updatedAt,
//       uint80 answeredInRound
//     );

//     function latestRoundData()
//     external
//     view override
//     returns (
//       uint80 roundId,
//       int256 answer,
//       uint256 startedAt,
//       uint256 updatedAt,
//       uint80 answeredInRound
//     );


   // rinkeby eth/usd 
        // priceFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);

