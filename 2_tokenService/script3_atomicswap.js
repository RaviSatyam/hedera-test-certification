/*
Author: Ravi Satyam
The following code is to atomic swap transaction 150 token to account2 against 10 hbar
Hedera Hashgraph test network using javascript sdk 
provided by Hedera Hashgraph.
*/

const {
    TransferTransaction,
    Client,
    Wallet,
    AccountBalanceQuery,
    Hbar,
    PrivateKey

} = require("@hashgraph/sdk");

// Loads environment variables from a .env file into process.env object using the dotenv package.

require('dotenv').config();

// send token from the treasury Account
const treasuryAccountId = process.env.Account1_Id;
const treasuryPrivateKey = PrivateKey.fromString(process.env.Account1_PVKEY);
// send token to account2
const recipientId = process.env.Account2_Id;
const recipientPrivateKey = PrivateKey.fromString(process.env.Account2_PVKEY);

const tokenId = process.env.TOKEN_ID;

//Throw a new error if we were unable to retrieve it.
if (treasuryAccountId == null ||
    treasuryPrivateKey == null) {
    throw new Error("Environment variables treasuryAccountId and treasuryPrivateKey must be present");
}

//Throw a new error if we were unable to retrieve it.
if (recipientId == null ||
    recipientPrivateKey == null) {
    throw new Error("Environment variables recipientId and recipientPrivateKey must be present");
}


//Setting-up the client to interact with Hedera Test Network
const client = Client.forTestnet();

client.setOperator(treasuryAccountId, treasuryPrivateKey);

const recepientWallet = new Wallet(
    recipientId,
    recipientPrivateKey
);



async function main() {


    // how much ammount of token you want to swap
    var transferTokenAmmount = 150

    // how much ammount of HBar you want to swap
    var transferHbarAmmount = 10
    console.log(`############################################ Swapping ${transferTokenAmmount} Token with ${transferHbarAmmount} Hbar ####################################################`)

    //TRANSFER STABLECOIN FROM TREASURY TO ALICE
    const atomicSwapTx = await new TransferTransaction()
        .addHbarTransfer(recepientWallet.accountId, new Hbar(-transferHbarAmmount))
        .addHbarTransfer(client.operatorAccountId, new Hbar(transferHbarAmmount))
        .addTokenTransfer(tokenId, client.operatorAccountId, -(transferTokenAmmount))
        .addTokenTransfer(tokenId, recepientWallet.accountId, transferTokenAmmount)
        .freezeWith(client);

    //Sign with the sender account private key and recipient private key
    const signTx = await (await atomicSwapTx.sign(treasuryPrivateKey)).sign(recipientPrivateKey);

    //Sign with the client operator private key and submit to a Hedera network
    const txResponse = await signTx.execute(client);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Obtain the transaction consensus status
    const transactionStatus = receipt.status;

    console.log(`\n- Atomic swap with account2 status: ${transactionStatus} \n`);
    console.log(`Transaction ID: ${txResponse.transactionId}`);

    //BALANCE CHECK
    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(treasuryAccountId).execute(client);
    console.log(`- Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);

    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(recipientId).execute(client);
    console.log(`- Recipient's balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);

    process.exit();

}
// The async function is being called in the top-level scope.
main();