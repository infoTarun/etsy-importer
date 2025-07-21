import prisma from "../db.server";
import { json } from "@remix-run/node";

export const loader = async ({request}) => {
  console.log(request);
  const url = new URL(request.url);
  const userId = parseInt(url.searchParams.get("user_id"), 10);

    if (isNaN(userId)) {
        return json({ error: "Invalid product ID" }, { status: 400 });
    }
    const user = await prisma.users.findFirst({
        where: {
            id:userId,
        }
    });
    return json({ user}, { status: 202 });
};
