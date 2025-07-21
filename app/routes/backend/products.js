import prisma from '../../db.server';

export const getProduct = (product_id) => {
  const product =  prisma.products.findFirst({
      where: {
        product_id:product_id
      }
  });
  return product;
}
export const getProudctVariants =(product_id) =>{
  const product =  prisma.product_variants.findMany({
      where: {
        product_id:product_id
      }
  });
  return product;
}