const { expect } = require('chai');

describe("BankKYC contract", function() {
	it("Deployment should assign owner to contract creator", async function() {
		const [owner] = await ethers.getSigners();

		const BankKyc = await ethers.getContractFactory("BankingKyc");

		const bankKyc = await BankKyc.deploy();
		console.log("bankKYC Owner: " + await bankKyc.owner());
		console.log("Owner: " + owner);

		expect(await bankKyc.owner()).to.equal(owner.address);

	})
});

describe("BankingKYC functionality", function() {
	let owner, bank1, bank2, bank3;
	let BankingKyc;
	let bankKyc;

	beforeEach(async function() {
		BankingKyc = await ethers.getContractFactory("BankingKyc");

		[owner, bank1, bank2, bank3] = await ethers.getSigners();

		bankKyc = await BankingKyc.deploy();
	});

	describe("Adding a bank", function() {
		it("owner should add banks", async function () {
			await bankKyc.addNewBank("SBI", bank1.address);
			[,,,bankName] = await bankKyc.mapBanks(bank1.address);
			expect(bankName).to.equal("SBI");

			await bankKyc.addNewBank("ICICI", bank2.address);
			[,,,bankName] = await bankKyc.mapBanks(bank2.address);
			expect(bankName).to.equal("ICICI");
		});

		it("Banks should be added with default values", async function() {
			await bankKyc.addNewBank("SBI", bank1.address);
			[validBank, kycEnabled, cusOnBordingEnabled, name] = await bankKyc.mapBanks(bank1.address);
			expect(validBank).to.equal(true);
			expect(kycEnabled).to.equal(false);
			expect(cusOnBordingEnabled).to.equal(false);
			expect(name).to.equal("SBI");
		});

		it("Same bank address should not be used multiple times", async function() {
			await bankKyc.addNewBank("SBI", bank1.address);
			[,,,bankName] = await bankKyc.mapBanks(bank1.address);
			expect(bankName).to.equal("SBI");

			await expect(bankKyc.addNewBank("ICICI", bank1.address)).to.be.revertedWith("Bank is already Added");
		});

		it("accounts oher then owner should not add banks", async function() {
			await expect(bankKyc.connect(bank1).addNewBank("SBI", bank1.address)).to.be.revertedWith("Only Owner can perform this transaction.");
		});
	});
});

describe("BankingKYC functionality", function() {
	let owner, bank1, bank2, bank3;
	let BankingKyc;
	let bankKyc;

	beforeEach(async function() {
		BankingKyc = await ethers.getContractFactory("BankingKyc");

		[owner, bank1, bank2, bank3, other1, other2] = await ethers.getSigners();

		bankKyc = await BankingKyc.deploy();

		await bankKyc.addNewBank("SBI", bank1.address);
		await bankKyc.addNewBank("ICICI", bank2.address);
		await bankKyc.addNewBank("HDFC", bank3.address);
	});

	describe("customer onboaring", function() {
		it("owner should change customer onboarding status", async function() {
			await bankKyc.allowBankCusOnBoarding(bank1.address);
			[,,enabled,] = await bankKyc.mapBanks(bank1.address);
			expect(enabled).to.equal(true);

			await bankKyc.blockBankCustOnBoarding(bank1.address);
			[,,enabled,] = await bankKyc.mapBanks(bank1.address);
			expect(enabled).to.equal(false);

		});

		it("non owner account should not change customer onboarding status for bank", async function() {
			await expect(bankKyc.connect(bank2).allowBankCusOnBoarding(bank1.address))
				.to.be.revertedWith("Only Owner can perform this transaction.");
			await expect(bankKyc.connect(bank2).allowBankCusOnBoarding(other1.address))
				.to.be.revertedWith("Only Owner can perform this transaction.");

			await expect(bankKyc.connect(bank2).blockBankCustOnBoarding(bank1.address))
				.to.be.revertedWith("Only Owner can perform this transaction.");
			await expect(bankKyc.connect(bank2).blockBankCustOnBoarding(other1.address))
				.to.be.revertedWith("Only Owner can perform this transaction.");			
		});
	});

	describe("Perform KYC", function() {
		it("owner should change Bank KYC status", async function() {
			await bankKyc.allowBankForKyc(bank1.address);
			[,enabled,,] = await bankKyc.mapBanks(bank1.address);
			expect(enabled).to.equal(true);

			await bankKyc.blockBankForKyc(bank1.address);
			[,enabled,,] = await bankKyc.mapBanks(bank1.address);
			expect(enabled).to.equal(false);

		});

		it("non owner account should not change customer onboarding status for bank", async function() {
			await expect(bankKyc.connect(bank2).allowBankForKyc(bank1.address))
				.to.be.revertedWith("Only Owner can perform this transaction.");
			await expect(bankKyc.connect(bank2).allowBankForKyc(other1.address))
				.to.be.revertedWith("Only Owner can perform this transaction.");

			await expect(bankKyc.connect(bank2).blockBankForKyc(bank1.address))
				.to.be.revertedWith("Only Owner can perform this transaction.");
			await expect(bankKyc.connect(bank2).blockBankForKyc(other1.address))
				.to.be.revertedWith("Only Owner can perform this transaction.");			
		});
	});

	describe("Adding a Customer", function() {
		it("Bank should add a customer", async function() {
			await bankKyc.connect(bank1).addNewCustomer("ABC", "12345");
			[,,,name,phNumber] = await bankKyc.mapCustomers("12345");
			expect(name).to.equal("ABC");
			expect(phNumber).to.equal("12345");
		});
	});
});