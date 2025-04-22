# secure api implementation
Start the backend by running `npx tsx app.ts` while in the `./src` directory. You can see documentation for the api at <https://localhost:3000/api-docs> in a browser of your choice.

This is my first time using javascript/typescript to make a webserver. It's easy to see why many people use this to write webservers when the ecosystem is so mature and helpful. express, prisma, express-validator, express-api-limiter, swagger, winston, they are all super easy to use and cut down on development time.

I've done my best to follow SOC and other reasonable design patterns for code organisation. For example by only importing crypto, bcrypt and jsonwebtoken in `./crypto.ts` so you can be sure that all encryption, decryption and hashing occurs in those functions.

# overview
- `prisma/schema.prisma`: The model for the database
- `cert`: Certificates for https. (should not be included in the repo in a real world scenario)
- `audiot.log`: The audit file with simple logging of all routes and when they are accessed
- `src/app.ts`: The executable program
- `src/crypto.ts`: Collection of functions to encrypt, decrypt and hash. The only place I import `crypto`, `becrypt` and `jsonwebtoken`
- `src/db.ts`: Where I import the prisma database
- `src/middleware/auth.ts`: Validator for passwords, names, jwt tokens and authenticator codes
- `src/middleware/json.ts`: Custom json validator for more graceful error handling
- `src/middleware/logger.ts`: Logger middleware, put before and routes you want to log
- `src/middleware/role.ts`: Role validator. Put it before ane routes you wan't to restrict along with the allowed roles
- `src/routes/admin.ts`: Admin routes
- `src/routes/api.ts`: Routes regarding api keys
- `src/routes/auth.ts`: Routes regarding authentication, registering and two-factor authentication
- `src/routes/transaction.ts`: Routes regarding transactions
- `src/routes/user.ts`: Routes regarding users

# security considerations
I'm using simple integers for id's for the transactions and users. It could be more secure to use another method which hides the order of creation of users and transactions, but I opted for simple integers for it's simplicity and performance.

The encryption of transaction notes is done using each users public/private key. The private key is encrypted using the users password, so only they can read their notes. Even if the database is compromised the attacker will not be able to read these notes. The other fields can also be encrypted the same way.

I opted to force users to enter a password for each transaction. While annoying, it is for security. We don't want somebody to lose their money because they accidentally shared their jwt token. This is my attempt at guarding against CSRF attacks. CSRF attacks are only a problem if the fronted application automatically sends the authorization tokens to the request, so depending on the frontend this might be unnecessary. Nevertheless I think it's worth it.

The cert folder should not be in the repo, if it weren't for this being a exercise I would include `./cert/` in the `.gitignore`. Same goes for the `.env` file with the `JWT_SECRET` which should not be shown to anyone. `audit.log` should also be in the `.gitignore`.

I'm only going to let normal users have api keys. The risks involved with an attacker gaining access to a admin api key is just too high. They would gain too many permissions.

I am unsure if my method for storing api keys is secure. I would assume it is safer to use an oauth, or adding a salt somehow. I was unable to find any conventional method other than oauth. Hopefully the ability to remove api keys and them expiring is enough for security.

I made sure to make all routes for operating on the api keys require a password. This way, somebody with a working api key cannot get more api key's for example.

The storage of one-time two-factor authentication codes is not very secure. I know there is a better way. I simply encrypt the one-time password with aes with a global secret stored in the `.env` file. An attacker with access to this secret and the database will be able to get any users authenticator codes. They won't be able to login with only two-factor authentication codes, but they are closer to gaining full access to a users account.

# what I would improve with more time
I would switch to MySQL instead of sqlite. Thanks to prisma that shouldn't be too hard.

More granular control over API keys so you can easily revokw acces to a specific route for a specific key for example.

A backup for 2FA if the user loses their phone.

More user routes.

Admin routes.

The audit logging system is very basic. A more fleshed audit log would have rules for each route where you can selectively hide and show certain data. To for example hide the jwt token and passwords but include the fact that the request succeded.

The amount field in transactions should be checked more thoroughly. But the focus is on security, not validity of transactions so I skipped this.

A balance field in the user model with encryption using the users public key so only they can see their money. I would need to buffer the received transactions in order for this to work since I cannot add to their balance unless I have their password.
