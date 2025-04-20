For the purpose of this implementation, transactions are internal to the application and do not involve real card data. Therefore, banking details like card numbers or CVVs are neither handled nor stored.

I'm using simple integers for id's for the transactions and users. It could be more secure to use another method which hides the order of creation of users and transactions, but I opted for simple integers for it's simplicity and performance.

The encryption of transaction notes is done using each users public/private key. The private key is encrypted using the users password, so only they can read their notes. Even if the database is compromised they will not be able to read these notes. The other fields can also be encrypted the same way.

I opted to force users to enter a password for each transaction. While annoying, it is for security. We don't want somebody to lose their money because they accidentally shared their jwt token. This is my attempt at guarding against CSRF attacks. CSRF attacks are only a problem if the fronted application automatically sends the authorization tokens to the request. Which asking for a password would stop.

The amount field in transactions should be checked more thoroughly. But the focus is on security, not validity of transactions so I skipped this.

I've complied to separation of concern (SOC) by only importing crypto related libraries in src/crypto.ts. This means that you can be sure that no other file is messing with decryption and encryption other than using the exported functions.

The audit logging system is very basic. A more fleshed audit log would have rules for each route where you can selectively hide and show certain data. To for example hide the jwt token and passwords but include the fact that the request succeded.
