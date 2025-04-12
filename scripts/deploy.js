const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const CertificateVerification = await hre.ethers.getContractFactory("CertificateVerification");
  const certificateVerification = await CertificateVerification.deploy();

  await certificateVerification.waitForDeployment();
  const address = await certificateVerification.getAddress();

  console.log("CertificateVerification deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
