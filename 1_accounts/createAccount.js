/**
 * Author: Ravi Satyam
 * Description: This script will use to create 5 new accounts and query the balances.
 */
// Import dependencies 
const {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  AccountBalanceQuery,
  Hbar
} = require("@hashgraph/sdk");
// Loading values from ennvironment file
require("dotenv").config({path: './.env'});
// Set Hedera testnet account ID and private key from environment file
const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = process.env.MY_PRIVATE_KEY;

// Validating myAccountId and myPrivateKey for null value
if (myAccountId == null || myPrivateKey == null) {
  throw new Error("Environment variables myAccountId and myPrivateKey must be present");
}

// Create connection to the Hedera network
const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

// Create 5 new accounts using createAccounts function
async function createAccounts() {
  const newAccountsList = [];
  for (let i = 0; i < 5; i++) {
    // Create new private and public keys
    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    // Create a new account with 500 Hbar starting balance
    const newAccount = await new AccountCreateTransaction()
      .setKey(newAccountPublicKey)
      .setInitialBalance(new Hbar(500))
      .execute(client);

    // Get the new account ID
    const getReceipt = await newAccount.getReceipt(client);
    const newAccountId = getReceipt.accountId;
    console.log(`###---------- Account ${i+1} credential----------------###`)
    console.log(`Account${i + 1}_Id= ${newAccountId} `);
    console.log(`Account${i + 1}_PBKEY=${newAccountPublicKey}`);
    console.log(`Account${i + 1}_PVKEY=${newAccountPrivateKey} `);

    // Add the new account to the list of created accounts
    newAccountsList.push(newAccountId);

  }
  // Call the balanceQuery function to print account balance of new created accounts
  await balanceQuery(newAccountsList);
}


// Query the balances of the accounts using balanceQuery function
async function balanceQuery(accountList) {

  for (const newAccountId of accountList) {
    const accountBalance = await new AccountBalanceQuery()
      .setAccountId(newAccountId)
      .execute(client);

    console.log("Account " + newAccountId + " balance: " + accountBalance.hbars + "Hbar");

    console.log("Account info for account :")
    console.log(JSON.stringify(accountBalance));
  }

}
// Call the createAccounts function for creating accounts
createAccounts();