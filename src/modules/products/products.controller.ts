import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { ProductsService } from "./products.service";
import { createProductSchema, updateProductSchema } from "./products.dto";
import { roleGuard } from "../../middlewares/roleGuard";
import { apiResponse, apiNotFound } from "../../utils/response";

const products = new OpenAPIHono();

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// --- List Products ---
const listProductsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Products'],
  summary: 'List products',
  request: {
    query: z.object({
      page: z.string().optional().openapi({ example: "1" }),
      limit: z.string().optional().openapi({ example: "10" }),
      search: z.string().optional().openapi({ example: "latte" }),
      category: z.string().optional().openapi({ example: "coffee" }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'List of products',
    },
    404: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Products not found',
    },
  },
});

products.openapi(listProductsRoute, async (c: any) => {
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 10;
  const search = c.req.query("search");
  const category = c.req.query("category");

  const result = await ProductsService.getAllProducts(page, limit, search, category);
  
  if (!result.data || result.data.length === 0) {
    return apiNotFound(c, "Produk tidak tersedia");
  }

  return apiResponse(c, 200, "Products retrieved successfully", result);
});

// --- Get Product by ID ---
const getProductRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Products'],
  summary: 'Get product details',
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Product details',
    },
    404: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Product not found',
    },
  },
});

products.openapi(getProductRoute, async (c: any) => {
  const id = c.req.param("id");
  const product = await ProductsService.getProductById(id);
  
  if (!product) {
    return apiNotFound(c, "Produk tidak ditemukan");
  }

  return apiResponse(c, 200, "Product details", product);
});

// --- Create Product (Admin) ---
const createProductRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Products'],
  summary: 'Create new product',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createProductSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Product created',
    },
  },
});

products.openapi(createProductRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const data = c.req.valid("json");
  const product = await ProductsService.createProduct(data);
  return apiResponse(c, 201, "Product created successfully", product);
});

// --- Update Product (Admin) ---
const updateProductRoute = createRoute({
  method: 'put',
  path: '/{id}',
  tags: ['Products'],
  summary: 'Update product',
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: updateProductSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Product updated',
    },
  },
});

products.openapi(updateProductRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");
  const product = await ProductsService.updateProduct(id, data);
  return apiResponse(c, 200, "Product updated successfully", product);
});

// --- Delete Product (Admin) ---
const deleteProductRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Products'],
  summary: 'Delete product',
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Product deleted',
    },
  },
});

products.openapi(deleteProductRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const id = c.req.param("id");
  await ProductsService.deleteProduct(id);
  return apiResponse(c, 200, "Product deleted successfully");
});

export default products;
