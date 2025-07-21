import {
  Tabs,
  TextField,
  Select,
  Page,
  BlockStack,
  Button,
  LegacyCard,
  Text,
  SkeletonBodyText,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback, useEffect } from "react";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { json } from "@remix-run/node";
import prisma from "../db.server"; // adjust path as needed


export async function loader() {
  console.log("Loader function called111");

  const EtsyAccount = await prisma.setting.findFirst({
    where: { user_id: 1 },
  });

  if (!EtsyAccount) {
    console.warn("No Etsy account found for user_id 1");
  }

  console.log("Fetched EtsyAccount:", EtsyAccount);
    return json({ data: EtsyAccount  });

}

export async function action({ request }) {
     console.log("Selected acco:");  
  const body = await request.formData();
 const EtsyAccount = "123"

  console.log("Selected account:", body);      
    await prisma.setting.update({
            where: {
                id: 1,
            },
            data: {
                inventory_sync: body.inv_sync === "disable" ? 0 : 1,
                price_sync: body.price_sync === "disable" ? 0 : 1,
                markupenabled: body.enablePriceMarkup,
                markuptype: body.markupType,
                markupval: body.markupValue

            },
            });
  return json({ data: EtsyAccount  });
}


export default function settings() {
  const data = useLoaderData();
//    console.log("data",data.data);
  
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    automatic_sku_creation: data.data.automatic_sku_creation || "Disable",
    enablePriceMarkup: data.data.markupenabled ? "enable" : "disable",
    thresholdinventory: data.data.thresholdinventory || "disable",
    thresholdquantityvalue: data.data.thresholdquantityvalue || 0,
    markupType: data.data.markuptype || "FIXED",
    markupValue: data.data.markupval || 0,
    // markupRoundOff: data.markupRoundOff,
    inventorySync: data.data.inventory_sync ? "enable" : "disable",
    // outOfStockAction: data.outOfStockAction,
    priceSync: data.data.price_sync ? "enable" : "disable",
  });
  const [selected, setSelected] = useState(0);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    handleGetSettings();
  }, []);

  const handleGetSettings = async () => {
    setLoadingData(false);
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch(`/api/getSettigns?token=${token}`);
        const data = await response.json();
        console.log("settings -> ", data.data);
        if (data.data) {
          setFormState({
            published:
              (data.data.published == 0 ? "Hidden" : "Published") ??
              "Published",
            defaultTags: data.data.tags ?? "",
            defaultVendor: data.data.vendor ?? "",
            defaultProductType: data.data.product_type ?? "",
            inventoryPolicy:
              (data.data.inventory_policy == 0 ? "no_track" : "track") ??
              "no_track",
            defaultQuantity: data.data.defquantity ?? 0,
            defaultCurrency: data.data.defaultCurrency ?? "USD",
            autoCurrencyConversion:
              (data.data.autoCurrencyConversion == 0 ? "Disable" : "Enable") ??
              "Disable",
            enablePriceMarkup:
              (data.data.markupenabled == 0 ? "disable" : "enable") ??
              "disable",
            markupType: data.data.markuptype ?? "FIXED",
            markupValue: data.data.markupval ?? 0,
            // markupRoundOff:
            //   (data.data.markupround == 0 ? "no_round" : "round_nearest") ??
            //   "no_round",
            inventorySync:
              (data.data.inventory_sync == 0 ? "disable" : "enable") ??
              "disable",
            // outOfStockAction: data.data.outofstock_action ?? "outofstock",
            priceSync:
              (data.data.price_sync == 0 ? "disable" : "enable") ?? "disable",
          });
        }
        setLoadingData(false);
      } catch (error) {
        setLoadingData(false);
        console.log("Something went wrong!");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    shopify.loading(true);
    setButtonLoading(true);
    try {
      console.log("Submitted Form Data:", formState);

      // Uncomment if sending to backend
      // const result = await response.json();
      const token = localStorage.getItem("token");

      const encodedData = encodeURIComponent(JSON.stringify(formState));
      const response = await fetch(
        `/api/saveSettings?token=${token}&data=${encodedData}`,
      );
      console.log("settings -> ", response);
      window.scrollTo({ top: 0, behavior: "smooth" });

      shopify.toast.show("Submitted Successfully", { duration: 1000 });

      // Give time for toast to display before navigating
      setTimeout(() => {
        //  navigate("/app");
      }, 1000);
    } catch (error) {
      console.error("Submission failed:", error);
      shopify.toast.show("Something went wrong", { duration: 3000 });
    } finally {
      // Stop loading and button state after a slight delay
      setTimeout(() => {
        shopify.loading(false);
        setButtonLoading(false);
      }, 1000);
    }
  };

  const handleChange = (field) => (value) => {
    // console.log("field-->> ",field)
    // console.log("value-->> ",value)
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  const autoCurrencyOptions = [
    { label: "Disable", value: "Disable" },
    { label: "Enable", value: "Enable" },
  ];



  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    [],
  );

  const tabs = [
     {
      id: "auto-sync-rules",
      content: "Auto Sync Rules",
      panelID: "auto-sync-content",
    },
    {
      id: "general-settings",
      content: "General Settings",
      panelID: "general-settings-content",
    },
  
   
  ];

  const renderPricingRulesForm = () => (
    <div
      style={{
        margin: "1%",
        padding: "1rem",
        borderRadius: "8px",
        backgroundColor: "#fbfbfb",
      }}
    >
      {loadingData ? (
        <SkeletonBodyText lines={15} />
      ) : (
        <BlockStack gap="400">
             <Select
            label="Automatic SKU Creation"
            options={autoCurrencyOptions}
            name="automatic_sku_creation"
            value={formState.automatic_sku_creation}
            onChange={handleChange("automatic_sku_creation")}
          />
          <Divider/>

            <Select
            label="Threshold Inventory"
            options={[
              { label: "Disable", value: "disable" },
              { label: "Enable", value: "enable" },
            ]}
            name="thresholdinventory"
            value={formState.thresholdinventory}
            onChange={handleChange("thresholdinventory")}
          />
          <TextField
            label="Threshold Quantity Value"
            name="thresholdquantityvalue"
            placeholder="Threshold Quantity Value"
            value={String(formState.thresholdquantityvalue)}
            onChange={handleChange("thresholdquantityvalue")}
            disabled={formState.thresholdinventory == "disable"}
          />

<Divider/>
          <Select
            label="Price Markup"
            options={[
              { label: "Disable", value: "disable" },
              { label: "Enable", value: "enable" },
            ]}
            name="enablePriceMarkup"
            value={formState.enablePriceMarkup}
            onChange={handleChange("enablePriceMarkup")}
          />

          <Select
            label="Markup Type"
            options={[
              { label: "Fixed Amount", value: "FIXED" },
              { label: "Percentage", value: "PERCEN" },
            ]}
            name="markupType"
            value={formState.markupType}
            onChange={handleChange("markupType")}
            disabled={formState.enablePriceMarkup == "disable" }
          />

          <TextField
            label="Markup Value"
            name="markupValue"
            placeholder="Enter markup value"
            value={String(formState.markupValue)}
            onChange={handleChange("markupValue")}
            disabled={formState.enablePriceMarkup == "disable"}
          />

          {/* <Select
            label="Markup Round Off"
            options={[
              { label: "Do not round off price", value: "no_round" },
              {
                label: "Round off to nearest whole number",
                value: "round_nearest",
              },
            ]}
            name="markupRoundOff"
            value={formState.markupRoundOff}
            onChange={handleChange("markupRoundOff")}
            disabled={formState.enablePriceMarkup == "disable"}
          /> */}

          {/* <Button submit variant="primary">
    Submit
  </Button> */}
        </BlockStack>
      )}
    </div>
  );
  const renderAutosyncForm = () => (
    <div
      style={{
        margin: "1%",
        padding: "1rem",
        borderRadius: "8px",
        backgroundColor: "#fbfbfb",
      }}
    >
      {loadingData ? (
        <SkeletonBodyText lines={15} />
      ) : (
        <BlockStack gap="400">
          <p style={{ color: "green", fontWeight: "bold" }}>
            These Settings Work In Auto Sync Which Runs Every 24 Hours.
          </p>

          <Select
            label="Inventory Synchronization"
            options={[
              { label: "Disable", value: "disable" },
              { label: "Enable", value: "enable" },
            ]}
            name="inventorySync"
            value={formState.inventorySync}
            onChange={handleChange("inventorySync")}
          />

          {/* <Select
            label="Out-Of-Stock Action"
            options={[
              {
                label: "Mark as Sold Out (Quantity = 0) on Shopify",
                value: "outofstock",
              },
              { label: "Unpublish Product from Shopify", value: "unpublish" },
              { label: "Delete Product from Shopify", value: "delete" },
            ]}
            name="outOfStockAction"
            value={formState.outOfStockAction}
            onChange={handleChange("outOfStockAction")}
          /> */}

          <Select
            label="Price Synchronization"
            options={[
              { label: "Disable", value: "disable" },
              { label: "Enable", value: "enable" },
            ]}
            name="priceSync"
            value={formState.priceSync}
            onChange={handleChange("priceSync")}
          />

          {/* <Button submit variant="primary">
          Submit
        </Button> */}
        </BlockStack>
      )}
    </div>
  );

  return (
    <Page>
      <TitleBar title="Settings" />
      <div style={{ marginBottom: "2%" }}>
        <BlockStack gap="400">
          <LegacyCard>
            <Tabs
              tabs={tabs}
              selected={selected}
              onSelect={handleTabChange}
              fitted
            />
            <Form method="put">
              {selected === 0 && renderAutosyncForm()}
              {selected === 1 && renderPricingRulesForm()}
              
              <Button
                loading={buttonLoading}
                variant="primary"
                fullWidth
                submit
              >
                Submit
              </Button>
            </Form>
          </LegacyCard>
        </BlockStack>
      </div>
    </Page>
  );
}
