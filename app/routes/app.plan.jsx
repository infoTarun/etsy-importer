import {
  Page,
  Card,
  Text,
  Button,
  BlockStack,
  Grid,
  Box,
  Badge,
  Link
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { useState, useEffect } from "react";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop;
  return { shopDomain };
};

export default function plan() {
  const [plan, setPlan] = useState(0);
  useEffect(()=>{
       const userData = localStorage.getItem('userData')
        setPlan(userData.plan)
  },[])

  const plans = [
    {
      title: "Free Plan",
      price: "USD 0.00 /Month",
      features: [
        "✓ 10 Product Import",
        "✓ Manual Sync And Reimport",
        "✓ Import Amazon Reviews",
        "+ Auto Sync Service With  API",
        "+ Auto Sync Service Without  API",
        "+ Bulk Import",
        "+ Priority Customer Support"
      ]
    },
    {
      title: "Standard Plan",
      price: "USD $14.95 /Month",
      features: [
        "✓ Unlimited product import",
        "✓ Manual Sync And Reimport",
        "✓ Import Amazon Reviews",
        "+ Auto Sync Service With  API",
        "+ Auto Sync Service Without  API",
        "+ Bulk Import",
        "+ Priority Customer Support"
      ]
    },
    {
      title: "Premium Plan",
      price: "USD $29.95 /Month",
      features: [
        "✓ Unlimited product import",
        "✓ Manual Sync And Reimport",
        "✓ Import Amazon Reviews (Upto 1000 products)",
        "+ Auto Sync Service (Upto 1000 products)",
        "+ Bulk Import (Upto 1000 products)",
        "+ Priority Customer Support"
      ]
    },
    {
      title: "Ultimate Plan",
      price: "USD $49.95 /Month",
      badge: true,
      features: [
        "✓ Unlimited product import",
        "✓ Manual Sync And Reimport",
        "+ Auto Sync Service (2500 products)",
        "+ Bulk Import (2500 products)",
        "+ Priority Customer Support"
      ]
    }
  ];


  const handlePlanActive = async (planId) => {
    console.log("This is the plan id ",planId)
    const tempCode = localStorage.getItem("tempcode")
    if(!tempCode){
      shopify.toast.show(
        "Something went wrong, Please contact customer support.",
        {
          duration: 3000,
          isError:true
        },
      );
      return
    }
    const url = ``;
    window.open(url, '_blank');
  };
  

  useEffect(() => {
    const selectedPlan = localStorage.getItem("plans");
    if (selectedPlan !== null) {
      setPlan(Number(selectedPlan));
    }
  }, []);

  return (
    <Page fullWidth>
      <TitleBar title="Pricing Plans" />
      <Grid columns={{ xs: 1, sm: 2, md: 2, lg: 4 }} gap="400">
        {plans.map((p, index) => {
          const isActive = plan === index;
          const isUltimate = p.title === "Ultimate Plan";

          return (
            <Card
              key={index}
              padding="400"
              roundedAbove="sm"
              tone={isActive ? "success" : "primary"}
              border={isUltimate ? "base" : undefined}
              height="100%"
            >
              <BlockStack gap="300" align="center">
                <Box width="100%" textAlign="center">
                  <Text variant="headingMd" fontWeight="bold">
                    {isUltimate ? (
                      <Badge tone="attention">{p.title}</Badge>
                    ) : (
                      p.title
                    )}
                  </Text>
                  <Text fontWeight="bold" tone="success">
                    {p.price}
                  </Text>
                </Box>

                <BlockStack as="ul" gap="100" alignment="leading">
                  {p.features.map((f, i) => (
                    <Text as="li" key={i} fontSize="bodySm">
                      {f}
                    </Text>
                  ))}
                </BlockStack>

                <Box width="100%" textAlign="center" paddingBlockStart="300">
                  {isActive ? (
                    <Button tone="success" fullWidth disabled>
                      Activated
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="primary"
                      onClick={() => {
                        localStorage.setItem("plans", index);
                        setPlan(index);
                        handlePlanActive(index)
                      }}
                    >
                      Activate Now!
                    </Button>
                  )}
                </Box>
              </BlockStack>
            </Card>
          );
        })}
      </Grid>
    </Page>
  );
}
