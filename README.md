# Usage

Initializing a client can be done in different ways. During development when the BRID is likely to change all the time, 
then it is convenient to not have to specify BRID.

The client will then fetch the BRID from the chain with id 0. If you need a different chain, then you can specify that too.
```ts
import { BlockchainClient } from "simple-postchain";

// Initialize a client by Blockchain RID (BRID)
const client = BlockchainClient.initializeByBrid('http://127.0.0.1:7740', '898C57DA662CE388FDA9C2DACB1FEA2D983B3097E83FFD68F51E959B6A4BCD0B');

// Initialize a client by chainId
const client2 = BlockchainClient.initializeByBrid('http://127.0.0.1:7740', 1);

// Initialize without BRID or chainId
const client3 = BlockchainClient.initialize('http://127.0.0.1:7740');
```

Querying is done via BlockchainClient. You can add `0..*` parameters to the query.
```ts
const data = await client.query<string>()
    .name('say_hello')
    .addParameter('name', 'Viktor')
    .send();
```

Transactions are sent via the BlockchainClient as well.
Multiple operations can be added to the transaction, simply chain additional `addOperations`.
```ts
// A KeyPair is required to sign the transaction. 
// If you don't have one, it can be created with the client.
const user = client.createKeyPair();

await client
    .transaction()
    .addOperation('create_account', user1.publicKey)
    .sign(user)
    .send();
```

Each transaction must be unique, if you for some reason need to send an equal transaction again, you can add a `nop` operation.

```ts
await client
    .transaction()
    .addOperation('create_account', user1.publicKey)
    .addNop()
    .sign(user)
    .send();
```
