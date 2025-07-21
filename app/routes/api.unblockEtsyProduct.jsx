import prisma from "../db.server";
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const userId = parseInt(url.searchParams.get("user_id"), 10);
  const productIdParam = url.searchParams.get("product_id");
  

  // Parse and validate
  const productIds = productIdParam
    ?.split(',')
    .map(id => parseInt(id.trim(), 10))
    .filter(id => !isNaN(id)) || [];

  if (isNaN(userId) || productIds.length === 0) {
    return json({ error: "Invalid user_id or product_id(s)" }, { status: 400 });
  }
console.log("productIds ",productIds);
  // Unblock all matching products
  await prisma.products.updateMany({
    where: {
      user_id: userId,
      product_id: { in: productIds }
    },
    data: {
      block: 0
    }
  });

  return json({ msg: "Products have been unblocked.", unblocked: productIds.length }, { status: 202 });
};
