// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VestingContract
 * @dev A token vesting contract that releases tokens gradually over time
 */
contract VestingContract is ReentrancyGuard, Ownable {
    IERC20 public immutable token;
    address public immutable beneficiary;
    uint256 public immutable startTime;
    uint256 public immutable duration;
    uint256 public immutable totalAmount;
    
    uint256 public released;
    
    event TokensReleased(uint256 amount);
    event VestingRevoked();
    
    bool public revoked;
    
    /**
     * @dev Creates a vesting contract
     * @param _token The ERC20 token to be vested
     * @param _beneficiary The address that will receive the vested tokens
     * @param _startTime The time when vesting starts
     * @param _duration The duration of the vesting period in seconds
     */
    constructor(
        IERC20 _token,
        address _beneficiary,
        uint256 _startTime,
        uint256 _duration
    ) {
        require(_beneficiary != address(0), "Beneficiary cannot be zero address");
        require(_duration > 0, "Duration must be greater than 0");
        require(_startTime >= block.timestamp, "Start time cannot be in the past");
        
        token = _token;
        beneficiary = _beneficiary;
        startTime = _startTime;
        duration = _duration;
        totalAmount = _token.balanceOf(address(this));
        
        _transferOwnership(msg.sender);
    }
    
    /**
     * @dev Calculates the amount of tokens that can be released at the current time
     */
    function releasableAmount() public view returns (uint256) {
        return vestedAmount() - released;
    }
    
    /**
     * @dev Calculates the total amount of tokens that have vested by the current time
     */
    function vestedAmount() public view returns (uint256) {
        if (block.timestamp < startTime || revoked) {
            return 0;
        } else if (block.timestamp >= startTime + duration) {
            return totalAmount;
        } else {
            return (totalAmount * (block.timestamp - startTime)) / duration;
        }
    }
    
    /**
     * @dev Releases vested tokens to the beneficiary
     */
    function release() external nonReentrant {
        uint256 unreleased = releasableAmount();
        require(unreleased > 0, "No tokens to release");
        
        released += unreleased;
        token.transfer(beneficiary, unreleased);
        
        emit TokensReleased(unreleased);
    }
    
    /**
     * @dev Allows the owner to revoke the vesting (only if not already revoked)
     * Remaining tokens are returned to the owner
     */
    function revoke() external onlyOwner {
        require(!revoked, "Vesting already revoked");
        
        uint256 unreleased = releasableAmount();
        uint256 refund = token.balanceOf(address(this)) - unreleased;
        
        revoked = true;
        
        if (unreleased > 0) {
            token.transfer(beneficiary, unreleased);
            released += unreleased;
        }
        
        if (refund > 0) {
            token.transfer(owner(), refund);
        }
        
        emit VestingRevoked();
    }
    
    /**
     * @dev Returns the remaining vesting time in seconds
     */
    function remainingTime() external view returns (uint256) {
        if (block.timestamp >= startTime + duration) {
            return 0;
        } else if (block.timestamp < startTime) {
            return startTime + duration - block.timestamp;
        } else {
            return startTime + duration - block.timestamp;
        }
    }
    
    /**
     * @dev Returns vesting information
     */
    function getVestingInfo() external view returns (
        address _token,
        address _beneficiary,
        uint256 _startTime,
        uint256 _duration,
        uint256 _totalAmount,
        uint256 _released,
        uint256 _releasable,
        bool _revoked
    ) {
        return (
            address(token),
            beneficiary,
            startTime,
            duration,
            totalAmount,
            released,
            releasableAmount(),
            revoked
        );
    }
}

/**
 * @title VestingFactory
 * @dev Factory contract for creating multiple vesting contracts
 */
contract VestingFactory {
    event VestingContractCreated(
        address indexed vestingContract,
        address indexed token,
        address indexed beneficiary,
        uint256 startTime,
        uint256 duration,
        uint256 amount
    );
    
    struct VestingInfo {
        address vestingContract;
        address token;
        address beneficiary;
        uint256 startTime;
        uint256 duration;
        uint256 amount;
        bool active;
    }
    
    mapping(address => VestingInfo[]) public userVestings;
    VestingInfo[] public allVestings;
    
    /**
     * @dev Creates a new vesting contract
     */
    function createVesting(
        IERC20 token,
        address beneficiary,
        uint256 startTime,
        uint256 duration,
        uint256 amount
    ) external returns (address) {
        require(amount > 0, "Amount must be greater than 0");
        require(token.balanceOf(msg.sender) >= amount, "Insufficient token balance");
        require(token.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        
        // Create vesting contract
        VestingContract vestingContract = new VestingContract(
            token,
            beneficiary,
            startTime,
            duration
        );
        
        // Transfer tokens to vesting contract
        token.transferFrom(msg.sender, address(vestingContract), amount);
        
        // Record vesting info
        VestingInfo memory vestingInfo = VestingInfo({
            vestingContract: address(vestingContract),
            token: address(token),
            beneficiary: beneficiary,
            startTime: startTime,
            duration: duration,
            amount: amount,
            active: true
        });
        
        userVestings[msg.sender].push(vestingInfo);
        userVestings[beneficiary].push(vestingInfo);
        allVestings.push(vestingInfo);
        
        emit VestingContractCreated(
            address(vestingContract),
            address(token),
            beneficiary,
            startTime,
            duration,
            amount
        );
        
        return address(vestingContract);
    }
    
    /**
     * @dev Get vesting contracts for a user
     */
    function getUserVestings(address user) external view returns (VestingInfo[] memory) {
        return userVestings[user];
    }
    
    /**
     * @dev Get all vesting contracts
     */
    function getAllVestings() external view returns (VestingInfo[] memory) {
        return allVestings;
    }
    
    /**
     * @dev Get total number of vesting contracts
     */
    function getTotalVestings() external view returns (uint256) {
        return allVestings.length;
    }
}