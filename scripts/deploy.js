const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying TokenFactory and VestingFactory contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy VestingFactory first (if needed separately)
  const VestingFactory = await ethers.getContractFactory("VestingFactory");
  const vestingFactory = await VestingFactory.deploy();
  await vestingFactory.deployed();
  console.log("VestingFactory deployed to:", vestingFactory.address);

  // Deploy TokenFactory
  const TokenFactory = await ethers.getContractFactory("TokenFactory");
  const tokenFactory = await TokenFactory.deploy();
  await tokenFactory.deployed();
  console.log("TokenFactory deployed to:", tokenFactory.address);

  // Verify deployment
  console.log("\nDeployment Summary:");
  console.log("==================");
  console.log("TokenFactory:", tokenFactory.address);
  console.log("VestingFactory:", vestingFactory.address);
  console.log("Deployer:", deployer.address);
  console.log("Network:", hre.network.name);

  // Save deployment addresses to a file
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contracts: {
      TokenFactory: tokenFactory.address,
      VestingFactory: vestingFactory.address
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    `deployments/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`\nDeployment info saved to deployments/${hre.network.name}.json`);

  // If on a live network, wait for block confirmations before verification
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await tokenFactory.deployTransaction.wait(6);
    await vestingFactory.deployTransaction.wait(6);

    // Verify contracts on Etherscan
    try {
      console.log("\nVerifying TokenFactory...");
      await hre.run("verify:verify", {
        address: tokenFactory.address,
        constructorArguments: [],
      });

      console.log("Verifying VestingFactory...");
      await hre.run("verify:verify", {
        address: vestingFactory.address,
        constructorArguments: [],
      });

      console.log("Contracts verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });