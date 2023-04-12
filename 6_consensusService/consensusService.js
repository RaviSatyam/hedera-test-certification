/**
 * Author: Ravi Satyam
 * Description: This script will use to create and subscribe the private topic and also validate
 * the authorization. 
 * 
 */
// Import dependencies
const {
  PrivateKey,
  Client,
  TopicCreateTransaction,
  TopicMessageQuery,
  TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");

require("dotenv").config();

//Set the account ID and private key of account 1
const myAccountId = process.env.Account1_Id;
const myPrivateKey = PrivateKey.fromString(process.env.Account1_PVKEY);

//Set the account ID and private key of the authorized account
const authorizedAccountId = process.env.Account2_Id;
const authorizedPrivateKey = PrivateKey.fromString(process.env.Account2_PVKEY);

const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

async function consensus() {
  // Create a new topic
  let txResponse = await new TopicCreateTransaction()
    .setSubmitKey(authorizedPrivateKey.publicKey)
    .execute(client);

  // Get the newly generated topic ID
  let receipt = await txResponse.getReceipt(client);
  let topicId = receipt.topicId;
  console.log(`Your topic ID is: ${topicId}`);

  // Wait 5 seconds between consensus topic creation and subscription creation
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Create the topic
  new TopicMessageQuery()
    .setTopicId(topicId)
    .subscribe(client, null, (message) => {
      console.log(`Received message from topic: ${message}`);
    });

  // Send message to private topic if authorized
  if (authorizedAccountId) {
    const message =new Date().toUTCString();
    let submitMsgTx = await new TopicMessageSubmitTransaction({
      topicId: topicId,
      message,
    })
    .freezeWith(client)
    .sign(authorizedPrivateKey);

    let submitMsgTxSubmit = await submitMsgTx.execute(client);
    let getReceipt = await submitMsgTxSubmit.getReceipt(client);

    // Get the status of the transaction
    const transactionStatus = getReceipt.status;
    console.log("The message transaction status: " + transactionStatus.toString());

    console.log(`Hey, It's Ravi you are authorized,while writing consensus service message the time is : ${message}`);
  } else {
    console.log("You are not authorized to send messages to this topic.");
  }

  process.exit();
}

consensus();