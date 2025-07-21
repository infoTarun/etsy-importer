import prisma from "../db.server";
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const userId = parseInt(url.searchParams.get("user_id"), 10);
  const productIdParam = url.searchParams.get("product_id");

  // Check if product_id is missing
  if (!productIdParam) {
    return json({ error: "Missing product_id parameter" }, { status: 400 });
  }

  // Convert to array of integers
  const productIds = productIdParam
    .split(',')
    .map(id => parseInt(id.trim(), 10))
    .filter(id => !isNaN(id));

  if (isNaN(userId) || productIds.length === 0) {
    return json({ error: "Invalid user_id or product_id(s)" }, { status: 400 });
  }

  // Update all matched products for the given user
  
  await prisma.products.updateMany({
    where: {
      user_id: userId,
      product_id: { in: productIds }
    },
    data: {
      block: 1
    }
  });

  return json({ msg: "Products have been blocked." }, { status: 202 });
};
