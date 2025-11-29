import { mock } from "bun:test";

// Mock Prisma Client
export const prismaMock = {
  user: {
    findUnique: mock(),
    findUniqueOrThrow: mock(),
    create: mock(),
    update: mock(),
  },
  refreshToken: {
    create: mock(),
    findUnique: mock(),
    delete: mock(),
  },
  product: {
    findMany: mock(),
    count: mock(),
    findUnique: mock(),
    create: mock(),
    update: mock(),
    delete: mock(),
  },
  productVariant: {
    updateMany: mock(),
    findUniqueOrThrow: mock(),
  },
  order: {
    create: mock(),
  },
  $transaction: mock((cb: any) => cb(prismaMock)),
};

// Mock module
mock.module("../utils/prisma", () => {
  return {
    prisma: prismaMock,
  };
});
