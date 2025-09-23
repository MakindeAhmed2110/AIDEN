/**
 * This script demonstrates how to create a new Hedera account on the testnet.
 * It generates a new private and public key pair, which serves as the user's "wallet,"
 * and then uses a pre-existing operator account to create and fund the new account.
 *
 * This example requires the @hashgraph/sdk package.
 * Install it with: `npm install @hashgraph/sdk`
 *
 * IMPORTANT:
 * Replace the placeholder values for OPERATOR_ID and OPERATOR_KEY with your own
 * testnet account ID and private key. These are necessary to sign and pay for
 * the transaction to create the new account.
 * You can get testnet account credentials from the Hedera Developer Portal.
 */

///
// Import necessary classes from the Hedera SDK

// Import dotenv to load environment variables from the .env file.
// The .js extension is required when importing from a local file,
// but for a package, the path to the config file is automatically resolved.
import 'dotenv/config';

// Import necessary classes from the Hedera SDK using ES module syntax.
import {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    Hbar
} from "@hashgraph/sdk";

async function createNewAccount() {
    try {
        // --- 1. SET UP THE CLIENT AND OPERATOR ACCOUNT ---
        // Your existing testnet account credentials from the .env file
        const myAccountId = process.env.OPERATOR_ID;
        const myPrivateKeyString = process.env.OPERATOR_KEY;

        // Check if operator credentials are set
        if (!myAccountId || !myPrivateKeyString) {
            throw new Error("Operator ID or private key is missing. Please set the OPERATOR_ID and OPERATOR_KEY variables in your .env file.");
        }

        // Convert the private key string into a PrivateKey object.
        const myPrivateKey = PrivateKey.fromStringECDSA(myPrivateKeyString);

        // Configure the Hedera client for the testnet
        const client = Client.forTestnet();
        client.setOperator(myAccountId, myPrivateKey);

        // --- 2. GENERATE A NEW KEY PAIR FOR THE NEW ACCOUNT ---
        // This is the core step for creating the user's "wallet"
        const newAccountPrivateKey = PrivateKey.generateECDSA();
        const newAccountPublicKey = newAccountPrivateKey.publicKey;

        console.log(`Generated new private key (raw hex): ${newAccountPrivateKey.toStringRaw()}`);
        console.log(`Generated new public key (raw hex): ${newAccountPublicKey.toStringRaw()}`);

        // --- 3. CREATE THE ACCOUNT CREATION TRANSACTION ---
        // Define the transaction to create a new account
        const transaction = new AccountCreateTransaction()
            .setKey(newAccountPublicKey) // Associate the new account with the new public key
            .setInitialBalance(new Hbar(1)); // Fund the new account with an initial balance of 1 Hbar

        // --- 4. SIGN AND EXECUTE THE TRANSACTION ---
        // Freeze the transaction for signing
        const signedTransaction = await transaction.freezeWith(client);

        // Sign the transaction with the operator's private key to pay for it
        const response = await signedTransaction.sign(myPrivateKey);

        // Submit the transaction to the Hedera network
        const txResponse = await response.execute(client);

        // Get the receipt of the transaction
        const receipt = await txResponse.getReceipt(client);

        // --- 5. GET THE NEW ACCOUNT ID AND CONFIRM ---
        const newAccountId = receipt.accountId;

        console.log("\nAccount creation successful!");
        console.log(`The new account ID is: ${newAccountId.toString()}`);
        console.log(`This new account is controlled by the private key: ${newAccountPrivateKey.toStringRaw()}`);

    } catch (error) {
        console.error("An error occurred during account creation:", error);
    }
}

// Call the function to start the process
createNewAccount();
