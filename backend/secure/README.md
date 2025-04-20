For the purpose of this implementation, transactions are internal to the application and do not involve real card data. Therefore, banking details like card numbers or CVVs are neither handled nor stored.

I'm using simple integers for id's for the transactions and users. It could be more secure to use another method which hides the order of creation of users and transactions, but I opted for simple integers for it's simplicity and performance.

The encryption of transaction notes is done using each users public/private key. The private key is encrypted using the users password, so only they can read their notes. Even if the database is compromised they will not be able to read these notes. The amount and other field can also be encrypted the same way.

I opted to use a public/private key pair instead of the password directly so that users don't need to enter their password for each transaction. They only need to enter their password to see their notes.

I needed to use the public/private key pair method in order to let the receiver also see their notes. Since I don't know their password I cannot use it to encrypt their notes. So I use their public key instead.

The amount field in transactions should be checked more thoroughly. But the focus is on security, not validity of transactions so I skipped this.

I've tried to comply to separation of concern (SOC) by only importing crypto related libraries in src/crypto.ts. This means that you can be sure that no other file is messing with decryption and encryption other than using the exported functions.
