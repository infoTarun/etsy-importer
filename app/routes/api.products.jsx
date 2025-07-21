import { json } from "@remix-run/node";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  let orderByTitle = false;
  let orderBy = "desc";
  const userId = parseInt(url.searchParams.get("user_id"), 10);
  const status = url.searchParams.get("status");
  const query = url.searchParams.get("query");
  const order = url.searchParams.get("orderBy");
  const parPage = parseInt(url.searchParams.get("parPage"));
  const page = parseInt(url.searchParams.get('page'));
  let skip = parPage*(page-1);
  console.log("skip : ",skip);
  if (order === "Title asc" || order === "Title desc") {
    orderByTitle = true;
    orderBy = order === "Title asc" ? "asc" : "desc";
  }
  if (order === "Product desc" || order === "Product asc") {
    orderBy = order === "Product asc" ? "asc" : "desc";
  }
  const statusMap = {
    "already exist": "Already_Exist",
    "ready to import": "Ready_to_Import",
    "import in progress": "Import_in_progress",
    "imported": "Imported",
    "error": "error",
    "reimport in progress": "reimport_in_progress",
  };
  const normalizedStatus = status?.toLowerCase();
  const prismaStatus = normalizedStatus && normalizedStatus !== "all" ? statusMap[normalizedStatus] : undefined;
  const where = {
    user_id: userId,
    ...(prismaStatus && { status: prismaStatus }),
    ...(query && {
      title: {
        contains: query,
      },
    }),
  };

  // Get total count of matching products
  const totalCount = await prisma.products.count({ where });
  const totalProduct = await prisma.products.count({ 
    where:{
        user_id:userId
    }
   });



  // Get paginated products
  const products = await prisma.products.findMany({
    where,
    orderBy: [
      orderByTitle ? { title: orderBy } : { created_at: orderBy },
    ],
    select: {
      product_id: true,
      title: true,
      has_variation: true,
      status: true,
      shopifyproductid: true,
      etsylistingid: true,
      block: true,
      product_image_data: true,
    },
    skip:skip,
    take: parPage,
  });

//   if (!products.length) {
//     return json({ error: "Products not found" }, { status: 404 });
//   }

  return json({ products, totalCount,totalProduct });
};