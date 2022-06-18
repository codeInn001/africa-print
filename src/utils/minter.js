import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";
import MyNFTContractAddress from "../contracts/MyNFT-address.json";
import NFTMarketplaceContractAddress from "../contracts/NFTMarketplace-address.json";
import { BigNumber, ethers } from "ethers";

// initialize IPFS
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

// mint an NFT
export const createNft = async (
  minterContract,
  marketplaceContract,
  performActions,
  { name, price, description, ipfsImage, ownerAddress, attributes }
) => {
  await performActions(async (kit) => {
    if (!name || !description || !ipfsImage) return;
    const { defaultAccount } = kit;

    // convert NFT metadata to JSON format
    const data = JSON.stringify({
      name,
      description,
      image: ipfsImage,
      owner: defaultAccount,
      attributes,
    });

    try {
      // save NFT metadata to IPFS
      const added = await client.add(data);

      // IPFS url for uploaded metadata
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;

      // mint the NFT and save the IPFS url to the blockchain
      let transaction = await minterContract.methods
        .mint(url)
        .send({ from: defaultAccount });

      let africaPrintCount = BigNumber.from(
        transaction.events.Transfer.returnValues.tokenId
      );

      const africaPrintPrice = ethers.utils.parseUnits(String(price), "ether");
      console.log(africaPrintPrice);

      await minterContract.methods
        .approve(NFTMarketplaceContractAddress.NFTMarketplace, africaPrintCount)
        .send({ from: kit.defaultAccount });

      await marketplaceContract.methods
        .listAfricaPrint(MyNFTContractAddress.MyNFT, africaPrintCount, africaPrintPrice)
        .send({ from: defaultAccount });

      return transaction;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  });
};

// function to upload a file to IPFS
export const uploadToIpfs = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const added = await client.add(file, {
      progress: (prog) => console.log(`received: ${prog}`),
    });
    return `https://ipfs.infura.io/ipfs/${added.path}`;
  } catch (error) {
    console.log("Error uploading file: ", error);
  }
};

// fetch all NFTs on the smart contract
export const getNfts = async (minterContract, marketplaceContract) => {
  try {
    const nfts = [];
    const nftsLength = await marketplaceContract.methods
      .getAfricaPrintCount()
      .call();

    // contract starts minting from index 1
    for (let i = 1; i <= Number(nftsLength); i++) {
      const nft = new Promise(async (resolve) => {
        const africaPrint = await marketplaceContract.methods.getAfricaPrint(i).call();
        const res = await minterContract.methods
          .tokenURI(africaPrint.tokenId)
          .call();

        const meta = await fetchNftMeta(res);
        resolve({
          index: i,
          nft: africaPrint.nft,
          tokenId: africaPrint.tokenId,
          price: africaPrint.price,
          seller: africaPrint.seller,
          sold: africaPrint.sold,
          forSale: africaPrint.forSale,
          owner:meta.data.owner,
          name: meta.data.name,
          image: meta.data.image,
          description: meta.data.description,
          attributes: meta.data.attributes,
        });
      });
      nfts.push(nft);
    }
    return Promise.all(nfts);
  } catch (e) {
    console.log({ e });
  }
};

// get the metedata for an NFT from IPFS
export const fetchNftMeta = async (ipfsUrl) => {
  try {
    if (!ipfsUrl) return null;
    const meta = await axios.get(ipfsUrl);
    return meta;
  } catch (e) {
    console.log({ e });
  }
};

// get the owner address of an NFT
export const fetchNftOwner = async (minterContract, index) => {
  try {
    return await minterContract.methods.ownerOf(index).call();
  } catch (e) {
    console.log({ e });
  }
};

// get the address that deployed the NFT contract
export const fetchNftContractOwner = async (minterContract) => {
  try {
    let owner = await minterContract.methods.owner().call();
    return owner;
  } catch (e) {
    console.log({ e });
  }
};

export const purchaseItem = async (
  minterContract,
  marketplaceContract,
  performActions,
  index,
  tokenId
) => {
  try {
    await performActions(async (kit) => {
      try {
        console.log(marketplaceContract, index);
        const { defaultAccount } = kit;
        const africaPrint = await marketplaceContract.methods
          .getAfricaPrint(index)
          .call();
        await marketplaceContract.methods
          .buyAfricaPrint(index)
          .send({ from: defaultAccount, value: africaPrint.price });
      } catch (error) {
        console.log({ error });
      }
    });
  } catch (error) {
    console.log(error);
  }
};



export const toggleForsale = async (
  minterContract,
  marketplaceContract,
  performActions,
  index,
) => {
  try {
    await performActions(async (kit) => {
      try {
        console.log(marketplaceContract, index);
        const { defaultAccount } = kit;
        await marketplaceContract.methods
          .toggleForSale(index)
          .send({ from: defaultAccount});
      } catch (error) {
        console.log({ error });
      }
    });
  } catch (error) {
    console.log(error);
  }
};


export const changePrice = async (
  minterContract,
  marketplaceContract,
  performActions,
  newPrice,
  index,
  
) => {
  try {
    await performActions(async (kit) => {
      try {
        console.log(marketplaceContract, index);
        const { defaultAccount } = kit;

        const newAfricaPrintPrice = ethers.utils.parseUnits(String(newPrice), "ether");
      console.log(newAfricaPrintPrice);

        await marketplaceContract.methods
          .modifyAfricaPrintPrice(newAfricaPrintPrice, index)
          .send({ from: defaultAccount});
      } catch (error) {
        console.log({ error });
      }
    });
  } catch (error) {
    console.log(error);
  }
};
