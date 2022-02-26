//SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

contract BankingKyc {
    struct Customer {
        bool validCustomer;
        bool kycStatus;
        address bankAddress;
        string name;
        string phNumber;
    }

    struct Bank {
        bool validBank;
        bool kycEnabled;
        bool customerOnBoardingEnabled;
        string name;
    }

    mapping(address => Bank) public mapBanks;
    mapping(string => Customer) public mapCustomers;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only Owner can perform this transaction.");
        _;
    }

    modifier onlyKycEnabledBank() {
        require(mapBanks[msg.sender].kycEnabled, "Only KYC Enabled Banks can perform this transaction.");
        _;
    }

    modifier onlyCustAllowedBanks() {
        require(mapBanks[msg.sender].customerOnBoardingEnabled, "Only Banks with Customer Onboarding enabled can perform this transaction.");
        _;
    }

    function addNewBank(string memory name, address banksAdd) external onlyOwner {
        require(!mapBanks[banksAdd].validBank, "Bank is already Added");

        mapBanks[banksAdd].name = name;
        mapBanks[banksAdd].validBank = true;
        mapBanks[banksAdd].kycEnabled = false;
        mapBanks[banksAdd].customerOnBoardingEnabled = false;
    }

    function addNewCustomer(string calldata custName, string memory phNumber) external onlyCustAllowedBanks {
        require(!mapCustomers[phNumber].validCustomer, "Customer is already added.");

        mapCustomers[phNumber].name = custName;
        mapCustomers[phNumber].phNumber = phNumber;
        mapCustomers[phNumber].bankAddress = msg.sender;
        mapCustomers[phNumber].validCustomer = true;
        mapCustomers[phNumber].kycStatus = false;
    }

    function getKycStatusForCustomer(string calldata phNumber) external view returns(bool status) {
        require(mapCustomers[phNumber].validCustomer, "Not a vlaid customer");

        return mapCustomers[phNumber].kycStatus;
    }

    function performCustomerKyc(string calldata phNumber) external onlyKycEnabledBank {
        require(mapCustomers[phNumber].validCustomer, "Not a valid customer");
        require(mapCustomers[phNumber].bankAddress == msg.sender, "KYC can only be performed by customer's bank");

        mapCustomers[phNumber].kycStatus = true;
    }

    function blockBankCustOnBoarding(address bankAddress) external onlyOwner {
        require(mapBanks[bankAddress].validBank, "Not a valid bank address");

        mapBanks[bankAddress].customerOnBoardingEnabled = false;
    }

    function blockBankForKyc(address bankAddress) external onlyOwner {
        require(mapBanks[bankAddress].validBank, "Not a valid bank address");

        mapBanks[bankAddress].kycEnabled = false;
    }

    function allowBankCusOnBoarding(address bankAddress) external onlyOwner {
        require(mapBanks[bankAddress].validBank, "Not a valid bank address");

        mapBanks[bankAddress].customerOnBoardingEnabled = true;
    }

    function allowBankForKyc(address bankAddress) external onlyOwner {
        require(mapBanks[bankAddress].validBank, "Not a valid bank address");

        mapBanks[bankAddress].kycEnabled = true;
    }

    function getCustomerData(string calldata phNumber) external view returns(string memory name) {
        require(mapCustomers[phNumber].validCustomer, "Not a valid customer");

        return mapCustomers[phNumber].name;
    }

    function getBankInfo(address bankAddress) external view returns(Bank memory bank) {
        bank = mapBanks[bankAddress];
    }
}


