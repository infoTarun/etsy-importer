import prisma from "../db.server";
import { json } from "@remix-run/node";

export const loader = async ({params,request}) => {
  console.log(request);
  const url = new URL(request.url);

  const productId = parseInt(params.product_id, 10);
  const userId = parseInt(url.searchParams.get("user_id"), 10);

  if (isNaN(productId)) {
    return json({ error: "Invalid product ID" }, { status: 400 });
  }
  const productVariants = await prisma.product_variants.findMany({
      where: {
        product_id:productId,
        user_id:userId
      }
  });
  if (!productVariants) {
    return json({ error: "Product not found" }, { status: 404 });
  }
  return json({ productVariants });
};
