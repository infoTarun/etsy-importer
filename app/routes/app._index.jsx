import { useEffect } from "react";
import {
  Page,
  Layout,
  Text,
  Card,
  CalloutCard,
  Banner,
  Listbox,
  BlockStack,
  Link,
  InlineStack,
  SkeletonBodyText,
  Image,
  Thumbnail,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useState } from "react";
import { useLoaderData, useNavigate, useNavigation, useParams } from "@remix-run/react";
import prisma from "../db.server"; // adjust path as needed
import { json } from "@remix-run/node";

export async function loader() {
  console.log("Loader function called111");

  const EtsyAccount = await prisma.users.findFirst({
    where: { id: 1 },
  });

  if (!EtsyAccount) {
    console.warn("No Etsy account found for user_id 1");
  }
  
  console.log("Fetched EtsyAccount:", EtsyAccount);
  return json({ data: EtsyAccount  });
}

export default function Index() {
  const { data } = useLoaderData();
  console.log("data  ",data);
  
  const navigate = useNavigate();
  const {tempcode} = useParams()
  const [loading, setLoading] = useState(false);
  const [skuConsumed, setSkuConsumed] = useState(0);
  const [skuLimit, setSkuLimit] = useState(10);
  const [plan, setPlan] = useState("Free");
  const [price, setPrice] = useState(0);
  const shopDomain = useLoaderData();

  useEffect(() => {
    localStorage.setItem('userData',JSON.stringify(data))
    if(data){
        // console.log("plan  ",data.plan);
      setPlan(data.plan)
      setSkuLimit(data.skulimit)
      setSkuConsumed(data.skuconsumed)

    }
    // const handleApiCall = async () => {
    //   setLoading(true);
    //   try {
    //     const response = await fetch(`/api/proxy`);
    //     const data = await response.json();

    //     if (data) {
    //       setSkuConsumed(data.user.skuconsumed);
    //       setSkuLimit(data.user.skulimit);
    //       const planMapping = {
    //         0: "Free",
    //         1: "Bronze",
    //         2: "Silver",
    //       };
    //       localStorage.setItem("plans", data.user.plan);
    //       setPlan(planMapping[data.user.plan] || "");
    //       setPrice(data.chargerequest.price);
    //       localStorage.setItem("token", data.token);
    //       localStorage.setItem("tempcode", "d9cbvEMZ9A"); //Need to change this tempcode
         
    //       // const skuConsumed1 = Number(skuConsumed);
    //       // const skuLimit1 = Number(skuLimit);
    //       // if (skuConsumed1 >= skuLimit1){
    //       //   console.log("if ")
    //       //   localStorage.setItem("skuLimit", "exceed");
    //       // }else{
    //       //   localStorage.removeItem("skuLimit");
    //       // }
    //     }
    //   } catch (error) {
    //     console.error("Error calling API:", error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // handleApiCall();
  }, []);

  const handleImageClick = () => {
    const url = "https://apps.shopify.com/partners/infoshore";
    window.open(url, "_blank");
  };

  const callBanner = (
    <Banner tone="info" title="Need a hand getting started?">
      <p>
        Book your free onboarding call and import your first product with ease!{" "}
        <a
          href="https://calendly.com/madhu-infoshore/30min"
          target="_blank"
          rel="noopener noreferrer"
        >
          Book Now.
        </a>
      </p>
    </Banner>
  );

  const warningBanner = (
    <Banner
      tone="critical"
      title={
        <>
          You’ve reached your import limit. To continue importing
          products,&nbsp;
          <Link url="/app/Plans">click here to upgrade your plan</Link>.
        </>
      }
    />
  );

  return (
    <Page>
      <TitleBar title="Dashboard" />
      {skuConsumed == 0 && <div style={{ marginBottom: 20 }}>{callBanner}</div>}

      {skuConsumed >= skuLimit && (
        <div style={{ marginBottom: 20 }}>{warningBanner}</div>
      )}

      {!loading && skuConsumed === 0 && (
        <div style={{ marginBottom: 20 }}>
          <Banner
            title={
              <>
                <Link to="/app/Products">Click here</Link> to import your first
                products to Shopify!
              </>
            }
            status="info"
          />
        </div>
      )}

      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Layout>
              <Layout.Section variant="oneThird">
                <Card>
                  {!loading ? (
                    <BlockStack gap="300">
                      <Text as="h2" variant="headingMd" tone={"subdued"}>
                        Etsy Products
                      </Text>
                      <BlockStack gap="300" inlineAlign="center">
                        <Text as="h1" variant="heading2xl">
                          {skuConsumed}
                        </Text>
                      </BlockStack>
                    </BlockStack>
                  ) : (
                    <SkeletonBodyText lines={4} />
                  )}
                </Card>
              </Layout.Section>
              <Layout.Section variant="oneThird">
                <Card>
                  {!loading ? (
                    <BlockStack gap="300">
                      <Text as="h2" variant="headingMd" tone={"subdued"}>
                         Shopify Products
                      </Text>
                      <BlockStack gap="300" inlineAlign="center">
                        <Text as="h1" variant="heading2xl">
                          10 {/*Need to make this dynamic*/}
                        </Text>
                      </BlockStack>
                    </BlockStack>
                  ) : (
                    <SkeletonBodyText lines={4} />
                  )}
                </Card>
              </Layout.Section>
              <Layout.Section variant="oneThird">
                <Card>
                  {!loading ? (
                    <BlockStack gap="300">
                      <Text as="h2" variant="headingMd" tone={"subdued"}>
                        Imported products
                      </Text>
                      <BlockStack gap="300" inlineAlign="center">
                        <Text as="h1" variant="heading2xl">
                          {skuLimit}
                        </Text>
                      </BlockStack>
                    </BlockStack>
                  ) : (
                    <SkeletonBodyText lines={4} />
                  )}
                </Card>
              </Layout.Section>
            </Layout>
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section>
            <Card>
              {!loading ? (
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Plan
                  </Text>
                  <Banner
                    status="success"
                    title={plan === "Free" ? "Free Plan" : "Paid Plan"}
                    tone={plan === "Free" ? "critical" : "success"}
                  ></Banner>
                  <BlockStack gap="200">
                    {[
                      { label: "Current Plan", value: plan },
                      {
                        label: "Pricing",
                        value: `$${plan === "Free" ? 0 : price}`,
                      },
                      { label: "Import Credit", value: skuLimit },
                      { label: "Import Consumed", value: skuConsumed },
                    ].map(({ label, value }) => (
                      <InlineStack key={label} align="space-between">
                        <Text as="span" variant="bodyMd">
                          {label}
                        </Text>
                        <Text
                          as="span"
                          variant="bodyMd"
                          tone={
                            label.includes("Consumed")
                              ? "caution"
                              : plan === "Free"
                                ? "critical"
                                : "caution"
                          }
                        >
                          {value}
                        </Text>
                      </InlineStack>
                    ))}
                  </BlockStack>
                </BlockStack>
              ) : (
                <SkeletonBodyText lines={9} />
              )}
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Image
                alt="Promotion"
                style={{
                  height: "auto",
                  maxHeight: "350px",
                  maxWidth: "721px",
                  minHeight: "210px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
                src="https://apps1.infoshore.biz/updateaac/Shopify-Etsy.png"
                onClick={handleImageClick}
              />
            </BlockStack>
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section variant="oneThird">
            <CalloutCard
              title="Import Product"
              illustration="https://apps1.infoshore.biz/updateaac/download.png"
              primaryAction={{
                content: "Import Product",
                onAction: () => navigate("/app/Products"),
              }}
            >
              <p>
                Preview and Import products into your Shopify store from etsy.
              </p>
            </CalloutCard>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <CalloutCard
              title="Settings"
              illustration="https://apps1.infoshore.biz/updateaac/setting.png"
              primaryAction={{
                content: "Manage Product",
                onAction: () => navigate("/app/ManageProducts"),
              }}
            >
              <p>
                View and manage all the configurations of tyour account and store.
              </p>
            </CalloutCard>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <CalloutCard
              title="Etsy Account"
              illustration="https://apps1.infoshore.biz/updateaac/etsy.png"
              primaryAction={{
                content: "Etsy Account",
                onAction: () => navigate("/app/AmazonAccount"),
              }}
            >
              <p>
                View and manage all your Etsy Associate tags and marketplaces
                here.
              </p>
            </CalloutCard>
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section>
            <Card>
              <div onClick={()=>(navigate("/app/FAQ"))} style={{cursor:"pointer"}}>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  FAQ(s)
                </Text>
                <Listbox accessibilityLabel="FAQ(s) List" autoSelection="NONE">
                  {[
                    "Just getting started? Here's how you can import your first product step-by-step—it’s super easy!",
                    "Want to save time? Find out how you can import multiple products all at once instead of one by one.",
                    "Wondering where your imported products go? Here’s how to quickly find and manage them after importing.",
                  ].map((faq, idx) => (
                    <Listbox.Option key={idx} value={`faq-${idx}`}>
                      {faq}
                    </Listbox.Option>
                  ))}
                </Listbox>
              </BlockStack>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
