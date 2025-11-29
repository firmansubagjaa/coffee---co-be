import { beforeEach } from "bun:test";
import { mock } from "bun:test";

// Mock Prisma
const prismaMock = {
  user: {
    findUnique: mock(),
    create: mock(),
    update: mock(),
    findMany: mock(),
  },
  product: {
    findMany: mock(),
    findUnique: mock(),
    create: mock(),
    update: mock(),
    delete: mock(),
  },
  productVariant: {
    createMany: mock(),
    deleteMany: mock(),
    update: mock(),
    findMany: mock(),
  },
  order: {
    create: mock(),
    findMany: mock(),
    update: mock(),
    findUnique: mock(),
  },
  orderItem: {
    createMany: mock(),
  },
  transaction: {
    create: mock(),
  },
  wishlist: {
    findUnique: mock(),
    create: mock(),
    delete: mock(),
    findMany: mock(),
  },
  review: {
    create: mock(),
    aggregate: mock(),
    findMany: mock(),
  },
  $transaction: mock((callback) => callback(prismaMock)),
};

// Mock the module
mock.module("../utils/prisma", () => ({
  prisma: prismaMock,
}));

export const mockPrisma = prismaMock;

beforeEach(() => {
  // Reset mocks before each test
  Object.values(prismaMock).forEach((model: any) => {
    Object.values(model).forEach((fn: any) => {
      if (fn.mock) fn.mockClear();
    });
  });
});
