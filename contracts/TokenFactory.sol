// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./VestingContract.sol";

/**
 * @title TokenFactory
 * @dev Factory contract for creating customizable ERC20 tokens with advanced features
 */
contract TokenFactory is ReentrancyGuard {
    struct TokenConfig {
        string name;
        string symbol;
        uint8 decimals;
        uint256 initialSupply;
        uint256 maxSupply;
        bool burnable;
        bool mintable;
        bool transferFees;
        bool holderRedistribution;
        uint256 buyFee; // in basis points (100 = 1%)
        uint256 sellFee; // in basis points
        address feeRecipient;
    }

    struct VestingConfig {
        uint256 percentage; // in basis points (10000 = 100%)
        uint256 startTime;
        uint256 duration; // in seconds
        bool enabled;
    }

    event TokenCreated(
        address indexed tokenAddress,
        address indexed creator,
        string name,
        string symbol,
        uint256 initialSupply
    );

    event VestingContractCreated(
        address indexed vestingContract,
        address indexed tokenAddress,
        address indexed beneficiary,
        uint256 amount,
        uint256 startTime,
        uint256 duration
    );

    uint256 public constant MAX_FEE = 2500; // 25% maximum fee
    uint256 public deploymentFee = 0.01 ether;
    address public feeRecipient;
    address public owner;

    mapping(address => address[]) public userTokens;
    address[] public allTokens;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        feeRecipient = msg.sender;
    }

    /**
     * @dev Creates a new token with specified configuration
     */
    function createToken(
        TokenConfig memory config,
        VestingConfig[] memory vestingConfigs
    ) external payable nonReentrant returns (address) {
        require(msg.value >= deploymentFee, "Insufficient deployment fee");
        require(bytes(config.name).length > 0, "Name cannot be empty");
        require(bytes(config.symbol).length > 0, "Symbol cannot be empty");
        require(config.initialSupply > 0, "Initial supply must be greater than 0");
        
        if (config.transferFees) {
            require(config.buyFee <= MAX_FEE, "Buy fee too high");
            require(config.sellFee <= MAX_FEE, "Sell fee too high");
            require(config.feeRecipient != address(0), "Fee recipient cannot be zero address");
        }

        // Deploy the token contract
        CustomToken token = new CustomToken(config, msg.sender);
        address tokenAddress = address(token);

        // Create vesting contracts if specified
        uint256 totalVestedPercentage = 0;
        for (uint256 i = 0; i < vestingConfigs.length; i++) {
            if (vestingConfigs[i].enabled) {
                totalVestedPercentage += vestingConfigs[i].percentage;
                _createVestingContract(
                    tokenAddress,
                    msg.sender,
                    vestingConfigs[i]
                );
            }
        }

        require(totalVestedPercentage <= 10000, "Total vesting percentage exceeds 100%");

        // Record the token
        userTokens[msg.sender].push(tokenAddress);
        allTokens.push(tokenAddress);

        // Transfer deployment fee
        payable(feeRecipient).transfer(msg.value);

        emit TokenCreated(
            tokenAddress,
            msg.sender,
            config.name,
            config.symbol,
            config.initialSupply
        );

        return tokenAddress;
    }

    /**
     * @dev Creates a vesting contract for token allocation
     */
    function _createVestingContract(
        address tokenAddress,
        address beneficiary,
        VestingConfig memory vestingConfig
    ) internal {
        uint256 vestingAmount = (IERC20(tokenAddress).totalSupply() * vestingConfig.percentage) / 10000;
        
        VestingContract vestingContract = new VestingContract(
            IERC20(tokenAddress),
            beneficiary,
            vestingConfig.startTime,
            vestingConfig.duration
        );

        // Transfer tokens to vesting contract
        IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(vestingContract),
            vestingAmount
        );

        emit VestingContractCreated(
            address(vestingContract),
            tokenAddress,
            beneficiary,
            vestingAmount,
            vestingConfig.startTime,
            vestingConfig.duration
        );
    }

    /**
     * @dev Get tokens created by a user
     */
    function getUserTokens(address user) external view returns (address[] memory) {
        return userTokens[user];
    }

    /**
     * @dev Get all created tokens
     */
    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }

    /**
     * @dev Update deployment fee (only owner)
     */
    function setDeploymentFee(uint256 _fee) external onlyOwner {
        deploymentFee = _fee;
    }

    /**
     * @dev Update fee recipient (only owner)
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Fee recipient cannot be zero address");
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Transfer ownership (only owner)
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
}

/**
 * @title CustomToken
 * @dev Customizable ERC20 token with advanced features
 */
