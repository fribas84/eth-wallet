const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Ether Wallet", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploy() {
    const [owner, otherAccount] = await ethers.getSigners();

    const EtherWallet = await ethers.getContractFactory("EtherWallet");
    const etherWallet = await EtherWallet.deploy();

    return { etherWallet, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Contract Owner should match deployer address", async function () {
      const { etherWallet, owner } = await loadFixture(deploy);
      expect(await etherWallet.owner()).to.equal(owner.address);
    });
    it("Initial contract Balance shoule de 0", async () =>{
        const{etherWallet} = await loadFixture(deploy);
        expect(await etherWallet.balanceOf()).to.equal(0);
    })
  });

  describe("Deposit", function () {
    it("Owner can deposit and balance is the updated", async ()=>{
        const { etherWallet, owner } = await loadFixture(deploy);
        expect(await etherWallet.balanceOf()).to.equal(0);
        const value = ethers.parseEther("5");
        const options = {
            value: value
        }
        await etherWallet.deposit(options);
        expect(await etherWallet.balanceOf()).to.equal(value);
    })
    it("otherAccount can deposit and balance is the updated", async ()=>{
        const { etherWallet,otherAccount } = await loadFixture(deploy);
        expect(await etherWallet.balanceOf()).to.equal(0);
        const value = ethers.parseEther("5");
        const options = {
            value: value
        }
        await etherWallet.connect(otherAccount).deposit(options);
        expect(await etherWallet.balanceOf()).to.equal(value);
    })

  });

  describe("Withdraw", function () {
    it("owner can withdraw to this address", async ()=>{
        const { etherWallet, owner } = await loadFixture(deploy);
        const provider = hre.ethers.provider;
        expect(await etherWallet.balanceOf()).to.equal(0);
        const value = ethers.parseEther("10");
       
        //deposit
        const options = {
            value: value
        }
        await etherWallet.deposit(options);
        const contractBalanceAfterDeposit = await etherWallet.balanceOf();
        
        expect(contractBalanceAfterDeposit).to.equal(value);
        const accountBalanceAfterDeposit  = await provider.getBalance(owner.address);
        
        //Withdraw
        await etherWallet.withdraw(owner.address,contractBalanceAfterDeposit);
        const accountBalanceAfterWithdraw = await provider.getBalance(owner.address);
        expect(accountBalanceAfterWithdraw).to.greaterThan(accountBalanceAfterDeposit);

        //Contract Balance should be 0
        expect(await etherWallet.balanceOf()).to.equal(0);
    })
    it("owner can withdraw to otherAccount ", async ()=>{
        const { etherWallet, owner, otherAccount} = await loadFixture(deploy);
        const provider = hre.ethers.provider;
        expect(await etherWallet.balanceOf()).to.equal(0);
        const value = ethers.parseEther("10");
        
        //deposit
        const options = {
            value: value
        }
        await etherWallet.deposit(options);

        const contractBalanceAfterDeposit = await etherWallet.balanceOf();
        expect(contractBalanceAfterDeposit).to.equal(value);
        const accountBalanceAfterDeposit  = await provider.getBalance(owner.address);

        
        //withdraw 
        const otherAccountBalanceBeforeWithdraw = await provider.getBalance(otherAccount.address);

        await etherWallet.withdraw(otherAccount.address,contractBalanceAfterDeposit);

        const otherAccountBalanceAfterWithdraw = await provider.getBalance(otherAccount.address);
        expect(otherAccountBalanceAfterWithdraw).to.greaterThan(otherAccountBalanceBeforeWithdraw);
        const accountBalanceAfterWithdraw  = await provider.getBalance(owner.address);
        
        //due to gas cost, owner balance should be lower after the widthdraw
        expect(accountBalanceAfterDeposit).to.greaterThan(accountBalanceAfterWithdraw);
        
        //Contract Balance should be 0
        expect(await etherWallet.balanceOf()).to.equal(0);
    })

    it("owner cannot withdraw more than balance", async ()=>{
        const { etherWallet, owner, otherAccount} = await loadFixture(deploy);
        const provider = hre.ethers.provider;
        expect(await etherWallet.balanceOf()).to.equal(0);
        const value = ethers.parseEther("10");
        
        //deposit
        const options = {
            value: value
        }
        await etherWallet.deposit(options);

        const contractBalanceAfterDeposit = await etherWallet.balanceOf();
        const withdrawAmount = ethers.parseEther("20")
        
        expect(contractBalanceAfterDeposit).to.lessThan(withdrawAmount);
        expect(contractBalanceAfterDeposit).to.equal(value);

        
        //withdraw 
        await expect(etherWallet.withdraw(owner.address,withdrawAmount)).to.revertedWith('Not enough funds');
        // Contract Balance should not change after withdraw attempt
        expect(await etherWallet.balanceOf()).to.equal(contractBalanceAfterDeposit);
    })

    it("otherAccount cannot withdraw ", async ()=>{
        const { etherWallet, owner, otherAccount} = await loadFixture(deploy);
        const provider = hre.ethers.provider;
        expect(await etherWallet.balanceOf()).to.equal(0);
        const value = ethers.parseEther("10");
        
        //deposit
        const options = {
            value: value
        }
        await etherWallet.deposit(options);

        const contractBalanceAfterDeposit = await etherWallet.balanceOf();
        expect(contractBalanceAfterDeposit).to.equal(value);
        const accountBalanceAfterDeposit  = await provider.getBalance(owner.address);

        //withdraw 
        const otherAccountBalanceBeforeWithdraw = await provider.getBalance(otherAccount.address);
        await expect(etherWallet.connect(otherAccount).withdraw(otherAccount.address,contractBalanceAfterDeposit)).revertedWith('Sender is not the owner');

    })
  });
});
      
