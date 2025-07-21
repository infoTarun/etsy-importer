import { useEffect, useState, useCallback } from "react";
import {
    Page,
    Layout,
    Text,
    Card,
    BlockStack,
    InlineStack,
    Icon,
    Select,
    RadioButton,
    Button,
    ProgressBar,
    Box,
    Toast,
    Frame,
    SkeletonBodyText,
    Banner
} from "@shopify/polaris";
import { StatusActiveIcon, AlertCircleIcon } from "@shopify/polaris-icons";
import { useLoaderData, Form } from "@remix-run/react";
import prisma from "../db.server"; // adjust path as needed
import { json } from "@remix-run/node";

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

export async function action({ request }) {
  const body = await request.formData();
 const EtsyAccount = "123"
const selectedOption = body.get("accounts");
  console.log("Selected account:", selectedOption);      
let optionValue;
        let inv_sync = 0;
        let price_sync = 0;
        switch (selectedOption) {
            case "disabled1":
                optionValue = "Both Inventory & Price sync enabled";
                inv_sync = 1
                price_sync = 1
                break;
            case "disabled2":
                optionValue = "Inventory sync only enabled";
                inv_sync = 1
                break;
            case "disabled3":
                optionValue = "Price sync only enabled";
                price_sync = 1
                break;
            case "disabled4":
                optionValue = "No sync enabled";
                break;
            default:
                console.log("No option selected");
        }
        console.log(optionValue);
        await prisma.setting.update({
        where: {
            id: 1,
        },
        data: {
            inventory_sync: inv_sync,
            price_sync: price_sync,
        },
        });
  return json({ data: EtsyAccount  });
}

