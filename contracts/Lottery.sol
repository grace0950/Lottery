// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.9.0;

contract Lottery {
    address public owner;
    address payable[] public players;
    address public winner;

    constructor() public {
        owner = msg.sender;
    }

    modifier owerOnly {
        require(msg.sender == owner);
        _;
    }

    //下注
    function enter() public payable {
        //檢查下注金額大於 0.0001 ether
        require(
            msg.value > 0.0001 ether,
            "Enter amount nust be greater than 0.0001 ether"
        );
        //將msg.sender放入players陣列
        players.push(msg.sender);
    }

    //生成隨機亂數
    function random() private view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(block.difficulty, block.timestamp, players)
                )
            );
    }

    //選出贏家
    function pickWinner() public owerOnly {
        uint256 index = random() % players.length;
        players[index].transfer(address(this).balance);
        winner = players[index];
        //reset
        players = new address payable[](0);
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    function getWinner() public view returns (address) {
        return winner;
    }
}
