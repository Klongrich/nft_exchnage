const NftSwap = artifacts.require('NftExchange')
const TokenOneMinter = artifacts.require('TokenOneMinter')
const TokenTwoMinter = artifacts.require('TokenTwoMinter')
const KyleCoin = artifacts.require('Erc20Minter')

const { expect } = require('chai')

let nftOne
let nftTwo
let nftSwap
let accounts
let owner
let maker
let taker
let lister
let kyleCoin;

let nftOrderID;
let ercOrderID;
let ethOrderID;

const makerID = 1
const takerID = 2

describe('Test Swap', () => {
    before(async () => {
        accounts = await web3.eth.getAccounts()

        TokenHolder = accounts[0]
        maker = accounts[1]
        taker = accounts[2]
        lister = accounts[3]
    })

    it("Deploy NFT's, Kyle Coin, and swap contract", async () => {
        nftSwap = await NftSwap.new()
        nftOne = await TokenOneMinter.new()
        nftTwo = await TokenTwoMinter.new()
        kyleCoin = await KyleCoin.new();

        expect(nftSwap.address).not.to.be.null
        expect(nftOne.address).not.to.be.null
        expect(nftTwo.address).not.to.be.null
    })

    it("Mint NFT's in both NFT contracts", async () => {
        await nftOne.mint(maker, makerID)
        await nftTwo.mint(taker, takerID)

        expect(await nftOne.ownerOf(makerID)).to.be.equal(maker)
        expect(await nftTwo.ownerOf(takerID)).to.be.equal(taker)
    })

    it('Maker approves swap contract', async () => {
        await nftOne.approve(nftSwap.address, makerID, { from: maker })

        expect(await nftOne.getApproved(makerID)).to.be.equal(nftSwap.address)
    })

    it('Makes NFT to NFT', async () => {  
        await nftSwap.makeNftToNft(
            maker,
            nftOne.address,
            makerID,
            nftTwo.address,
            takerID,
            { from: maker }
        ).then(function (res) {
            nftOrderID = res.logs[0].args.OrderID;
        });
    })

    it('Taker approves swap contract', async () => {
        await nftTwo.approve(nftSwap.address, takerID, { from: taker })

        expect(await nftTwo.getApproved(takerID)).to.be.equal(nftSwap.address)
    })

    it('Taker swaps NFT to NFT', async () => {
        expect(await nftOne.ownerOf(makerID)).to.be.equal(maker)
        expect(await nftTwo.ownerOf(takerID)).to.be.equal(taker)

        let res2;

        res2 = await nftSwap.takeOrder(maker, taker, nftOrderID, { from: taker })

        /// console.log(res2);
        expect(await nftOne.ownerOf(makerID)).to.be.equal(taker)
        expect(await nftTwo.ownerOf(takerID)).to.be.equal(maker)
    })

    it('Approves ERC20 Transfer Amount', async () => {
        await kyleCoin.approve(nftSwap.address, 1000);
        
        //Could check 'allowance' to equal '1000'
    })

    it('Approves Swapped NFT', async () => {
        await nftOne.approve(nftSwap.address, makerID, { from: taker })

        expect(await nftOne.getApproved(makerID)).to.be.equal(nftSwap.address)
    })

    it('Makes NFT to ERC20', async () => {
        await nftSwap.makeNftToERC20(
            TokenHolder,
            nftOne.address,
            makerID,
            kyleCoin.address,
            714,
            { from: TokenHolder }
        ).then(function (res) {
            console.log(res);
            ercOrderID = res.logs[0].args.OrderID;
        })
    })

    it('Takes NFT to ERC20', async () => {
        await nftSwap.takeOrder(TokenHolder, taker, ercOrderID, { from: taker });
        //Check ERC20 Balance of Taker
    })

    // it('Makes NFT to ETH', async () => {
    //     await nftSwap.makeNftToETH(lister, 
    //         nftOne.address, 
    //         makerID, 
    //         { from: lister, value: 417 }
    //     ).then(function (res) {
    //         console.log(res.logs[0].args.OrderID);
    //         ethOrderID =  res.logs[0].args.OrderID;
    //     })
    // })

    // it('Approves NFT to Be Swapped', async () => {
    //     await nftOne.approve(nftSwap.address, makerID, { from: TokenHolder })

    //     expect(await nftOne.getApproved(makerID)).to.be.equal(nftSwap.address)
    // })

    // it('Takes NFT to ETH', async () => {
    //     await nftSwap.takeOrder(lister, TokenHolder, ethOrderID, { from: TokenHolder })

    //     //Check the amount of ETH the TokenHolder and lister has
    // })

})