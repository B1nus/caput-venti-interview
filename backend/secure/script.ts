import bcrypt from 'bcrypt';
import { PrismaClient } from './generated/prisma'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.delete({
    where: {
      email: "Alice",
    },
  });
  await prisma.user.create({
    data: {
      email: "Alice",
      password: await generate_password_hash("12345"),
    },
  });
  const users = await prisma.user.findMany()
  console.log(users)
  console.log(bcrypt.compareSync("12345", users[0].password));
}

async function generate_password_hash(password: String): String {
  const SALT_ROUNDS = 10;
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  const hashed = await bcrypt.hash(password, salt);

  return hashed;
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
