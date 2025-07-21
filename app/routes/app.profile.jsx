import { TitleBar } from "@shopify/app-bridge-react";
import {
  BlockStack,
  Card,
  Divider,
  Page,
  Select,
  Text,
  TextField,
  FormLayout,
  Collapsible,
} from "@shopify/polaris";
import { useEffect } from "react";
import { useState } from "react";
import category from "./taxonomy.json";

function profile() {
  const [shippingPolicy, setShippingPolicy] = useState("");
  const [profileName, setProfileName] = useState("");
  const [who, setWho] = useState("");
  const [what, sesetWhat] = useState("");
  const [categoryLevels, setCategoryLevels] = useState([]); // Stores options for each level
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(""); // for raw path
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredCategories([]);
      setShowSuggestions(false);
    } else {
      const q = query.toLowerCase();
      const matches = category.filter((item) =>
        item.path.toLowerCase().includes(q),
      );
      setFilteredCategories(matches.slice(0, 10));
      setShowSuggestions(true);
    }
  }, [query, category]);

  const handleSelect = (item) => {
    setSelected(item.path); // store raw value
    setQuery(formatPathToHierarchy(item.path)); // display formatted
    setShowSuggestions(false); // close dropdown
  };

  const shippingPolicyOptions = [
    { label: "new", value: "new" },
    { label: "old", value: "old" },
  ];
  const WhoMadeIt = [
    { label: "I did", value: "I" },
    { label: "A member of my shop", value: "member" },
    { label: "Another company of person", value: "Another_company" },
  ];
  const WhatIsIt = [
    { label: "A finished product", value: "finished_product" },
    { label: "A supply or tool to make things", value: "supply_or_tool" },
  ];

  const handleSelectChange = (value) => {
    setShippingPolicy(value);
  };

  return (
    <Page>
      <TitleBar title="Profile" />
      <BlockStack gap="300">
        <Card>
          <BlockStack gap="300">
            <Text variant="headingMd" as="h1">
              profile name
            </Text>

            <TextField
              name="profile name"
              label="profile name"
              value={profileName}
              onChange={(value) => setProfileName(value)}
            />
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="300">
            <Text variant="headingMd" as="h1">
              Basic mapping
            </Text>
            <p>
              Describe your product in 2-3 words to get relevant category
              suggestions and improve visibility on Etsy.
            </p>
            <div>
              <TextField
                label="Etsy Category"
                placeholder="Search Product Category"
                value={query}
                onChange={(value) => {
                  setQuery(value);
                  setSelected("");
                }}
                autoComplete="off"
              />

              {showSuggestions && filteredCategories.length > 0 && (
                <ul
                  style={{
                    position: "absolute",
                    width: "100%",
                    maxHeight: "200px",
                    overflowY: "auto",
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    zIndex: 999,
                    listStyle: "none",
                    margin: 0,
                    padding: "0.5rem 0",
                  }}
                >
                  {filteredCategories.map((item, index) => (
                    <li
                      key={index}
                      onClick={() => handleSelect(item)}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {formatPathToHierarchy(item.path)}
                    </li>
                  ))}
                </ul>
              )}

              {selected && (
                <div
                  style={{
                    marginTop: "10px",
                    color: "#2b2b2b",
                    fontSize: "14px",
                  }}
                >
                  <strong>Selected:</strong> {formatPathToHierarchy(selected)}
                </div>
              )}
            </div>
            <Divider />

            <Select
              label="Shipping Policy"
              options={shippingPolicyOptions}
              value={shippingPolicy} // <-- This is how you set the current value
              onChange={handleSelectChange}
            />
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="300">
            {/* <Text variant="headingMd" as="h1">
              Advance mapping
            </Text> */}
            <Text variant="headingSm" as="h1">
              About the Listing
            </Text>
            <p>
              Describe the type of products you want to sell on Etsy to ensure
              compliance with Etsy's guidelines
            </p>
            <Card>
              <Collapsible></Collapsible>
              <FormLayout>
                <FormLayout.Group>
                  <Select
                    label="Who made it?"
                    options={WhoMadeIt}
                    value={who} // <-- This is how you set the current value
                    onChange={handleSelectChange}
                  />
                  <Select
                    label="What is it?"
                    options={WhatIsIt}
                    value={what} // <-- This is how you set the current value
                    onChange={handleSelectChange}
                  />
                  <Select
                    label="When did you make it?"
                    options={shippingPolicyOptions}
                    value={shippingPolicy} // <-- This is how you set the current value
                    onChange={handleSelectChange}
                  />
                </FormLayout.Group>
              </FormLayout>
            </Card>
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="300">
            <Text variant="headingMd" as="h1">
              Advance mapping
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}

function formatPathToHierarchy(path) {
  return path
    .split(".")
    .map(
      (segment) =>
        segment
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase()), // Capitalize each word
    )
    .join(" → ");
}

export default profile;
