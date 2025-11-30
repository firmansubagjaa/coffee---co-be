import { prisma } from "../../utils/prisma";
import { CreateProductDTO, UpdateProductDTO } from "./products.dto";
import { Prisma } from "@prisma/client";

export const ProductsService = {
  async createProduct(data: CreateProductDTO) {
    // Nested write: Create Product + Variants in one go
    return await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        image: data.image,
        images: data.images,
        subDescriptions: data.subDescriptions,
        origin: data.origin,
        roastLevel: data.roastLevel,
        tastingNotes: data.tastingNotes,
        sizes: data.sizes,
        grindOptions: data.grindOptions,
        variants: {
          create: data.variants.map((v) => ({
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
          })),
        },
      },
      include: {
        variants: true,
      },
    });
  },

  async getAllProducts(page: number = 1, limit: number = 10, search?: string, category?: string) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.ProductWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(category && { category: category as any }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { variants: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getProductById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
  },

  async updateProduct(id: string, data: UpdateProductDTO) {
    // Transaction to handle product update and variants replacement
    const { variants, ...productData } = data;

    return await prisma.$transaction(async (tx) => {
      // 1. Update Product fields (only if there are fields to update)
      if (Object.keys(productData).length > 0) {
        await tx.product.update({
          where: { id },
          data: productData,
        });
      }

      // 2. Handle Variants (Strategy: Delete All & Re-create)
      // Only if variants array is explicitly provided in the update payload
      if (variants) {
        await tx.productVariant.deleteMany({
          where: { productId: id },
        });

        await tx.productVariant.createMany({
          data: variants.map((v) => ({
            productId: id,
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
          })),
        });
      }

      // 3. Return updated product with variants
      return await tx.product.findUnique({
        where: { id },
        include: { variants: true },
      });
    });
  },

  async deleteProduct(id: string) {
    return await prisma.product.delete({
      where: { id },
    });
  },
};
