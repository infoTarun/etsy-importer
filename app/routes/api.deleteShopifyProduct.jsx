import prisma from "../db.server";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);
    const url = new URL(request.url);
    const userId = parseInt(url.searchParams.get("user_id"), 10);
    const productIdParam = url.searchParams.get("productId");

    if (isNaN(userId) || !productIdParam) {
      return json({ error: "Invalid user_id or productId(s)" }, { status: 400 });
    }

    const productIds = productIdParam
      .split(',')
      .map(id => parseInt(id.trim(), 10))
      .filter(id => !isNaN(id));

    if (productIds.length === 0) {
      return json({ error: "No valid product IDs provided" }, { status: 400 });
    }

    const results = [];

    for (const productId of productIds) {
      const product = await prisma.products.findFirst({
        where: {
          product_id: productId,
          user_id: userId
        },
      });

      if (!product || !product.shopifyproductid) {
        results.push({ productId, status: 'Skipped', reason: 'Product not found or missing shopifyproductid' });
        continue;
      }

      const shopifyId = product.shopifyproductid;

      try {
        const response = await admin.graphql(`
          mutation {
            productDelete(input: {id: "gid://shopify/Product/${shopifyId}"}) {
              deletedProductId
              userErrors {
                field
                message
              }
            }
          }
        `);

        const resultJson = await response.json();

        if (resultJson.data?.productDelete?.deletedProductId) {
          // Update in DB
          await prisma.products.update({
            where: {
              product_id_user_id: {
                user_id: userId,
                product_id: productId,
              },
              shopifyproductid: shopifyId,
            },
            data: {
              shopifyproductid: "",
              status: "Ready_to_Import"
            }
          });

          results.push({ productId, status: 'Deleted' });
        } else {
          const errorMsg = resultJson.data?.productDelete?.userErrors?.[0]?.message || "Unknown error";
          results.push({ productId, status: 'Failed', reason: errorMsg });
        }
      } catch (err) {
        results.push({ productId, status: 'Failed', reason: err.message });
      }
    }

    return json({ msg: "Delete operation completed.", results }, { status: 200 });

  } catch (error) {
    console.error("Bulk delete error:", error);
    return json({ msg: "Internal Server Error" }, { status: 500 });
  }
};
