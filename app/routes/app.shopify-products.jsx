import { Page } from '@shopify/polaris'
import { InboundIcon } from '@shopify/polaris-icons'
import React, { useState } from 'react'

const ShopifyProduct = () => {
    const [fetchEtsyProductLoading,setFetchEtsyProductLoading] = useState(false);
    const fetchShopifyProduct = async()=>{
        
    }
    return (
        <Page title='Shopify Products'
        fullWidth={true}
        primaryAction={{
        content: "Fetch Shopify Products",
        onAction: fetchShopifyProduct,
        helpText: "Fetch Products From Your Shopify Store.",
        primary: true,
        loading:fetchEtsyProductLoading,
        icon: InboundIcon,
        }}
        >

        </Page>
    )
}

export default ShopifyProduct