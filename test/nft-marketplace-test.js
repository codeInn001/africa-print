const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace", function () {
  this.timeout(50000);

  let myNFT;
  let owner;
  let acc1;
  let acc2;

  this.beforeEach(async function () {
    // This is executed before each test
    // Deploying the smart contract
    [owner, acc1, acc2] = await ethers.getSigners();
    const MyNFT = await ethers.getContractFactory("MyNFT");
    myNFT = await MyNFT.deploy();

    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = await NFTMarketplace.deploy();
  });

  /**
   * Test helpers start
   */

  const contractErrors = {
    zeroPrice: "Price should be above zero",
    alreadySold: "africa print already sold",
    insufficientEther: "You need to match the selling price",
    notFound: "africa print doesn't exist",
    insufficientPermission: "Can't perform transaction",
  };

  const newListing = async (
    tokenURI = "dummyURI",
    tokenId = 0,
    tokenPrice = 10,
    account = acc1
  ) => {
    const tx1 = await myNFT.connect(account).mint(tokenURI);
    await tx1.wait();

    const tx2 = await myNFT
      .connect(account)
      .approve(nftMarketplace.address, tokenId);
    await tx2.wait();

    const tx3 = await nftMarketplace
      .connect(account)
      .listAfricaPrint(myNFT.address, tokenId, tokenPrice);
    return await tx3.wait();
  };

  const buyAfricaPrint = async (buyer, africaPrintId, price) => {
    const tx = await nftMarketplace.connect(buyer).buyAfricaPrint(africaPrintId, {
      value: price,
    });
    return await tx.wait();
  };

  const parseAmount = (amount) => ethers.utils.parseEther(String(amount));

  /**
   * Test helpers end
   */

  describe("listAfricaPrint", () => {
    it("should list a new africa print", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 0;
      const tokenPrice = parseAmount(10);

      const africaPrintCount = 0;
      await newListing(tokenURI, tokenId, tokenPrice);

      const africaPrint = await nftMarketplace.getAfricaPrint(africaPrintCount);
      expect(africaPrint.price).to.equal(tokenPrice);
      expect(africaPrint.seller).to.equal(acc1.address);
    });

    it("should transfer token ownership to marketplace", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 0;
      const tokenPrice = parseAmount(10);

      await newListing(tokenURI, tokenId, tokenPrice);

      expect(await myNFT.ownerOf(tokenId)).to.equal(nftMarketplace.address);
    });

    it("should fail to list africa print with zero price", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 0;
      const tokenPrice = parseAmount(0);

      await expect(
        newListing(tokenURI, tokenId, tokenPrice)
      ).to.be.revertedWith(contractErrors.zeroPrice);
    });
  });

  describe("buyAfricaPrint", () => {
    it("should pay seller on successful purchase", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 0;
      const tokenPrice = parseAmount(10);

      await newListing(tokenURI, tokenId, tokenPrice);

      const africaPrintCount = 0;

      const initialSellerBalance = await ethers.provider.getBalance(
        acc1.address
      );
      await buyAfricaPrint(acc2, africaPrintCount, tokenPrice);
      const newSellerBalance = await ethers.provider.getBalance(acc1.address);
      expect(newSellerBalance).to.equal(initialSellerBalance.add(tokenPrice));
    });

    it("should transfer token ownership to buyer", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 0;
      const tokenPrice = parseAmount(10);

      await newListing(tokenURI, tokenId, tokenPrice);

      const africaPrintCount = 0;

      await buyAfricaPrint(acc2, africaPrintCount, tokenPrice);
      expect(await myNFT.ownerOf(tokenId)).to.equal(acc2.address);
    });

    it("should fail to buy africa print without paying africa print price", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 0;
      const tokenPrice = parseAmount(10);

      await newListing(tokenURI, tokenId, tokenPrice);

      const africaPrintCount = 0;

      await expect(buyAfricaPrint(acc2, africaPrintCount, 0)).to.be.revertedWith(
        contractErrors.insufficientEther
      );
    });

  });

  describe("modifyAfricaPrintPrice", () => {
    it("should allow owner change africa print price", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 0;
      const tokenPrice = parseAmount(10);
      const newTokenPrice = parseAmount(300);

      await newListing(tokenURI, tokenId, tokenPrice, acc1);

      const africaPrintCount = 0;
      let africaPrint = await nftMarketplace.getAfricaPrint(africaPrintCount);
      expect(africaPrint.price).to.equal(tokenPrice);

      const tx = await nftMarketplace
        .connect(acc1)
        .modifyAfricaPrintPrice(newTokenPrice, tokenId);
      await tx.wait();

      africaPrint = await nftMarketplace.getAfricaPrint(africaPrintCount);
      expect(africaPrint.price).to.equal(newTokenPrice);
    });

    it("should not allow non-owner change africa print price", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 0;
      const tokenPrice = parseAmount(10);
      const newTokenPrice = parseAmount(300);

      await newListing(tokenURI, tokenId, tokenPrice, acc1);

      const africaPrintCount = 0;
      let africaPrint = await nftMarketplace.getAfricaPrint(africaPrintCount);
      expect(africaPrint.price).to.equal(tokenPrice);

      await expect(
        nftMarketplace.connect(acc2).modifyAfricaPrintPrice(newTokenPrice, tokenId)
      ).to.be.revertedWith(contractErrors.insufficientPermission);
    });
  });
});
