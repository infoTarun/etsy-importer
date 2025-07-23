import prisma from "../db.server";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({request}) => {
  console.log(request);
  const url = new URL(request.url);
  const userId = parseInt(url.searchParams.get("user_id"), 10);

  const productId = parseInt(url.searchParams.get("product_id"), 10);
  if (isNaN(userId) || isNaN(productId)) {
    return json({ error: "Invalid product for Import" }, { status: 202 });
  }
  const userData = await prisma.users.findUnique({
    where:{
        id:userId
    }
  });
   if (!await userValidate(userData)) {
         return json({ msg: "user not valid." }, { status: 202 });
   }
  
    const product =await prisma.products.findFirst({
        where:{
            product_id:productId,
            user_id:userId
        },
        select: {
            title: true,
            has_variation: true,
            status: true,
            etsylistingid: true,
            block: true,
            option1name:true,
            option2name:true,
            option3name:true,
            variation_image_mapping:true,
            product_type:true,
            brand:true,
            tags:true,
            description:true,
            product_image_data: true,
            product_variants: true
        }
    });
    let productImage = JSON.parse(product.product_image_data);
    if (!product) {
         return json({ msg: "Product not found." }, { status: 202 });
    }
    // single variant 
    if (product.option1name == "") {
        const { admin } = await authenticate.admin(request);

        const queryProduct = `
        mutation CreateProduct($product: ProductCreateInput!,$media:[CreateMediaInput!]) {
            productCreate(product: $product,media:$media) {
                product {
                id
                title
                variants(first: 10) {
				nodes {
                        id
                        barcode
                        inventoryItem {
                            id
                        
                        }
                    }
				}
                options {
                    id
                    name
                    position
                    optionValues {
                    id
                    name
                    hasVariants
                    }
                }
                }
                userErrors {
                field
                message
                }
            }
            }`;
		let  status =  'ACTIVE' ;

        let productImages = JSON.parse(product.product_image_data);
        const media = productImages.map(img => ({
            mediaContentType: "IMAGE",
            originalSource: img.image_url.trim()
        }));
        let variables = {
        product: {
            title: product.title,
            productType: product.product_type,
            descriptionHtml: product.description,
            tags: product.tags,
            vendor: product.brand,
            status:status,
            // publishedAt: new Date().toISOString()
        },
        media:media
        };
        const response = await admin.graphql(queryProduct, { variables });
        const data = await response.json();
        if (data?.data?.productCreate?.product?.variants?.nodes?.[0]?.id) {
            const ProductVariant = product.product_variants;
            const shopifyProductId = data.data.productCreate.product.id;
            if (shopifyProductId) {
                const setting = await prisma.setting.findUnique({
                    where: { user_id: userId },
                });

                let publicationId = setting?.shopify_publication_id;

                if (!publicationId) {
                    const getPublicationsQuery = `
                    query {
                        publications(first: 5) {
                        edges {
                            node {
                            id
                            name
                            }
                        }
                        }
                    }`;

                    const pubRes = await admin.graphql(getPublicationsQuery);
                    const pubData = await pubRes.json();

                    const onlineStorePublication = pubData.data.publications.edges.find(
                    (edge) => edge.node.name === "Online Store"
                    );

                    if (!onlineStorePublication) {
                    console.error("❌ Online Store publication not found");
                    return;
                    }

                    publicationId = onlineStorePublication.node.id;

                    // Step 3: Save publicationId in DB for future use
                    await prisma.setting.update({
                    where: { user_id: userId },
                    data: { shopify_publication_id: publicationId },
                    });
                }

                // Step 4: Publish product
                const publishProductMutation = `
                    mutation PublishProduct($id: ID!, $input: [PublicationInput!]!) {
                    publishablePublish(id: $id, input: $input) {
                        userErrors {
                        field
                        message
                        }
                    }
                    }`;

                const publishResponse = await admin.graphql(publishProductMutation, {
                    variables: {
                    id: shopifyProductId,
                    input: [{ publicationId }],
                    },
                });

                const publishResult = await publishResponse.json();

                if (publishResult.data.publishablePublish.userErrors.length > 0) {
                    console.error("Publish Errors:", publishResult.data.publishablePublish.userErrors);
                } else {
                    console.log("✅ Product published to Online Store");
                }
            }

            console.log("Variant ID:", data.data.productCreate.product.variants.nodes[0].id);
            const  ProductVariantId = data.data.productCreate.product.variants.nodes[0].id;
            const weightUnit = convertWeightUnit(ProductVariant[0]['weight_unit']);
            const weight = ProductVariant[0]['weight'] ?? 0;
            const sku = ProductVariant[0]['sku'] ?? "";
            const price = ProductVariant[0]['price'];
            const quantity =  ProductVariant[0]['quantity'];
            const queryVariant = `
            mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                    product {
                        id
                    }
                    productVariants {
                        id
                        inventoryItem{
                            id
                            inventoryLevels(first:1){
                            nodes{
                                location{
                                id
                                }
                            }
                            }
                        }
                    }
                    userErrors {
                    field
                    message
                    }
                }
                }`;
            let variables = {
                productId: shopifyProductId,
                variants: [
                    {
                    id: ProductVariantId,
                    inventoryItem: {
                        measurement: {
                        weight: {
                            unit: weightUnit,
                            value: parseFloat(weight)
                        }
                        },
                        requiresShipping: true,
                        sku: sku,
                        tracked: true
                    },
                    inventoryPolicy: "DENY",
                    price: price, 
                    taxable: true
                    }
                ]
            };
            const responseVariant = await admin.graphql(queryVariant, { variables });
            const dataVariant = await responseVariant.json();
            const inventoryId = dataVariant.data.productVariantsBulkUpdate.productVariants[0].inventoryItem.id;
            const locationId = dataVariant.data.productVariantsBulkUpdate.productVariants[0].inventoryItem.inventoryLevels.nodes[0].location.id;
            const queryInventory = `
                mutation InventorySet($input: InventorySetQuantitiesInput!) {
                    inventorySetQuantities(input: $input) {
                        inventoryAdjustmentGroup {
                        createdAt
                        reason
                        referenceDocumentUri
                        changes {
                            name
                            delta
                        }
                        }
                        userErrors {
                        field
                        message
                        }
                    }
                    }`;
                 variables = {
                        input: {
                          ignoreCompareQuantity : true,
                            name: "available",
                            reason: "correction",
                            quantities: [
                            {
                                inventoryItemId: inventoryId,
                                locationId: locationId,
                                quantity: quantity,
                            }
                            ]
                        }
                    };
            const responseInventory = await admin.graphql(queryInventory, { variables });
            const dataInventory = await responseInventory.json();
            const updateProduct = await prisma.products.update({
                where: {
                product_id_user_id: {
                product_id: productId,
                user_id: userId,
                }
            },
                data: {
                    status: "Imported",
                    shopifyproductid:shopifyProductId.replace("gid://shopify/Product/", ""),
                },
            });
        
            const updateVariant = await prisma.product_variants.update({
                where: {
                   id_user_id: {
                        id: ProductVariant[0].id,
                        user_id:userId
                    }
                },
                data: {
                    status: "Imported",
                    shopifyproductid: shopifyProductId.replace("gid://shopify/Product/", ""),
                    shopifyvariantid: ProductVariantId.replace("gid://shopify/ProductVariant/", ""),
                    shopifyinventoryid: inventoryId.replace("gid://shopify/InventoryItem/", ""),
                    shopifylocationid: locationId.replace("gid://shopify/Location/", ""),
                }
                });
            return json({ msg: "Product has been imported." }, { status: 200 });

        }
    }else{
        let variation_image_mapping = JSON.parse(product.variation_image_mapping);
        const product_variants = product.product_variants;
        let option1Name =  product.option1name;
        let option2Name =  product.option2name;
        console.log("option2Name ",option2Name);
        let variantNew;
        let productOption = [];
        let firstVariant;
        let count = 0;
        let option1  = [];
        let option2 = [] ;
        let variantVariables = [];
        let updateDatabase = [];
        let variantMedia = [];
        let firstImage = '';

        for (const variant of product_variants) {
            let variantOption = [];
            const weightUnit = convertWeightUnit(variant.weight_unit);
            const weight = variant.weight ?? 0;
            const sku = variant.sku ?? "";
            const price = variant.price ;
            const quantity =  variant.quantity;
            const  barcode  = variant.barcode;
            let variantImageId = "";
            let variantImage = '';

            count++;
            if (variant.option1val) {
                option1.push({ name: variant.option1val });
                variantOption.push({name:variant.option1val,optionName:option1Name});
            }
            if (variant.option2val) {
                option2.push({ name: variant.option2val });
                variantOption.push({name:variant.option2val,optionName:option2Name});
            }
            if (count == 1) {
                firstVariant = variant;
                if (variation_image_mapping.length > 0) {
                    for(const imageMap of variation_image_mapping){
                        if (variant.option1val == imageMap.value || variant.option2val == imageMap.value) {
                            firstImage = imageMap.image_url;
                            break;
                        }
                    }
                }
            }else{
                if (variation_image_mapping.length > 0) {
                    for(const imageMap of variation_image_mapping){
                        if (variant.option1val == imageMap.value || variant.option2val == imageMap.value) {
                            variantImage = imageMap.image_url;
                            break;
                        }
                    }
                }
                if (variantImage !== '') {
                    variantMedia.push({mediaContentType:"IMAGE",originalSource:variantImage});
                    variantNew = {
                        optionValues:variantOption,
                        price:price,
                        inventoryQuantities:{
                            availableQuantity:quantity,
                            locationId:""
                        },
                        barcode:barcode,
                        inventoryItem: {
                            measurement: {
                            weight: {
                                unit: weightUnit,
                                value: parseFloat(weight)
                            }
                            },
                            requiresShipping: true,
                            sku: sku,
                            tracked: true
                        },
                        inventoryPolicy: "DENY",
                        mediaSrc:variantImage
                    };
                }else{
                    variantNew = {
                        optionValues:variantOption,
                        price:price,
                        inventoryQuantities:{
                            availableQuantity:quantity,
                            locationId:""
                        },
                        barcode:barcode,
                        inventoryItem: {
                            measurement: {
                            weight: {
                                unit: weightUnit,
                                value: parseFloat(weight)
                            }
                            },
                            requiresShipping: true,
                            sku: sku,
                            tracked: true
                        },
                        inventoryPolicy: "DENY",
                    };
                }
                variantVariables.push(variantNew);
            }
        }
        if (option2Name !== undefined && option2Name !== "") {
            const uniqueOptions1 = [];
            const uniqueOptions2 = [];

            const nameSet1 = new Set();
            const nameSet2 = new Set();

            for (const opt of option1) {
                if (!nameSet1.has(opt.name)) {
                    nameSet1.add(opt.name);
                    uniqueOptions1.push({ name: opt.name });
                }
            }
            for (const opt of option2) {
                if (!nameSet1.has(opt.name)) {
                    nameSet1.add(opt.name);
                    uniqueOptions2.push({ name: opt.name });
                }
            }

            productOption.push({ name: option1Name,values:uniqueOptions1 });
            productOption.push({ name: option2Name,values:uniqueOptions2 });
        }else{
            const uniqueOptions1 = [];

            const nameSet1 = new Set();

            for (const opt of option1) {
                if (!nameSet1.has(opt.name)) {
                    nameSet1.add(opt.name);
                    uniqueOptions1.push({ name: opt.name });
                }
            }
            productOption.push({ name: option1Name,values:uniqueOptions1 });
        }
        const { admin } = await authenticate.admin(request);
        const queryProduct = `
        mutation CreateProduct($product: ProductCreateInput!,$media:[CreateMediaInput!]) {
            productCreate(product: $product,media:$media) {
                product {
                id
                title
                variants(first: 10) {
				nodes {
                        id
                        barcode
                        inventoryItem {
                            id
                        
                        }
                    }
				}
                options {
                    id
                    name
                    position
                    optionValues {
                    id
                    name
                    hasVariants
                    }
                }
                }
                userErrors {
                field
                message
                }
            }
            }`;
        let  status =  'ACTIVE' ;
        let productImages = JSON.parse(product.product_image_data);
        let  media = [];
        for (const img of productImages) {
            let isMapped = false;
            if (variation_image_mapping.length > 0) {
                for (const imageMap of variation_image_mapping) {
                    if (img.listing_image_id == imageMap.image_id) {
                        isMapped = true;
                        break; 
                    }
                }
            }
            if (!isMapped) {
                media.push({
                    mediaContentType: "IMAGE",
                    originalSource: img.image_url.trim()
                });
            }
        }
        let variables = {
            product: {
                title: product.title,
                productType: product.product_type,
                descriptionHtml: product.description,
                tags: product.tags,
                vendor: product.brand,
                status:status,
                productOptions:productOption,
                // publishedAt: new Date().toISOString()
            },
            media:media
        };

        const response = await admin.graphql(queryProduct, { variables });
        const data = await response.json();
        if(data?.data?.productCreate?.product?.variants?.nodes?.[0]?.id){
            const shopifyProductId = data.data.productCreate.product.id;
            if (shopifyProductId) {
                const setting = await prisma.setting.findUnique({
                    where: { user_id: userId },
                });

                let publicationId = setting?.shopify_publication_id;

                if (!publicationId) {
                    const getPublicationsQuery = `
                    query {
                        publications(first: 5) {
                        edges {
                            node {
                            id
                            name
                            }
                        }
                        }
                    }`;

                    const pubRes = await admin.graphql(getPublicationsQuery);
                    const pubData = await pubRes.json();

                    const onlineStorePublication = pubData.data.publications.edges.find(
                    (edge) => edge.node.name === "Online Store"
                    );

                    if (!onlineStorePublication) {
                    console.error("❌ Online Store publication not found");
                    return;
                    }

                    publicationId = onlineStorePublication.node.id;

                    // Step 3: Save publicationId in DB for future use
                    await prisma.setting.update({
                    where: { user_id: userId },
                    data: { shopify_publication_id: publicationId },
                    });
                }

                // Step 4: Publish product
                const publishProductMutation = `
                    mutation PublishProduct($id: ID!, $input: [PublicationInput!]!) {
                    publishablePublish(id: $id, input: $input) {
                        userErrors {
                        field
                        message
                        }
                    }
                    }`;

                const publishResponse = await admin.graphql(publishProductMutation, {
                    variables: {
                    id: shopifyProductId,
                    input: [{ publicationId }],
                    },
                });

                const publishResult = await publishResponse.json();

                if (publishResult.data.publishablePublish.userErrors.length > 0) {
                    console.error("Publish Errors:", publishResult.data.publishablePublish.userErrors);
                } else {
                    console.log("✅ Product published to Online Store");
                }
            }
            console.log("Variant ID:", data.data.productCreate.product.variants.nodes[0].id);
            const  ProductVariantId = data.data.productCreate.product.variants.nodes[0].id;
            const updateProduct = await prisma.products.update({
                    where: {
                    product_id_user_id: {
                    product_id: productId,
                    user_id: userId,
                    }
                },
                data: {
                    status: "Imported",
                    shopifyproductid:shopifyProductId.replace("gid://shopify/Product/", ""),
                },
            });
            const weightUnit = convertWeightUnit(firstVariant.weight_unit);
            const weight = firstVariant.weight ?? 0;
            const sku = firstVariant.sku ?? "";
            const price = firstVariant.price ;
            const quantity =  firstVariant.quantity;
            const barcode = firstVariant.barcode;

            // now update default variant data 
            const queryVariant = `
                mutation productVariantsBulkUpdate($media:[CreateMediaInput!],$productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                    productVariantsBulkUpdate(media: $media,productId: $productId, variants: $variants) {
                        product {
                            id
                        }
                        productVariants {
                            id
                            inventoryItem{
                                id
                                inventoryLevels(first:1){
                                nodes{
                                    location{
                                      id
                                    }
                                }
                                }
                            }
                        }
                      
                        userErrors {
                        field
                        message
                        }
                    }
                    }`;
            
            if (firstImage !== "") {
                variables = {
                    media:[{mediaContentType:"IMAGE",originalSource:firstImage}],
                    productId: shopifyProductId,
                    variants: [
                        {
                        id: ProductVariantId,
                        inventoryItem: {
                            measurement: {
                            weight: {
                                unit: weightUnit,
                                value: parseFloat(weight)
                            }
                            },
                            requiresShipping: true,
                            sku: sku,
                            tracked: true
                        },
                        inventoryPolicy: "DENY",
                        price: price, 
                        taxable: true,
                        mediaSrc:firstImage
                        }
                    ]
                };
            }else{
                variables = {
                    productId: shopifyProductId,
                    variants: [
                        {
                        id: ProductVariantId,
                        inventoryItem: {
                            measurement: {
                            weight: {
                                unit: weightUnit,
                                value: parseFloat(weight)
                            }
                            },
                            requiresShipping: true,
                            sku: sku,
                            tracked: true
                        },
                        inventoryPolicy: "DENY",
                        price: price, 
                        taxable: true
                        }
                    ]
                };
            }
            const responseVariantUpdate = await admin.graphql(queryVariant, { variables });
            const dataVariant = await responseVariantUpdate.json();
            const inventoryId = dataVariant.data.productVariantsBulkUpdate.productVariants[0].inventoryItem.id;
            const locationId = dataVariant.data.productVariantsBulkUpdate.productVariants[0].inventoryItem.inventoryLevels.nodes[0].location.id;
            const updatedVariants = variantVariables.map(variant => ({
               ...variant,
                inventoryQuantities: {
                    ...variant.inventoryQuantities,
                    locationId: locationId
                }
            }));
            const queryInventory = `
            mutation InventorySet($input: InventorySetQuantitiesInput!) {
                inventorySetQuantities(input: $input) {
                    inventoryAdjustmentGroup {
                    createdAt
                    reason
                    referenceDocumentUri
                    changes {
                        name
                        delta
                    }
                    }
                    userErrors {
                    field
                    message
                    }
                }
                }`;

            variables = {
                input: {
                    ignoreCompareQuantity : true,
                    name: "available",
                    reason: "correction",
                    quantities: [
                        {
                            inventoryItemId: inventoryId,
                            locationId: locationId,
                            quantity: quantity,
                        }
                    ]
                }
            };

            const updateVariant = await prisma.product_variants.update({
                where: {
                    id_user_id: {
                        id: firstVariant.id,
                        user_id:userId
                    }
                },
                data: {
                    status: "Imported",
                    shopifyproductid: shopifyProductId.replace("gid://shopify/Product/", ""),
                    shopifyvariantid: ProductVariantId.replace("gid://shopify/ProductVariant/", ""),
                    shopifyinventoryid: inventoryId.replace("gid://shopify/InventoryItem/", ""),
                    shopifylocationid: locationId.replace("gid://shopify/Location/", ""),
                }
            });

            const responseInventory = await admin.graphql(queryInventory, { variables });
            const dataInventory = await responseInventory.json();

            // now create other variants 
            const queryVariantCreate = `
            mutation ProductVariantsCreate($media: [CreateMediaInput!],$productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                productVariantsBulkCreate(media: $media,productId: $productId, variants: $variants) {
                    productVariants {
                    id
                     inventoryItem{
                        id
                        inventoryLevels(first:1){
                            nodes{
                                location{
                                    id
                                }
                            }
                        }
                    }
                    selectedOptions {
                            name
                            value
                        }
                    }
                    userErrors {
                        field
                        message
                    }
                }
                }
            `;
            if (variantMedia.length > 0 && variantMedia[0].originalSource != null) {
                variables = {
                    media:variantMedia,
                    productId:shopifyProductId,
                    variants:updatedVariants
                } ;
            }else{
                variables = {
                    productId:shopifyProductId,
                    variants:updatedVariants
                } ;
            }
            const responseVariant = await admin.graphql(queryVariantCreate, { variables });
            const dataVariantCreate = await responseVariant.json();
            for (const createdVariant of dataVariantCreate.data.productVariantsBulkCreate.productVariants){
                let option1val = '';
                let option2val = '';

                if (
                createdVariant?.selectedOptions &&
                createdVariant.selectedOptions.length > 0 &&
                createdVariant.selectedOptions[0]?.value
                ) {
                option1val = createdVariant.selectedOptions[0].value;
                }

                if (
                createdVariant?.selectedOptions &&
                createdVariant.selectedOptions.length > 0 &&
                createdVariant.selectedOptions[1]?.value
                ) {
                option2val = createdVariant.selectedOptions[1].value;
                }
                await prisma.product_variants.updateMany({
                    where: {
                        option1val: option1val,
                        option2val: option2val,
                        product_id: productId,
                        user_id: userId
                    },
                    data: {
                        status: "Imported",
                        shopifyproductid: shopifyProductId.replace("gid://shopify/Product/", ""),
                        shopifyvariantid: createdVariant.id.replace("gid://shopify/ProductVariant/", ""),
                        shopifyinventoryid: createdVariant.inventoryItem.id.replace("gid://shopify/InventoryItem/", ""),
                        shopifylocationid: locationId.replace("gid://shopify/Location/", "")
                    }
                });
            }
            return json({ msg: "Product has been Import." ,shopifyproductid:shopifyProductId.replace("gid://shopify/Product/", "")}, { status: 202 });
        }
        return {data}
    }
    return json({ msg: "Product has been Import." ,proudct:product}, { status: 202 });
};


function convertWeightUnit(weight){
    switch (weight) {
        case "oz":
            return "OUNCES";
         case "g":
            return "GRAMS";
        case "kg":
            return "KILOGRAMS";
        case "lb":
            return "POUNDS";
        default:
            return "KILOGRAMS";
    }
}

async function userValidate(userData){
    console.log('user data userValidate    ',userData);
    if (userData.skuconsumed >= userData.skulimit) {
        console.log("return false");
        
        return false;
    }
    let  newSkuconsumed = userData.skuconsumed + 1;
    await prisma.users.update({
        where:{
            id:userData.id,
        },
        data:{
            skuconsumed:newSkuconsumed
        }
    });
    return true;
    
}