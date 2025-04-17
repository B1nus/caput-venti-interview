import bcrypt from 'bcrypt';
import express from 'express';
import { check, validationResult } from 'express-validator';
import { PrismaClient } from './generated/prisma'

const prisma = new PrismaClient()

const app = express();
const port = 3000;

app.use(express.json());

const nameValidate = check('name')
  .notEmpty()
  .withMessage("Name must not be empty")
  .trim()
  .escape();
const passwordValidate = check('password')
  .isLength({ min: 8 })
  .withMessage('Password Must Be at Least 8 Characters')
  .matches('[0-9]')
  .withMessage('Password Must Contain a Number')
  .matches('[A-Z]')
  .withMessage('Password Must Contain an Uppercase Letter')
  .trim()
  .escape();

app.post('/register', [nameValidate, passwordValidate], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send(errors.array().map(x => x.msg).join('\n') + '\n');
  }

  const { name, password } = req.body;

  if (await getUser(name) != null) {
    res.send("Name already taken\n");
  } else {
    const hashed = bcrypt.hashSync(password, 12);
    await prisma.user.create({ data: { name, password: hashed } });
    res.send(`User ${name} successfully created\n`);
  }
});

app.post('/login', [nameValidate, passwordValidate], async (req, res) => {
  const errors = validationResult(req);

  const { name, password } = req.body;
  const user = errors.isEmpty() ? await getUser(name) : null;

  if (
      errors.isEmpty() &&
      user != null &&
      password != null &&
      await bcrypt.compareSync(password, user.password)
  ) {
    res.send(`Successfully logged in to user ${name}\n`);
  } else {
    res.send("Invalid credentials\n"); // Provide as little information as possible for security reasons
  }
});

// app.post('/unregister', []

// app.get('/transactions')

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

async function getUser(name: string): string {
  return await prisma.user.findUnique({ where: { name } });
}