contract CustomToken is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {
    uint8 private _decimals;
    uint256 public maxSupply;
    bool public mintable;
    bool public transferFeesEnabled;
    bool public holderRedistributionEnabled;
    
    uint256 public buyFee; // in basis points
    uint256 public sellFee; // in basis points
    address public feeRecipient;
    
    mapping(address => bool) public excludedFromFees;
    mapping(address => uint256) private _reflectionBalances;
    uint256 private _totalReflections;

    event FeesUpdated(uint256 buyFee, uint256 sellFee);
    event FeeRecipientUpdated(address feeRecipient);
    event ExcludedFromFees(address account, bool excluded);

    constructor(
        TokenFactory.TokenConfig memory config,
        address initialOwner
    ) ERC20(config.name, config.symbol) {
        _decimals = config.decimals;
        maxSupply = config.maxSupply;
        mintable = config.mintable;
        transferFeesEnabled = config.transferFees;
        holderRedistributionEnabled = config.holderRedistribution;
        buyFee = config.buyFee;
        sellFee = config.sellFee;
        feeRecipient = config.feeRecipient;
        
        _transferOwnership(initialOwner);
        
        // Exclude owner and contract from fees
        excludedFromFees[initialOwner] = true;
        excludedFromFees[address(this)] = true;
        
        // Mint initial supply
        _mint(initialOwner, config.initialSupply * 10**config.decimals);
        
        if (holderRedistributionEnabled) {
            _totalReflections = (~uint256(0) - (~uint256(0) % totalSupply()));
            _reflectionBalances[initialOwner] = _totalReflections;
        }
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Mint new tokens (only if mintable and within max supply)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(mintable, "Token is not mintable");
        require(totalSupply() + amount <= maxSupply, "Would exceed max supply");
        _mint(to, amount);
    }

    /**
     * @dev Override transfer to implement fees and reflections
     */
    function _transfer(address from, address to, uint256 amount) internal override {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        if (transferFeesEnabled && !excludedFromFees[from] && !excludedFromFees[to]) {
            uint256 feeAmount = 0;
            
            // Apply buy/sell fees (simplified - in real implementation, you'd detect DEX transactions)
            if (from != owner() && to != owner()) {
                feeAmount = (amount * buyFee) / 10000;
            }
            
            if (feeAmount > 0) {
                if (holderRedistributionEnabled) {
                    _redistribute(feeAmount);
                } else {
                    super._transfer(from, feeRecipient, feeAmount);
                }
                amount -= feeAmount;
            }
        }

        super._transfer(from, to, amount);
    }

    /**
     * @dev Redistribute tokens to all holders
     */
    function _redistribute(uint256 amount) internal {
        if (holderRedistributionEnabled && totalSupply() > 0) {
            uint256 reflectionAmount = (amount * _totalReflections) / totalSupply();
            _totalReflections -= reflectionAmount;
        }
    }

    /**
     * @dev Update fee configuration (only owner)
     */
    function updateFees(uint256 _buyFee, uint256 _sellFee) external onlyOwner {
        require(_buyFee <= 2500 && _sellFee <= 2500, "Fees cannot exceed 25%");
        buyFee = _buyFee;
        sellFee = _sellFee;
        emit FeesUpdated(_buyFee, _sellFee);
    }

    /**
     * @dev Update fee recipient (only owner)
     */
    function updateFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Fee recipient cannot be zero address");
        feeRecipient = _feeRecipient;
        emit FeeRecipientUpdated(_feeRecipient);
    }

    /**
     * @dev Exclude/include account from fees (only owner)
     */
    function setExcludedFromFees(address account, bool excluded) external onlyOwner {
        excludedFromFees[account] = excluded;
        emit ExcludedFromFees(account, excluded);
    }

    /**
     * @dev Enable/disable transfer fees (only owner)
     */
    function setTransferFeesEnabled(bool enabled) external onlyOwner {
        transferFeesEnabled = enabled;
    }
}