import prisma from "../db.server";
import { json } from "@remix-run/node";

export const loader = async ({request}) => {
  console.log(request);
  const url = new URL(request.url);
  const userId = parseInt(url.searchParams.get("user_id"), 10);

  if (isNaN(userId)) {
    return json({ error: "Invalid product ID" }, { status: 400 });
  }
  const etsy_request = await prisma.etsy_requests.findFirst({
      where: {
        user_id:userId,
        status:'pending'
      }
  });
  if (etsy_request) {
    return json({ error: "Etsy fetch request is already in progress." }, { status: 202 });
  }
  const etsyRequest = await prisma.etsy_requests.create({
  data: {
    status: 'pending',
    user_id: userId,
    inprocess:false
  },
})
    return json({ msg: "Etsy fetch request submited successfully." }, { status: 202 });
};
