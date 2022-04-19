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

    ITVToken tvTokenContract;
    AggregatorV3Interface internal priceFeed;
    address private _owner;

    uint256 totalTweetsCount = 0;

    uint256 platformFee = 5; // %

    uint256 tweetFeeToken = 5; // 2 dollar
    uint256 tweetFeeEth = 0.00065 ether;
    uint256 likeFeeToken = 1; // %
    uint256 likeFeeEth = 0.00015 ether; // %

    
    struct Tweet {
        uint256 tweetId;
        string tweetUrl;
        address feeReceiver;
        address tweetOwner;
        uint256 likes;
        uint256 timestamp;
    }
    
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

        require(msg.value >= tweetFeeEth || accountTokenBalance >= tweetFeeToken, "TweetVoter: msg.value_TOO_LOW");

        if (msg.value >= tweetFeeEth) {
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
        
        tvTokenContract.mint(msg.sender, 5);

        emit SubmitTweet(msg.sender, tweetId, block.timestamp);
    }

    function likeTweet(uint256 tweetId) external payable {
        uint accountTokenBalance = tvTokenContract.balanceOf(msg.sender);
        Tweet storage likedTweet = tweetIdToTweet[tweetId];

        require(msg.value > likeFeeEth || accountTokenBalance >= likeFeeToken, "TweetVoter: likeFee_TOO_LOW");


        if (msg.value > likeFeeEth) {
            (bool sent, ) = likedTweet.feeReceiver.call{value: msg.value * ((100 - platformFee) / 100)}("");
            require(sent, "Failed to send ETH");
            tvTokenContract.mint(msg.sender, 1);
        } else {
            tvTokenContract.burn(msg.sender, 1);
        }

        likedTweet.likes = likedTweet.likes.add(1);
        
       
        emit LikedTweet(tweetId, likedTweet.likes, block.timestamp);
    }

    function setTweetFeeToken(uint _tweetFeeToken) external onlyOwner {
        tweetFeeToken = _tweetFeeToken;
    }
    function setTweetFeeEth(uint _tweetFeeEth) external onlyOwner {
        tweetFeeEth = _tweetFeeEth;
    }
    function setLikeFeeToken(uint _likeFeeToken) external onlyOwner {
        likeFeeToken = _likeFeeToken;
    }
    function setLikeFeeEth(uint _likeFeeEth) external onlyOwner {
        likeFeeEth = _likeFeeEth;
    }

    function getAllTweets() external view returns(Tweet[] memory) {
        Tweet[] memory allTweets = new Tweet[](totalTweetsCount);
        for (uint256 i = 1; i <= totalTweetsCount; i++) {
            allTweets[i] = tweetIdToTweet[i];
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

    function getAllTweetsByAccount(address account) external view returns(uint[] memory) {
        return  accountToTweetIds[account];
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

