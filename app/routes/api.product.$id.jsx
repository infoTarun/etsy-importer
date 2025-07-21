// File: app/routes/api.product.$id.jsx
import { json } from "@remix-run/node";
import { getProduct } from "./backend/products";
import prisma from "../db.server";
export const loader = async ({ params }) => {
  const productId = parseInt(params.id, 10);
  if (isNaN(productId)) {
    return json({ error: "Invalid product ID" }, { status: 400 });
  }
  const product =await  prisma.products.findFirst({
      where: {
        product_id:productId
      }
  });
  if (!product) {
    return json({ error: "Product not found" }, { status: 404 });
  }
  return json({ product });
};
