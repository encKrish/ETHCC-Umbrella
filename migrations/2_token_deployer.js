const TokenDeployer = artifacts.require("TokenDeployer");

module.exports = function (deployer) {
    deployer.deploy(TokenDeployer);
};
