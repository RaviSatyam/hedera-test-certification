/**
 * Author: Ravi Satyam
 * Description: The following code is to associate account with token
 Hedera Hashgraph test network using javascript sdk 
 provided by Hedera Hashgraph.
 */
// Import dependencies


const {
    Client,
    TokenAssociateTransaction,
    Wallet,
    PrivateKey
  } = require("@hashgraph/sdk");
  
  // Loads environment variables from a .env file into process.env object using the dotenv package.
  
  require('dotenv').config();
  
  // configuring the treasury Account
  const treasuryAccountId = process.env.Account1_Id;
  const treasuryPrivateKey = PrivateKey.fromString(process.env.Account1_PVKEY);
  
  // associate account2
  const account2Id = process.env.Account2_Id;
  const account2PrivateKey = PrivateKey.fromString(process.env.Account2_PVKEY);
  
  const tokenId = process.env.TOKEN_ID;
  
  //Throw a new error if we were unable to retrieve it.
  if (treasuryAccountId == null ||
    treasuryPrivateKey == null) {
    throw new Error("Environment variables treasuryAccountId and treasuryPrivateKey must be present");
  }
  
  //Throw a new error if we were unable to retrieve it.
  if (account2Id == null ||
    account2PrivateKey == null) {
    throw new Error("Environment variables account2Id and account2PrivateKey must be present");
  }
  
  
  //Setting-up the client to interact with Hedera Test Network
  const client = Client.forTestnet();
  
  client.setOperator(treasuryAccountId, treasuryPrivateKey);
  
  const account2Wallet = new Wallet(
    account2Id,
    account2PrivateKey
  );
  
  
  async function main() {
  
    //LOG THE TRANSACTION STATUS
    console.log(`########################## Associating account 2 with the token id: ${tokenId} ##########################`);
  
    //Associate account2 with the token
    let associateAccount2Tx = await new TokenAssociateTransaction()
      .setAccountId(account2Wallet.accountId)
      .setTokenIds([tokenId])
      .freezeWith(client)
      .sign(account2PrivateKey)
  
    //SUBMIT THE TRANSACTION
    let associateAccount2TxSubmit = await associateAccount2Tx.execute(client);
  
    //GET THE RECEIPT OF THE TRANSACTION
    let associateAccount2Rx = await associateAccount2TxSubmit.getReceipt(client);
  
    //LOG THE TRANSACTION STATUS
    console.log(`- Token association with account2: ${associateAccount2Rx.status} \n- - Transaction ID for Token association with account2: ${associateAccount2TxSubmit.transactionId}`);
  
  
    process.exit();
  }
  
  // The async function is being called in the top-level scope.
  main();