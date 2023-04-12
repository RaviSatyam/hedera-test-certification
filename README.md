# Ravi-Hedera-Final

This Node.js app provides scripts for Hedera Hashgraph network interaction, including account actions, token management, multi-signature transactions, scheduling, and smart contract interaction.

## Getting Started

### Prerequisites

- Node.js
- Hedera Hashgraph account
- Hedera Hashgraph Testnet account (for testing)

### Installation

- Clone this repository or download the code as a zip file.
`git clone https://github.com/RaviSatyam/hedera-test-certification`
- Go to the `hedera-test-certification` directory: `cd hedera-test-certification`
- Install dependencies by running `npm install`.
- Create a `.env` file in the root directory of the project and add your Hedera Hashgraph account details.
- Run the scripts by executing `npm run <script-name>` (replace `<script-name>` with the name of the script you want to execute).

## Usage

To use this application, you'll need to have Node.js and the @hashgraph/sdk and dotenv modules installed. Once you have those dependencies installed, you can clone this repository and run the scripts using the `npm run` command.

Here are the available scripts:

### Account Scripts

- `npm run createAccount`: This script will use to create 5 new accounts and query the balances.

### Fungible Token Scripts

- `npm run token_script1`: This script will create create Fungible Token belonging to Account 1
- `npm run token_script2`: This script functions by associating tokens with the receipient account

- `npm run token_script3`: This script will swap token against Hbar
 
### Smart Contract Scripts

- `npm run createContract`:  call "function1" with the parameters 5 and 6. Gather the result and display it in the output. And then delete the smart contract.

### Scheduled Transactions Scripts

- `npm run scheduleTx`: This script will run the solution for the schedule Transaction problem


### Multi-Signature Scripts

- `npm run multiSign`: The script will run the solution for the multi signature problem

### Consensus Scripts

- `npm run consensus`: This script will be utilized for the purpose of creating and subscribing to a topic, as well as for submitting a message to the subscribed topic.



## License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

## Author

Ravi Satyam
ravi.satyam@hcl.com