// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";


contract TweetVoter {

    uint256 totalTweets = 0;
    uint256 platformFee = 5;
    
    struct Tweet {
        string tweetUrl;
        uint256 likeFee;
        address feeReceiverAddress;

        uint256 tweetId;
        address tweetOwner;
        uint256 likes;
        uint256 timestamp;
    }
    
    mapping(address => uint) public accountTotalTweets;
    mapping(address => uint[]) public accountToTweetIds;
    mapping(uint => Tweet) public tweetIdToTweet;

    function submitTweet(
        string tweetUrl,
        uint256 likeFee,
        address feeReceiverAddress

    )
    // pay $1 to post 
    // pay x to like 
    
    // token to like

    // contract withdraw function
    
   
    constructor() {
        console.log("GM Tweet Voter");
    }

}

contract TVToken is ERC20, ERC20Detailed {
  constructor(uint256 initialSupply) ERC20Detailed("TwitterVoteToken", "TVT", 18) public {
        _mint(msg.sender, initialSupply);
    }

}