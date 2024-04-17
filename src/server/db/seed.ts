// TODO: Create a better one with more data

import { generateId, Scrypt } from "lucia";
import { db } from ".";
import { groupMembers, groupPosts, groups, users } from "./schema";
import { faker } from "@faker-js/faker";

const bobsId = generateId(21);
const bobsEmail = "bob@bob.com";
const alicesId = generateId(21);
const janesId = generateId(21);
const johnsId = generateId(21);
const jimsId = generateId(21);

const groupId = generateId(15);

const createUsers = async () => {
  await db.insert(users).values([
    {
      id: bobsId,
      email: bobsEmail,
      username: "bob",
      avatar: faker.image.avatar(),

      emailVerified: true,
      // TODO: use password length of at least 8 characters
      hashedPassword: await new Scrypt().hash("bob"),
    },
    {
      id: generateId(21),
      email: faker.internet.email(),
      username: "alice",
      avatar: faker.image.avatar(),
      emailVerified: true,
      hashedPassword: await new Scrypt().hash("alice"),
    },
    {
      id: generateId(21),
      email: faker.internet.email(),
      username: "john",
      avatar: faker.image.avatar(),
      emailVerified: true,
      hashedPassword: await new Scrypt().hash("john"),
    },
    {
      id: generateId(21),
      email: faker.internet.email(),
      username: "jane",
      avatar: faker.image.avatar(),
      emailVerified: true,
      hashedPassword: await new Scrypt().hash("jane"),
    },
    {
      id: generateId(21),
      email: faker.internet.email(),
      username: "jim",
      avatar: faker.image.avatar(),
      emailVerified: true,
      hashedPassword: await new Scrypt().hash("jim"),
    },
  ]);
};

const createGroupWithUsersAndPosts = async () => {
  // create a groups
  await db.insert(groups).values([
    {
      id: groupId,
      username: faker.internet.userName(),
      description: faker.lorem.sentence(),
      avatar: faker.image.avatar(),
    },
    // add more groups here
  ]);
  // add all the users to the group
  await db.insert(groupMembers).values([
    {
      id: generateId(15),
      userId: bobsId,
      groupId,
      role: "admin",
    },
    {
      id: generateId(15),
      userId: alicesId,
      groupId,
      role: "member",
    },
    {
      id: generateId(15),
      userId: johnsId,
      groupId,
      role: "member",
    },
    {
      id: generateId(15),
      userId: janesId,
      groupId,
      role: "member",
    },
    {
      id: generateId(15),
      userId: jimsId,
      groupId,
      role: "member",
    },
  ]);

  // add some posts to the group
  await db.insert(groupPosts).values([
    {
      content: faker.lorem.paragraph(),
      userId: bobsId,
      excerpt: faker.lorem.sentence(),
      groupId,
      id: generateId(15),
      title: faker.lorem.sentence(),
    },
    {
      content: faker.lorem.paragraph(),
      userId: alicesId,
      excerpt: faker.lorem.sentence(),
      groupId,
      id: generateId(15),
      title: faker.lorem.sentence(),
    },
    {
      content: faker.lorem.paragraph(),
      userId: johnsId,
      excerpt: faker.lorem.sentence(),
      groupId,
      id: generateId(15),
      title: faker.lorem.sentence(),
    },
    {
      content: faker.lorem.paragraph(),
      userId: janesId,
      excerpt: faker.lorem.sentence(),
      groupId,
      id: generateId(15),
      title: faker.lorem.sentence(),
    },
    {
      content: faker.lorem.paragraph(),
      userId: jimsId,
      excerpt: faker.lorem.sentence(),
      groupId,
      id: generateId(15),
      title: faker.lorem.sentence(),
    },
  ]);
};

export async function seed() {
  //TODO: remove all the data added by seed function before

  await createUsers();
  await createGroupWithUsersAndPosts();
}

void seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    console.log("Seeding done!");
    process.exit(0);
  });
