/**
 * Author: Ravi Satyam
 * Description: This script will use to create wallents with initial value 20 Hbar
 * with 3 keys. Also transfer 10 hbar to account4 and sign with acc1.
 */
// Import dependencies
const {
    Wallet,
    LocalProvider,
    AccountId,
    PrivateKey,
    KeyList,
    AccountCreateTransaction,
    Hbar,
    AccountBalanceQuery,
    TransferTransaction,
    ScheduleSignTransaction,
    ScheduleInfoQuery,
    TransactionRecordQuery,
    PublicKey,
} = require("@hashgraph/sdk");

require('dotenv').config();


/**
 * @typedef {import("@hashgraph/sdk").AccountBalance} AccountBalance
 * @typedef {import("@hashgraph/sdk").AccountId} AccountId
 */
 const accountId1 =  AccountId.fromString(process.env.Account1_Id);
 const privateKey1=  PrivateKey.fromString(process.env.Account1_PVKEY);
 const publicKey1 =  PublicKey.fromString(process.env.Account1_PBKEY);
 const accountId2 =  AccountId.fromString(process.env.Account2_Id);
 const privateKey2=  PrivateKey.fromString(process.env.Account2_PVKEY);
 const publicKey2 =  PublicKey.fromString(process.env.Account2_PBKEY);
 const accountId3 =  AccountId.fromString(process.env.Account3_Id);
 const privateKey3=  PrivateKey.fromString(process.env.Account3_PVKEY);
 const publicKey3 =  PublicKey.fromString(process.env.Account3_PBKEY);
 const accountId4 =  AccountId.fromString(process.env.Account4_Id);
 const privateKey4=  PrivateKey.fromString(process.env.Account4_PVKEY);

 //Validating keys from .env file
if (accountId1 == null ||privateKey1 == null) {
    throw new Error("Please check .env file");
}
if (accountId2 == null ||privateKey2 == null) {
    throw new Error("Please check .env file");
}
if (accountId3 == null ||privateKey3 == null) {
    throw new Error("Please check .env file");
}
if (accountId4 == null ||privateKey4 == null) {
    throw new Error("Please check .env file");
}

async function main() {
    
    const wallet = new Wallet(accountId4,privateKey4,new LocalProvider());
       

    // generate keys
    const publicKeyList = [];
    publicKeyList.push(publicKey1);
    publicKeyList.push(publicKey2);
    publicKeyList.push(publicKey3);

    const privateKeyList = [];
    privateKeyList.push(privateKey1);
    privateKeyList.push(privateKey2);
    privateKeyList.push(privateKey3);
    const thresholdKey = new KeyList(publicKeyList, 3);

    // create multi-sign account
    let transaction = await new AccountCreateTransaction()
        .setKey(thresholdKey)
        .setInitialBalance(new Hbar(20))
        .setAccountMemo("2-of-3 multi-sign account4")
        .freezeWithSigner(wallet);
    transaction = await transaction.signWithSigner(wallet);
    const txAccountCreate = await transaction.executeWithSigner(wallet);

    const txAccountCreateReceipt = await txAccountCreate.getReceiptWithSigner(
        wallet
    );
    const multiSigAccountId = txAccountCreateReceipt.accountId;
    console.log(
        `2-of-3 multi-sig account ID:  ${multiSigAccountId.toString()}`
    );
    await queryBalance(multiSigAccountId, wallet);

    // schedule crypto transfer from multi-sig account to operator account
    const txSchedule = await (
        await (
            await (
                await new TransferTransaction()
                    .addHbarTransfer(multiSigAccountId, new Hbar(-10))
                    .addHbarTransfer(
                        wallet.getAccountId(),
                        new Hbar(10)
                    )
                    .schedule() // create schedule
                    .freezeWithSigner(wallet)
            ).signWithSigner(wallet)
        ).sign(privateKeyList[0])
    ) // add 1. signature
        .executeWithSigner(wallet);

    const txScheduleReceipt = await txSchedule.getReceiptWithSigner(wallet);
    console.log("Schedule status: " + txScheduleReceipt.status.toString());
    const scheduleId = txScheduleReceipt.scheduleId;
    console.log(`Schedule ID:  ${scheduleId.toString()}`);
    const scheduledTxId = txScheduleReceipt.scheduledTransactionId;
    console.log(`Scheduled tx ID:  ${scheduledTxId.toString()}`);

    // add 2. signature
    const txScheduleSign1 = await (
        await (
            await (
                await new ScheduleSignTransaction()
                    .setScheduleId(scheduleId)
                    .freezeWithSigner(wallet)
            ).signWithSigner(wallet)
        ).sign(privateKeyList[1])
    ).executeWithSigner(wallet);

    const txScheduleSign1Receipt = await txScheduleSign1.getReceiptWithSigner(
        wallet
    );
    console.log(
        "1. ScheduleSignTransaction status: " +
            txScheduleSign1Receipt.status.toString()
    );
    await queryBalance(multiSigAccountId, wallet);

    // add 3. signature to trigger scheduled tx
    const txScheduleSign2 = await (
        await (
            await (
                await new ScheduleSignTransaction()
                    .setScheduleId(scheduleId)
                    .freezeWithSigner(wallet)
            ).signWithSigner(wallet)
        ).sign(privateKeyList[2])
    ).executeWithSigner(wallet);

    const txScheduleSign2Receipt = await txScheduleSign2.getReceiptWithSigner(
        wallet
    );
    console.log(
        "2. ScheduleSignTransaction status: " +
            txScheduleSign2Receipt.status.toString()
    );
    await queryBalance(multiSigAccountId, wallet);

}

/**
 * @param {AccountId} accountId
 * @param {Wallet} wallet
 * @returns {Promise<AccountBalance>}
 */
async function queryBalance(accountId, wallet) {
    const accountBalance = await new AccountBalanceQuery()
        .setAccountId(accountId)
        .executeWithSigner(wallet);
    console.log(
        `Balance of account ${accountId.toString()}: ${accountBalance} Hbar`
    );
    return accountBalance;
}

void main();