export default function setup() {
    const { data } = useLoaderData();
    // console.log("data  ",data);

    const [siteID, setSiteID] = useState("0"); 
    const [setupStepDone, setSetupStepDone] = useState(false);
    const [eBayAccountConnect, setEBayAccountConnect] = useState(false);
    const [progressBarText, setProgressBarText] = useState("0 of 2 Task completed");
    const [progressBarValue, setProgressBarValue] = useState("0");
    const [syncOption, setSyncOption] = useState(false);
    const [selectedOption, setSelectedOption] = useState("disabled1");  // Set a default selection
    const [setupStep, setSetupStep] = useState("1");
    const [loading, setLoading] = useState(true);
    const [activeToast, setActiveToast] = useState(false);
    const [activeToast2, setActiveToast2] = useState(false);
    const [content, setContent] = useState("eBay account connected");
    const [content2, setContent2] = useState("Settings saved successfully");
    const [userId, setUserId] = useState(0);
    const [loadingButton, setloadingButton] = useState(false);
    const toggleActive = useCallback(() => setActiveToast((activeToast) => !activeToast), []);
    const toggleActive2 = useCallback(() => setActiveToast2((activeToast2) => !activeToast2), []);
     const toastMarkup = activeToast ? (
            <Toast content={content} onDismiss={toggleActive} />
        ) : null;
        const toastMarkup2 = activeToast2 ? (
            <Toast content={content2} onDismiss={toggleActive2} />
        ) : null;
        useEffect(()=>{
            if(data && data?.active){
                setEBayAccountConnect(false)
                setProgressBarText("1 of 2 Task completed")
                setProgressBarValue("50")
                shopify.toast.show("Etsy account connected", {
                    duration: 2000,
                });
            }
            setLoading(false)
        },[])
    //      useEffect(() => {
    //     setLoading(true)
    //     const fetchDataAndInitialize = async () => {
    //         try {
    //             // Fetch from API
    //             let tempcode = localStorage.getItem("tempcode") // pass this tempcode variable in the api call
    //             console.log(tempcode);

    //             const response = await Axios.get(`${process.env.REACT_APP_API_URL}/authenticate?key=${tempcode}`);
    //             const result = response.data;
    //             console.log("Setup Api Result:", result);
    //             localStorage.setItem("storeData", JSON.stringify(result));

    //             // const result = localStorage.getItem("storeData") ? JSON.parse(localStorage.getItem("storeData")) : null;

    //             if (result) {
    //                 // localStorage.setItem("storeData", JSON.stringify(result));
    //                 if (result.user) {
    //                     setUserId(result.user.id);
    //                 }

    //                 if (result.user && (result.user.eb_key).length > 0) {
    //                     setSetupStep("2");
    //                     const siteid = String(result.user.eb_key[0].siteid);
    //                     console.log("Setting siteID to:", siteid);
    //                     setSiteID(siteid);
    //                     const matchingOption = options.find(option => option.value === siteid);
    //                     setLoading(false)
    //                     toggleActive()
    //                     setProgressBarText("1 of 2 Task completed")
    //                     setProgressBarValue("50")
    //                     setEBayAccountConnect(true)
    //                 } else {
    //                     setLoading(false)
    //                     console.warn("No valid user data found in storeData");
    //                 }
    //             } else {
    //                 //warning toast
    //             }

    //         } catch (error) {
    //             console.error("Dashboard API call failed:", error);
    //             setContent("Something Went wrong")
    //             toggleActive()
    //         }
    //     };

    //     fetchDataAndInitialize();
    // }, []);

    // const handleSelectChange = useCallback((value) => {
    //     setSiteID(value);
    //     console.log("this is the value", value);
    // }, []);



    const handleEbayAccountConnect = () => {
        setloadingButton(true)
        window.location.href = 'https://shopify.infoshore.biz/epi/authorize.php?sbkey=' + userId + '&new=new&siteid=' + siteID;
        console.log("connect");
        // setEBayAccountConnect(true);
        // setProgressBarText("1 of 2 Task completed")
        // setProgressBarValue("50")
    };

    // Single handler for all radio buttons - more robust to handle various event structures
    const handleOptionChange = (value) => {
        console.log("handleOptionChange", value);
        setSelectedOption(value);  // Update state
    };

    const handleSyncoption = async () => {
                
        let optionValue;
        let inv_sync = 0;
        let price_sync = 0;
        switch (selectedOption) {
            case "disabled1":
                optionValue = "Both Inventory & Price sync enabled";
                inv_sync = 1
                price_sync = 1
                break;
            case "disabled2":
                optionValue = "Inventory sync only enabled";
                inv_sync = 1
                break;
            case "disabled3":
                optionValue = "Price sync only enabled";
                price_sync = 1
                break;
            case "disabled4":
                optionValue = "No sync enabled";
                break;
            default:
                console.log("No option selected");
        }
        console.log(optionValue);
        


return
        try {
            const payload = {
                value: optionValue,
            };

            const response = await Axios.put((`${process.env.REACT_APP_API_URL}/settings/setupFinalStep`), { payload });
            console.log('Authenticated:', response.data.status);
            const data = response.data.status
            if (data === "success") {
                setSyncOption(true);
                setSetupStepDone(true);
                setProgressBarText("2 of 2 Task completed")
                setProgressBarValue("100")
                toggleActive2()
                // localStorage.setItem("validationValue", true);
                localStorage.setItem("Setup", "3");
                console.log("navigating to dashboard");
                window.location.href = `${process.env.REACT_APP_BASE_URL}/`;

            } else {
                setContent2("Something Went wrong")
                toggleActive2()
            }
        } catch (error) {
            console.error('Auth error:', error.response?.data || error.message);
            setContent2("Something Went wrong")
            toggleActive2()
        }

    };

  return (
    <Frame>
              <Page >
                  <BlockStack gap="400">
                      <Layout>
                          <Layout.Section>
                              <BlockStack gap="200">
                                  <Box paddingBlockEnd="4">
                                      <Text variant="headingXl" as="h1" alignment="center">
                                          Etsy Importer
                                      </Text>
                                      <Text variant="bodyMd" as="p" alignment="center" color="subdued">
                                          Set up your Etsy account to start importing products
                                      </Text>
                                  </Box>
                              </BlockStack>
                              {!loading ?
                                  <Card padding="600">
                                      <BlockStack gap="600">
                                          <InlineStack wrap={true}>
                                              <span>
                                                  {progressBarText}
                                              </span>
                                              <ProgressBar
                                                  progress={progressBarValue}
                                                  tone="highlight"
                                                  size="small"
                                              />
                                          </InlineStack>
  
                                          <div style={{ display: "flex", alignItems: "end", gap: "8px" }}>
                                              <div style={{ marginTop: "2px" }}>
                                                  <Icon
                                                      source={eBayAccountConnect ? StatusActiveIcon : AlertCircleIcon}
                                                      tone={eBayAccountConnect ? "success" : "caution"}
                                                  />
                                              </div>
                                              <Text as="h2" variant="headingMd">
                                                  Step 1: Connect your Etsy account
                                              </Text>
                                          </div>
                                          {/* <Select
                                              label="Selling region"
                                              options={options}
                                              onChange={handleSelectChange}
                                              value={siteID}
                                              labelInline={false}
                                              disabled={eBayAccountConnect}
                                          /> */}
                                          <Button
                                              variant="primary"
                                              
                                              onClick={handleEbayAccountConnect}
                                              loading={loadingButton}
                                              disabled={eBayAccountConnect}
                                          >
                                              {eBayAccountConnect ? "Connected" : "Connect"}
                                          </Button>
                                      </BlockStack>
                                      <div style={{ marginTop: "4%" }}>
  
                                          <BlockStack gap="500">
                                              <InlineStack blockAlign="center" gap="300">
                                                  <div style={{ display: "flex", alignItems: "end", gap: "8px" }}>
                                                      <div style={{ marginTop: "2px" }}>
                                                          <Icon
                                                              source={syncOption ? StatusActiveIcon : AlertCircleIcon}
                                                              tone={syncOption ? "success" : (!eBayAccountConnect ? "base" : "caution")}
                                                          />
                                                      </div>
                                                      <Text as="h2" variant="headingMd" tone={!eBayAccountConnect && ("disabled")}>
                                                          Step 2: Order & Inventory Sync
                                                      </Text>
                                                  </div>
  
                                              </InlineStack>
  
                                              {eBayAccountConnect && (
                                                  <>
                                                     
                                                      
                                                      <Text as="p">
                                                          select the appropriate order and inventory sync option
                                                          for your shopify and etsy store
                                                      </Text>

                                                      <Banner>
                                                        Your primary source of inventory will be Etsy. So if you want to update your product inventory , please update it on your Esty store , and it will be synced to your Shopify store.
                                                      </Banner>
                                                    <Form method="post">
                                                      <RadioButton
                                                          label="Enable both Inventory & Price sync"
                                                          checked={selectedOption === "disabled1"}
                                                          id="disabled1"
                                                          value="disabled1"
                                                          name="accounts"
                                                          onChange={() => handleOptionChange("disabled1")}
                                                      />
                                                      <RadioButton
                                                          label="Enable Inventory sync only"
                                                          checked={selectedOption === "disabled2"}
                                                          id="disabled2"
                                                          value="disabled2"
                                                          name="accounts"
                                                          onChange={() => handleOptionChange("disabled2")}
                                                      />
                                                      <RadioButton
                                                          label="Enable Price sync only"
                                                          checked={selectedOption === "disabled3"}
                                                          id="disabled3"
                                                          value="disabled3"
                                                          name="accounts"
                                                          onChange={() => handleOptionChange("disabled3")}
                                                      />
                                                      <RadioButton
                                                          label="None"
                                                          checked={selectedOption === "disabled4"}
                                                          id="disabled4"
                                                          value="disabled4"
                                                          name="accounts"
                                                          onChange={() => handleOptionChange("disabled4")}
                                                      />
  
  
                                                      <Button
                                                          variant="primary"
                                                          fullWidth
                                                        //   onClick={handleSyncoption}
                                                          submit
                                                      >
                                                          {syncOption ? "Done" : "Next"}
                                                      </Button>
                                                    </Form>
                                                  </>
                                              )}
                                          </BlockStack>
  
                                      </div>
                                  </Card>
                                  :
                                  <Card padding="600">
                                      <SkeletonBodyText lines={10} />
                                  </Card>}
  
                          </Layout.Section>
  
                      </Layout>
  
                  </BlockStack>
  
  
                  {toastMarkup}
                  {toastMarkup2}
  
  
              </Page>
          </Frame>
  )
}

