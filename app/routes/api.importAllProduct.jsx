import prisma from "../db.server";
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
    const url = new URL(request.url);
    const userId = parseInt(url.searchParams.get("user_id"), 10);
    if (isNaN(userId) ) {
        return json({ error: "user not valid." }, { status: 202 });
    }
    
    // Unblock all matching products

    await prisma.products.updateMany({
        where: {
            user_id: userId,
            block:0
        },
        data: {
            status: 'Import_in_progress'
        }
    });

  return json({ msg: "Products have been unblocked." }, { status: 202 });
};
