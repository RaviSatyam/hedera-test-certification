/**
 * Author: Ravi Satyam
 * Description: 
 * 1. create schedule transaction 
 * 2. delete the schedule transaction
 * 3. get scheduled transaction information
 */
// Import dependencies
const {
    AccountId, Client, Hbar, ScheduleId, ScheduleInfoQuery, Timestamp,
    PrivateKey, TransferTransaction, ScheduleCreateTransaction, ScheduleDeleteTransaction, Transaction
} = require("@hashgraph/sdk");

require("dotenv").config();

// Define main function to call requisite function
async function main() {
    // const account1AccountId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
    // const account1PrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

    // setting keys for accounts
    const account1AccountId = AccountId.fromString(process.env.Account1_Id);;
    const account1PrivateKey = PrivateKey.fromString(process.env.Account1_PVKEY);
    const account2AccountId = AccountId.fromString(process.env.Account2_Id);
    const account2PrivateKey = PrivateKey.fromString(process.env.Account2_PVKEY);

    // creating a client for testnet using account 1
    const myClient = Client.forTestnet().setOperator(account1AccountId, account1PrivateKey);

    // transferring 2 Hbars from account1 to account2 and then creating schedule 
    let result = await createSchedule(account1AccountId, account2AccountId, myClient, account1PrivateKey, "Scheduled Transaction 3 By Ravi.");
    console.info('scheduleId: ' + result.scheduleId);

    // deleting schedule 
    let scheduleDeleteStatus = await deleteSchedule(result.scheduleId, myClient, account1PrivateKey);
    console.info('schedule transaction delete status: ' + scheduleDeleteStatus.toString());

    
    
    //getting schedule information and transaction proofs 
    await getScheduleInfo(result.scheduleId, myClient);

    // deleting schedule 
    let executeScheduledTx = await executeScheduled(account1AccountId, myClient, account1PrivateKey);
    console.info('schedule transaction delete status: ' + executeScheduledTx.toString());
    

    process.exit();
}

//==============================================================================================================
// function to transfer 2 hbar and then create a schedule for it
//==============================================================================================================
async function createSchedule(fromAccountId, toAccountId, treasuryAccountClient, treasuryAccountPrivateKey, scheduleMemo) {
    console.info("* * * * * * * * * * scheduled_transaction_service --> createSchedule START  * * * * * * * * * *  ");

    // Create a transaction to schedule
    const transferTx = new TransferTransaction()
        .addHbarTransfer(fromAccountId, new Hbar(-2))//setting 2 Hbar to transfer
        .addHbarTransfer(toAccountId, new Hbar(2));//new Hbar(2)

    //Schedule a transaction
    const scheduleTransaction = await new ScheduleCreateTransaction()
        .setScheduledTransaction(transferTx)
        .setScheduleMemo(scheduleMemo)
        .setAdminKey(treasuryAccountPrivateKey)
        .execute(treasuryAccountClient);

    //Get the receipt of the transaction
    const receipt = await scheduleTransaction.getReceipt(treasuryAccountClient);

    //Get the schedule ID
    const scheduleId = receipt.scheduleId;
    console.info("The schedule ID is " + scheduleId);

    //Get the scheduled transaction ID
    const scheduledTxId = receipt.scheduledTransactionId;
    console.info("The scheduled transaction ID is " + scheduledTxId);

    let result = { 'scheduledTxId': scheduledTxId.toString(), 'scheduleId': scheduleId.toString(), }
    // returning scheduleId
    return result;

}

//==============================================================================================================
// function to deleteSchedule 
//==============================================================================================================
async function deleteSchedule(scheduleId, treasuryAccountClient, treasuryAccountPrivateKey) {
    console.info("* * * * * * * * * * scheduled_transaction_service --> deleteSchedule START  * * * * * * * * * *  ");

    //Create the transaction and sign with the admin key
    const transaction = await new ScheduleDeleteTransaction()
        .setScheduleId(scheduleId)
        .freezeWith(treasuryAccountClient)
        .sign(treasuryAccountPrivateKey);

    //Sign with the operator key and submit to a Hedera network
    const txResponse = await transaction.execute(treasuryAccountClient);

    //Get the transaction receipt
    const receipt = await txResponse.getReceipt(treasuryAccountClient);

    //Get the transaction status
    const transactionStatus = receipt.status;

    //returning tranasaction status
    return transactionStatus.toString();
}

//==============================================================================================================
// function to getScheduleInfo 
//==============================================================================================================
async function getScheduleInfo(scheduleId, treasuryAccountClient) {
    console.info("* * * * * * * * * * scheduled_transaction_service --> getScheduleInfo START * * * * * * * * * *  ");

    //Create the query
    const query = new ScheduleInfoQuery().setScheduleId(scheduleId);

    //Sign with the client operator private key and submit the query request to a node in a Hedera network
    const info = await query.execute(treasuryAccountClient);
    console.log("ScheduledId: ", new ScheduleId(info.scheduleId).toString());
    console.log("Memo: ", info.scheduleMemo);
    console.log("CreatedBy: ", new AccountId(info.creatorAccountId).toString());
    console.log("PayedBy: ", new AccountId(info.payerAccountId).toString());
    console.log("The expiration time: ", new Timestamp(info.expirationTime).toDate());

    if (info.executed == null) {
        console.log("The transaction has not been executed yet.");
    } else {
        console.log("The time of execution of the scheduled tx is: ", new Timestamp(info.executed).toDate());
    }
}


async function executeScheduled(accountId, client, privateKey) {
    console.info("* * * * * * * * * * scheduled_transaction_service --> executeScheduled START * * * * * * * * * *  ");

    await new Transaction.fromAccountId(accountId).sign(privateKey);

    const executed = await txn.execute(client)

    return executed.getReceipt(client)
}

// invoking main method
main();