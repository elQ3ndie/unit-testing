const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('Faucet', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {
    const Faucet = await ethers.getContractFactory('Faucet');
    const faucet = await Faucet.deploy();

    const [owner, non_owner] = await ethers.getSigners();

    console.log('Owner address: ', owner.address);
    console.log('Non_owner address: ', non_owner.address);

    let withdrawAmount = ethers.utils.parseEther('1');

    return { faucet, owner, withdrawAmount, non_owner };
  }

  it('should deploy and set the owner correctly', async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

    expect(await faucet.owner()).to.equal(owner.address);
  });

  it('should not allow withdrawals above .1 ETH at a time', async function () {
    const { faucet, withdrawAmount } = await loadFixture(deployContractAndSetVariables);
    console.log(faucet);
    await expect(faucet.withdraw(withdrawAmount)).to.be.reverted;
  });


  it('should allow only owner to call withdrawAll() and destroyFaucet() function ', async function () {
    const {faucet, non_owner} = await loadFixture(deployContractAndSetVariables);
    // connect to the instance of a faucet using non_owner account and try to call withdrawAll function
    const nonOwnerFaucet = faucet.connect(non_owner);
    await nonOwnerFaucet.withdrawAll();

    await expect(nonOwnerFaucet.withdrawAll() && nonOwnerFaucet.destroyFaucet()).to.be.reverted ;
  });

  it('should withdraw all ether when withdraw() is called', async function () {
    const { faucet } = await loadFixture(deployContractAndSetVariables);

    await faucet.withdrawAll(); 
    
    const faucetBalance = await ethers.provider.getBalance(faucet.address);
    expect(await faucetBalance).to.equal(ethers.utils.parseEther('0'));
  });

  it('should destroy the faucet when the destroyfaucet() is called', async function () {
    const { faucet } = await loadFixture(deployContractAndSetVariables);
    await faucet.destroyFaucet();
    
    const destroyedFaucet = await ethers.provider.getCode(faucet.address);
    expect(await destroyedFaucet).to.equal("0x");
  });

});