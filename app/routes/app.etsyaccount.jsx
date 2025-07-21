import {
  Page,
  LegacyCard,
  TextField,
  Layout,
  Button,
  BlockStack,
  Text,
  SkeletonBodyText,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import prisma from "../db.server"; // adjust path as needed

export async function loader() {
  console.log("Loader function called111");

  const EtsyAccount = await prisma.etsy_keys.findFirst({
    where: { user_id: 1 },
  });

  if (!EtsyAccount) {
    console.warn("No Etsy account found for user_id 1");
  }

  console.log("Fetched EtsyAccount:", EtsyAccount);
  return json({ data: EtsyAccount  });
}

export default function Etsyaccount() {
  const navigate = useNavigate();
    const { data } = useLoaderData();
     console.log("etsyy  ",data);
  const [store, setStore] = useState(data?.store_name || "N/A");

  const [associateTagError, setAssociateTagError] = useState(false);

  const [buttonLoading, setButtonLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [formState, setFormState] = useState({
    associate_id: "",
    country: "amazon.com",
  });

  useEffect(() => {
    // handleGetAccountDetails();
  }, []);

  //   const handleGetAccountDetails = async () => {
  //     setDataLoading(true);
  //     shopify.loading(true);
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //       shopify.loading(false);
  //       setDataLoading(false);
  //       return;
  //     }
  //     try {
  //       const response = await fetch(`/api/getAmazonAccount?token=${token}`);
  //       const data = await response.json();
  //       if (data.data) {
  //         setFormState({
  //           associate_id: data.data.associate_id,
  //           country: data.data.country,
  //         });
  //       }
  //       setDataLoading(false);
  //       shopify.loading(false);
  //     } catch (error) {
  //       console.log("Something Went Wrong!");
  //       shopify.loading(false);
  //       setDataLoading(false);
  //     }
  //   };

  const handleChange = useCallback(
    (field) => (value) => {
      setFormState((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("handleSubmit");
    setButtonLoading(true);
    shopify.loading(true);

    if (!formState.associate_id.trim()) {
      setAssociateTagError(true);
      shopify.loading(false);
      setButtonLoading(false);
      return;
    }

    setAssociateTagError(false);
    const token = localStorage.getItem("token");
    if (!token) {
      setButtonLoading(false);
      shopify.loading(false);
      shopify.toast.show("Something went wrong!", {
        duration: 3000,
        isError: true,
      });
      return;
    }
    try {
      const response = await fetch(
        `/api/saveAmazonAccount?token=${token}&associate_id=${formState.associate_id.trim()}&country=${formState.country}`,
      );
      const data = await response.json();
      if (data.success) {
        shopify.toast.show("Submitted Successfully", { duration: 1000 });
        setTimeout(() => {
          // navigate("/app");
        }, 1500);
      } else {
        shopify.toast.show("Something went wrong!", {
          duration: 3000,
          isError: true,
        });
      }
      setButtonLoading(false);
      shopify.loading(false);
    } catch (error) {
      shopify.toast.show("Something went wrong!", {
        duration: 3000,
        isError: true,
      });
      console.log("Something Went Wrong!");
      shopify.loading(false);
    }
  };

  return (
    <Page>
      <TitleBar title="Etsy Account" />
      <div style={{ margin: "0 auto" }}>
        <BlockStack gap="400">
          <LegacyCard sectioned>
            <form onSubmit={handleSubmit}>
              <BlockStack gap="400">
                <Layout>
                  <Layout.Section variant="oneThird">
                    {!dataLoading ? (
                        <>
                     <Text as="p" variant="bodySm" tone="base">
                        Store Name
                    </Text>
                    <Text as="h2" variant="bodyLg" tone="bold">
                       {store}
                    </Text>
                    </>
                    ) : (
                      <SkeletonBodyText lines={3} />
                    )}
                  </Layout.Section>
               
                  <Layout.Section variant="oneThird">
                   <Button
                    variant="primary"
                    fullWidth
                    submit
                    loading={buttonLoading}
                    disabled={dataLoading ? true : false}
                    >
                        Reconfigure
                    </Button>
                  </Layout.Section>
                </Layout>

              </BlockStack>
            </form>
          </LegacyCard>
          <Text alignment="center" as="p" variant="bodySm" tone="subdued">
            Copyright © 2024 InfoShore Technology Solutions LLP. All rights
            reserved.
          </Text>
        </BlockStack>
      </div>
    </Page>
  );
}
