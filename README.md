# secure api implementation
Start the backend by running `npx tsx app.ts` while in the `./src` directory. You can see documentation for the api at `https://localhost:3000/api-docs` in a browser of your choice.

This is my first time using javascript/typescript to make a webserver. It's easy to see why many people use this to write webservers when the ecosystem is so mature and helpfull. express, prisma, express-validator, express-api-limiter, swagger, winston, they are all super easy to use and cut down on development time and cost.

I've done my best to follow SOC and other reasonable design patterns for code organisation. For example by only importing crypto, bcrypt and jsonwebtoken in `./crypto.ts` so you can be sure that all encryption, decryption and hashing occurs in those functions. Then again, I'm not aware of too many conventions and I might have broken some I'm not aware of.

# security considerations
I'm using simple integers for id's for the transactions and users. It could be more secure to use another method which hides the order of creation of users and transactions, but I opted for simple integers for it's simplicity and performance.

The encryption of transaction notes is done using each users public/private key. The private key is encrypted using the users password, so only they can read their notes. Even if the database is compromised the attacker will not be able to read these notes. The other fields can also be encrypted the same way.

I opted to force users to enter a password for each transaction. While annoying, it is for security. We don't want somebody to lose their money because they accidentally shared their jwt token. This is my attempt at guarding against CSRF attacks. CSRF attacks are only a problem if the fronted application automatically sends the authorization tokens to the request, so depending on the frontend this might be unnecessary. Nevertheless I think it's worth it.

The cert folder should not be in the repo, if it weren't for this being a exercise I would include `./cert/` in the `.gitignore`. Same goes for the `.env` file with the `JWT_SECRET` which should not be shown to anyone. `audit.log` should probably also be in the `.gitignore`.

# what I would improve with more time
Add a real way to pay money.

Api keys.

The audit logging system is very basic. A more fleshed audit log would have rules for each route where you can selectively hide and show certain data. To for example hide the jwt token and passwords but include the fact that the request succeded.

The amount field in transactions should be checked more thoroughly. But the focus is on security, not validity of transactions so I skipped this.

A balance field in the user model with encryption using the users public key so only they can see their money. I would need to buffer the received transactions in order for this to work since I cannot add to their balance unless I have their password.
