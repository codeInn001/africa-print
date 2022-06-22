// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "hardhat/console.sol";

contract NFTMarketplace {
    uint256 public africaPrintCount = 0;
    // declaring a struct for the africaprint
    struct AfricaPrint {
        IERC721 nft;
        uint256 tokenId;
        uint256 price;
        address payable seller;
        bool sold;
        bool forSale;
        bool flagged;
        uint rating;

    }

    mapping(uint256 => AfricaPrint) public africaPrints;
    address  ownerAddress;


    constructor() {
        ownerAddress = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == ownerAddress);
        _;
    }

    modifier notFlagged(uint256 _tokenId) {
        AfricaPrint storage africaPrint = africaPrints[_tokenId];
        require(!africaPrint.flagged, "this  africaprint is flagged");
        _;
    }

    // this function will add a new africaprint to the marketplace
    function listAfricaPrint(IERC721 _nft, uint256 _tokenId, uint256 _price
    ) external notFlagged(_tokenId) {
        require(_price > 0, "NFTMarketplace: Price should be above zero");
        africaPrintCount++;
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        africaPrints[africaPrintCount] = AfricaPrint(
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false,
            true,
            false,
        // DEFAULT RATING OVER 5
            3

        );
    }
    // this function will facilitate the buying of a africaprint nft when called
    function buyAfricaPrint(uint256 _tokenId) external payable notFlagged(_tokenId) {
        AfricaPrint storage africaPrint = africaPrints[_tokenId];
        require(africaPrint.forSale == true, "this  africaprint is not for sale");
        require(_tokenId > 0 && _tokenId <= africaPrintCount,
            "NFTMarketplace: africaprint doesn't exist"
        );
        require(msg.value >= africaPrint.price,
            "NFTMarketplace: not enough balance"
        );
        require(!africaPrint.sold, "NFTMarketplace: africaprint already sold");
        africaPrint.seller.transfer(africaPrint.price);
        africaPrint.sold = true;
        africaPrint.nft.transferFrom(address(this), msg.sender, africaPrint.tokenId);
    }


    // this function will get a africaprint listing from the mapping list
    function getAfricaPrint(uint256 _tokenId) public view returns (AfricaPrint memory) {
        return africaPrints[_tokenId];
    }


    // this function will set the africaprint listing to not for sale and only the owner can do that
    function toggleForSale(uint256 _tokenId) public notFlagged(_tokenId) {
        AfricaPrint storage africaPrint = africaPrints[_tokenId];
        require(msg.sender != address(0));
        require(africaPrint.seller == msg.sender);

        // if token's forSale is false make it true and vice versa
        if(africaPrint.forSale) {
            africaPrint.forSale = false;
        } else {
            africaPrint.forSale = true;
        }
    }
    // this function will facilitate the changing of the price of a africaprint by the owner
    function modifyAfricaPrintPrice(uint256 _africaPrintPrice, uint256 _tokenId)
    public
    notFlagged(_tokenId)
    payable
    {
        require(
            africaPrints[_tokenId].seller == msg.sender,
            "NFTMarketplace: Can't perform transaction"
        );
        africaPrints[_tokenId].price = _africaPrintPrice;
    }





    // this function will get the total number of africaprint in the marketplace
    function getAfricaPrintCount() public view returns (uint256) {
        return africaPrintCount;
    }

    //    admin can rate a print
    function rateAfricaPrint(uint256 _tokenId, uint256 _rating) public onlyOwner {
        require(msg.sender != address(0));
        require(_tokenId > 0 && _tokenId <= africaPrintCount);
        africaPrints[_tokenId].rating = _rating;
    }

    //    toggle flag by admin
    function toggleFlagged(uint256 _tokenId) public onlyOwner {
        require(_tokenId > 0 && _tokenId <= africaPrintCount);
        AfricaPrint storage africaPrint = africaPrints[_tokenId];
        if(africaPrint.flagged) {
            africaPrint.flagged = false;
        } else {
            africaPrint.flagged = true;
        }
    }
}
