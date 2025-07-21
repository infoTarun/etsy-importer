import {
  IndexTable,
  LegacyCard,
  IndexFilters,
  useSetIndexFiltersMode,
  useIndexResourceState,
EmptyState,
  Pagination,
  Modal,
  Card,
  Text,
  TextContainer,
  SkeletonBodyText,
  Badge,
  Page,
  Button,
  Link,
  Tooltip,
} from '@shopify/polaris';
import { json } from '@remix-run/node';
import { FcPicture } from "react-icons/fc";
import { CgUnblock } from "react-icons/cg";

import wrap from "word-wrap";
import { EditIcon, LinkIcon,SearchIcon,InboundIcon,DisabledIcon, ImportIcon, DeleteIcon } from "@shopify/polaris-icons";
// import { toast } from "react-toastify";
import { useState, useCallback, useEffect } from 'react';
import Axios from 'axios';
import { BiLogoEtsy } from "react-icons/bi";
import { FaShopify } from "react-icons/fa";
import { useAppBridge } from '@shopify/app-bridge-react';
import { useLoaderData } from '@remix-run/react';
export const loader = async () => {
  return json({ ok: true });
};
export default function EtsyProducts() {
  const shopify = useAppBridge();
  let local =  localStorage.getItem('userData');    
  const userData = JSON.parse(local);
  const {admin} = useLoaderData();
  const userId = userData.id;
  const shopurl = userData.shopurl;
  const storeName = shopurl.replace(".myshopify.com", "");
  const [ products , setProducts ] = useState([]);
  const [totalProduct,setTotalProduct] = useState(0);
  const [fetchEtsyProductLoading,setfetchEtsyProductLoading] = useState(false);
  const [queryValue, setQueryValue] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [query,setQuery] = useState("");
  const [sortSelected, setSortSelected] = useState(['Product desc']);
  const { mode, setMode } = useSetIndexFiltersMode();
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [current_page, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1);
  const [active, setActive] = useState(false);
  const [orderBy , setOrderBy] = useState('Product desc');
  const [last_page,setLastPage] = useState(1);
  const [perPageValue, setPerPageValue] = useState("20");
  const [totalItems , setTotalItems] = useState(0);
  const [status,setStatus] = useState('All');
  const [fetchVariants,setFetchVariants] = useState(false);
  const handleClose = () => setActive(false);
  const [productData, setproductData] = useState(false);
  const [firstProductNo, setFirstProductNo] = useState(1);
  const [lastProductNo, setLastProductNo] = useState("20");
  const [selectImportIds,setSelectedImport] = useState([]);
  const [selectedBlock , setSelectBlockIds] = useState([]);
  const [selectUnblockIds,setSelectUnblockIds] = useState([]);
  const [selectReImportIds,setSelectedReImport] = useState([]);
  const [selectDeleteProductIds,setSelectedDeleteProduct] = useState([]);
  const [importedProductCount,setImportedProductCount] = useState();
  const [deleteBtn,setDeleteBtn] = useState(false);
  const [upgradeModalActive, setUpgradeModalActive] = useState(false);
const toggleUpgradeModal = () => setUpgradeModalActive((prev) => !prev);
  const [reImportedProductCount,setReImportedProductCount] = useState(0);
  const {selectedResources, allResourcesSelected, handleSelectionChange,removeSelectedResources} = useIndexResourceState(products);
  const sortOptions = [
    {label: 'Product', value: 'Product asc', directionLabel: 'Ascending'},
    {label: 'Product', value: 'Product desc', directionLabel: 'Descending'},
    { label: "Title", value: "Title asc", directionLabel: "Title asc" },
    { label: "Title", value: "Title desc", directionLabel: "Title desc" },
  
  ];
  const resourceName = {
    singular: 'product',
    plural: 'products',
  };
  const getBadgeTone = (status) => {
    switch (status.toLowerCase()) {
      case "ready to import":
        return "info";
      case "import in progress":
      case "reimport in progress":
        return "warning";
      case "imported":
        return "success";
      case "already exist":
        return "attention";
      case "error":
        return "critical";
      case "block":
        return "warning";
      
      default:
        return "attention";
    }
  };
  
  const headingStyle = { fontSize: "1.1em", fontWeight: "700" };

    const headerStyle = {
      padding: "10px 14px",
      textAlign: "left",
      fontWeight: 600,
      fontSize: "14px",
      color: "#202223",
      borderBottom: "1px solid #dfe3e8",
    };
    const cellStyle = {
      padding: "10px 14px",
      textAlign: "left",
      fontSize: "14px",
      color: "#3c3f41",
      borderBottom: "1px solid #dfe3e8",
      backgroundColor: "#fff",
    };
  const [itemProducts, setItemProducts] = useState([
    `All`,
    `Ready To Import`,
    "Imported",
    "Import In Progress",
    "ReImport In Progress",
    "Error",
  ]);
  const reverseStatusMap = {
  Already_Exist: "Already Exist",
  Ready_to_Import: "Ready to Import",
  Import_in_progress: "Import in progress",
  Imported: "Imported",
  error: "error",
  reimport_in_progress: "reimport in progress",
};
 useEffect(() => {
        if (Array.isArray(selectedResources) && selectedResources.length > 0) {
        
          if (userData.plan === 0) {
            if (selectedResources.length > 5) {
              //console.log(selectedResources);
            }
          }
            const filteredProductIdsUnblock = products
            .filter(product =>
              selectedResources.includes(product.id) && product.status === 'Ready to Import' && product.block === 1
            )
            .map(product => product.id); 
         setSelectUnblockIds(filteredProductIdsUnblock);
          const filteredProductIds = products
            .filter(product =>
              selectedResources.includes(product.id) && product.status === 'Ready to Import' && product.block === 0
            )
            .map(product => product.id); 
            if (userData.plan  === 0) {
              if (userData.skuconsumed >= userData.skulimit) {
                // setUpgradeModalActive(true);
              }else{
                setSelectBlockIds(filteredProductIds);
                const importIds = filteredProductIds.slice(0,userData.skulimit - userData.skuconsumed);
                setSelectedImport(importIds);
                setImportedProductCount(importIds.length);
              }
              
            }else{

              setSelectedImport(filteredProductIds);
              setImportedProductCount(filteredProductIds.length);
            }
          const filteredReProductIds = products
          .filter(product =>
            selectedResources.includes(product.id) && product.status === 'Imported'
          )
          .map(product => product.id);  // Get only the IDs of the filtered products
          setSelectedReImport(filteredReProductIds);
          setSelectedDeleteProduct(filteredReProductIds);
          setReImportedProductCount(filteredReProductIds.length);
        } else {
          setImportedProductCount(0);
        }
      }, [selectedResources, products]);
  useEffect(()=>{
    fetchproduct('All');
  },[]);
    const fetchproduct = async(status,query,orderBy,parPage = perPageValue,page = current_page)=>{
  
      try {
      setproductData(false);
      setStatus(status);
      let lastpage = ((current_page*page)/current_page)*parPage;
      setLastProductNo(lastpage);
        setFirstProductNo(lastpage - parPage + 1);
      console.log("userdata",userData);
      

      const res = await Axios.get(`/api/products/`, {
          params: {
            status:status,
            user_id: userId,
            query:query,
            orderBy:orderBy,
            parPage:parPage,
            page:page
          },
        });
        const  productData = res.data.products;
        setproductData(true);
        setTotalProduct(res.data.totalProduct);
        setTotalItems(res.data.totalCount);
        if (lastProductNo > res.data.totalCount) {
          setLastProductNo(res.data.totalCount);
        }
        const formattedProducts = productData.map((product) => {
        let firstImage = '';
        try {
          const images = JSON.parse(product.product_image_data || '[]');
          firstImage = images[0]?.image_url || "";
        } catch (e) {
          console.error('Invalid JSON in product_image_data:', product.product_image_data);
        }
        return {
          id: product.product_id,
          title: wrap(product.title, { width: 50 }),
          status: reverseStatusMap[product.status],
          block: product?.block || 0,
          has_variation:product.has_variation || 0,
          shopifyproductid:product.shopifyproductid || 0,
          etsylistingid:product.etsylistingid || 0,
          image: firstImage , 
        };
      });
      setProducts(formattedProducts);
      } catch (error) {
        console.log("error while fetching products :: ",error);
      }
    }
    const handleSortChange = (value) => {
      setSortSelected(value)
      fetchproduct(status,query,value[0],perPageValue);
      console.log(value);
    };
    const handlePerPage = (event) => {
    setCurrentPage(1);
    setPerPageValue(event.target.value);
    setLastProductNo(event.target.value);
    fetchproduct(status,query,orderBy,event.target.value);
    //console.log(event.target.value);

  };
  const tabs = itemProducts.map((item, index) => {
  const label = item.replace(/\s\d+$/, '').trim(); 
  const match = item.match(/\d+$/); 
  let badgeValue = 0; 
  return {
    content: item,
    badge: badgeValue, 
    index,
    onAction: () => {},
    id: `${item}-${index}`,
    isLocked: index === 0,
    actions: index === 0 ? [] : [],
  };
});

  const handleFiltersQueryChange = (value)=>{
    console.log(value);
    setQuery(value);
    setQueryValue(value) 
    fetchproduct(status,value);
  }  
    const handleSelectItem = (id) => {
        console.log("Selected ID:", id);
        // Perform any action you need with this ID
    };
  const handleOpen =async (product_id) => {
    setFetchVariants(true);
      try {
      const res = await Axios.get(`/api/getVariants/${product_id}`, {
        params: {
          user_id: userId,
        },
      });
      setFetchVariants(false);
      // const res = await fetch(`/api/getVariants/${product_id}`,{params});
      const data =  res.data;
      setSelectedVariants(data.productVariants);
      setActive(true);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };
  const fetchEtsyProduct =async ()=>{
    setfetchEtsyProductLoading(true);
    console.log("user_id ",userId);
    try {
      const res = await Axios.get(`/api/etsyRequest/`, {
          params: {
            user_id: userId,
          },
        });
        console.log("response",res);
        setfetchEtsyProductLoading(false);
        if (res.data?.error) {
            shopify.toast.show(res.data.error);
            return;
        }
        console.log("llllllllll");
        shopify.toast.show(res.data.msg);
    } catch (error) {
      console.log(error);
    }
  }
  const handleUnBlockRequest = async(product_id)=>{
      console.log("handleUnBlockRequest",product_id);
      try {
      const res = await Axios.get(`/api/unblockEtsyProduct/`, {
        params: {
          user_id: userId,
          product_id: Array.isArray(product_id) ? product_id.join(',') : product_id
        },
      });
      removeSelectedResources(selectedResources);
      
      console.log("response",res);
      if (res.data?.error) {
        shopify.toast.show(res.data.error);
        return;
      }
        const newids = Array.isArray(product_id) ? product_id : [product_id];
      setProducts((prevProducts) =>
            prevProducts.map((product) =>
              newids.includes(product.id)
                ? { ...product, block: 0}
                : product
            )
          );
      console.log("llllllllll");
      shopify.toast.show(res.data.msg);
      // fetchproduct(status,query,orderBy,perPageValue,current_page);
      
      } catch (error) {
        console.log(error);
      }
  }
  const handleBlockRequest = async(product_id)=>{
    try {
      console.log("handleBlockRequest",product_id);
      const res = await Axios.get(`/api/blockEtsyProduct/`, {
        params: {
          user_id: userId,
          product_id: Array.isArray(product_id) ? product_id.join(',') : product_id
        },
      });
      removeSelectedResources(selectedResources);

      console.log("response",res);
      if (res.data?.error) {
        shopify.toast.show(res.data.error);
        return;
      }
      console.log("llllllllll");
      const newids = Array.isArray(product_id) ? product_id : [product_id];
      setProducts((prevProducts) =>
            prevProducts.map((product) =>
              newids.includes(product.id)
                ? { ...product, block: 1}
                : product
            )
          );
      shopify.toast.show(res.data.msg);
      // fetchproduct(status,query,orderBy,perPageValue,current_page);
    } catch (error) {
      console.log(error);
    }
  }
  const handleDeleteRequest =async (id)=>{
   setDeleteBtn(true);
    
    try {
      const queryAPi = new URLSearchParams({
        user_id: userId,
        productId: id,
      });
      shopify.toast.show("Product deleting from shopify...");

      removeSelectedResources(selectedResources);
      const res = await fetch(`/api/deleteShopifyProduct?${queryAPi.toString()}`);
      setDeleteBtn(false);
      if (!res.ok) {
        // Handle HTTP errors
        console.error("Error:", res.status);
        const errorText = await res.text(); // fallback
        console.error(errorText);
      } else {
        const data = await res.json(); // assuming the server returns JSON
        console.log("Response data:", data);
        shopify.toast.show(data.msg);
        const newids = Array.isArray(id) ? id : [id];
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            newids.includes(product.id)
              ? { ...product, status: 'Ready to Import',shopifyproductid:''}
              : product
          )
        );
      }      
      // fetchproduct(status,query,orderBy,perPageValue,current_page);
    } catch (error) {
      console.log(error);
    }
  }

  const handleAllImportRequest =async ()=>{
    try {
      const queryApi = new URLSearchParams({
        user_id: userId,
      });
      const res =await fetch(`/api/importAllProduct?${queryApi.toString()}`,{
        method:'GET'
      });
    } catch (error) {
      console.log(error);
    }


  }

  const handleBulkImportRequest = (ids) =>{
    // setUpgradeModalActive(true);    
    // console.log('handleBulkImportRequest ',userData);
    removeSelectedResources(selectedResources);
    const remainingSku = userData.skulimit - userData.skuconsumed;
    if (remainingSku <= 0) {
      setUpgradeModalActive(true);
      return;
    }
    try {
      const queryApi = new URLSearchParams({
        user_id: userId,
        product_id: ids,
      });
      
      const res =  fetch(`/api/bulkImport/?${queryApi .toString()}`, {
        method: 'GET',
      });
      fetchproduct(status,query,orderBy,perPageValue,current_page);
      shopify.toast.show("Product will be imported shortly.");
    } catch (error) {
      console.log(error);
    }
  }
  const handleImportRequest =async (id)=>{
    let localUserData = JSON.parse(localStorage.getItem("userData")) || {};     
    console.log('localUserData',localUserData);
      
    if (localUserData.skuconsumed >= localUserData.skulimit) {
      setUpgradeModalActive(true);
      return ;
    }
    // setUpgradeModalActive(true);
    shopify.toast.show(`Import in progress...`);
      const newids = Array.isArray(id) ? id : [id];
        setProducts((prevProducts) =>
              prevProducts.map((product) =>
                newids.includes(product.id)
                  ? { ...product, status: 'Import in progress'}
                  : product
              )
            );
       const queryApi = new URLSearchParams({
        user_id: userId,
        product_id: id,
      });
      try {
        const res = await fetch(`/api/ImportToShopify/?${queryApi.toString()}`, {
          method: 'GET',
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json(); 
        console.log('Response:', data);
        if (res.data?.error) {
          shopify.toast.show(res.data.error);
          return;
        }else{
      // Get and parse userData from localStorage
        let localUserData = JSON.parse(localStorage.getItem("userData")) || {};

        // Increment skuconsumed
        let newSkuconsumed = (localUserData.skuconsumed || 0) + 1;
        localUserData.skuconsumed = newSkuconsumed;

        // Update localStorage
        localStorage.setItem("userData", JSON.stringify(localUserData));

        // Show toast
        shopify.toast.show("Product has been imported.");

        // Update product status in state
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            newids.includes(product.id)
              ? { ...product, status: 'Imported', shopifyproductid: data.shopifyproductid }
              : product
          )
        );

        }
      } catch (error) {
        console.error('Error fetching from API:', error);
      }
      removeSelectedResources(selectedResources);
         // fetchproduct(status,query,orderBy,perPageValue,current_page);
  }

      const handleAllSelections = (value)=>{
        console.log(value);
        console.log("product length : ",products.length);
        
      }
    const handleCancelSearch = ()=>{
      setQuery("");
      console.log("handleCancelSearch");
      setQueryValue("");
      fetchproduct(status);
    }
  const promotedBulkActions = [
    {
      content: `Import Selected Products`,
          onAction: () => {
            handleBulkImportRequest(selectImportIds)
          },
    },
    {
      title:"Action",
      actions:[
        {
              icon: ImportIcon,
              content: 'Import Selected Product',
              onAction: () =>handleBulkImportRequest(selectImportIds),
        },
        {
              icon: ImportIcon,
              content: 'Import All Products',
              onAction: () =>handleAllImportRequest(),
        },
        {
          icon: DisabledIcon,
          destructive: true,
          content: 'Block Selected Products',
          onAction: () => handleBlockRequest(selectImportIds),

        },
        {
          icon:CgUnblock,
          destructive: true,
          content: 'Unblock Selected Products',
          onAction: () => handleUnBlockRequest(selectUnblockIds),
        },
        {
          icon: DeleteIcon,
          destructive: true,
          content: 'Delete Products',
          onAction: () => handleDeleteRequest(selectDeleteProductIds),
        },
      ]
    }
  ]
  const rowMarkup = products.map(({id, title, status, block, has_variation, shopifyproductid, etsylistingid, image}, index) => (
    <IndexTable.Row
      id={id}
      key={id}
      selected={selectedResources.includes(id)}
      position={index}
      onClick={() => handleSelectItem(id)}
    >
      <IndexTable.Cell>
        { image ? (
        <img
          src={image}
          alt={'iamgeProduct'}
          style={{borderRadius:"5px"}}
          width="50"
          className="iamgeProduct" 
          height="50"
        />
        ):(
           <FcPicture  style={{width:"50px",height:"50px",color:"forestgreen"}}/>
        )}
      </IndexTable.Cell>
      <IndexTable.Cell>
          <Text as="p" fontWeight="medium">
          {title.split("\n").map((line, idx) => (
            <span key={idx}  >
              {line}
              <br />
            </span>
          ))}
          Etsy Item Id : {etsylistingid}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
          <Link 
            monochrome
            removeUnderline
            onClick={() => handleOpen(id)}     
            >
              {has_variation} variants
          </Link>
        </IndexTable.Cell>
      <IndexTable.Cell>
        {block == 0 ? (
        <Badge tone={getBadgeTone(status)}>{status}</Badge>
        ):(
        <Badge tone={getBadgeTone("Block")}>Block</Badge>
        )}
      </IndexTable.Cell>
      <IndexTable.Cell>
        {etsylistingid > 0 && (
          <Tooltip content="View on Etsy" preferredPosition='below'>
            <a
                  href={`http://etsy.com/in-en/listing/${etsylistingid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="shopify-link"
                >
                 <BiLogoEtsy  style={{width:"50px",height:"50px",color:"orangered"}}/>
                </a>
          </Tooltip>
        )}
          {shopifyproductid > 0 && (
            <Tooltip content="view on Shopify"  preferredPosition='below'>
              <a
                href={`https://admin.shopify.com/store/${storeName}/products/${shopifyproductid}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="shopify-link"
                >
                 <FaShopify  style={{width:"50px",height:"50px",color:"forestgreen"}}/>
                </a>
            </Tooltip>
        )}
      </IndexTable.Cell>
      <IndexTable.Cell>
        { status== 'Ready to Import' && block == 0 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Tooltip content="Click here to import Etsy listings into your Shopify store." preferredPosition='below'>
                <Button variant='primary'  onClick={() => handleImportRequest(id)}>
                  Import On shopify
                </Button>
              </Tooltip>
              <Tooltip content="Block this product." preferredPosition='mostSpace'>
                <Button  onClick={() => handleBlockRequest(id)}>
                  Block
                </Button>
              </Tooltip>
          </div>
        )}
          { status== 'Imported' && block == 0 && (
            <div style={{ display: 'flex', gap: '8px' }}>
          <Tooltip content="Delete From Shopify">
              <Button loading={deleteBtn} onClick={() => handleDeleteRequest(id)} tone="critical">Delete</Button>
          </Tooltip>
          </div>
        )}
        {block == 1 &&(
          <Tooltip content="Unblock this product." preferredPosition='mostSpace'>
            <Button  onClick={() => handleUnBlockRequest(id)}>
              Unblock
            </Button>
          </Tooltip>
        )}
      </IndexTable.Cell>
    </IndexTable.Row>
  ));
  let content;
   if (!productData) {
        content =    <Card>
          <LegacyCard subdued>
          <LegacyCard.Section>
            <SkeletonBodyText lines={2} />
          </LegacyCard.Section>
          <LegacyCard.Section>
            <SkeletonBodyText lines={2} />
          </LegacyCard.Section>
        </LegacyCard>
        <LegacyCard subdued>
          <LegacyCard.Section>
            <SkeletonBodyText lines={2} />
          </LegacyCard.Section>
          <LegacyCard.Section>
            <SkeletonBodyText lines={2} />
          </LegacyCard.Section>
        </LegacyCard>             
              <LegacyCard subdued>
          <LegacyCard.Section>
            <SkeletonBodyText lines={2} />
          </LegacyCard.Section>
          <LegacyCard.Section>
            <SkeletonBodyText lines={2} />
          </LegacyCard.Section>
        </LegacyCard>
            <LegacyCard subdued>
          <LegacyCard.Section>
            <SkeletonBodyText lines={2} />
          </LegacyCard.Section>
          <LegacyCard.Section>
            <SkeletonBodyText lines={2} />
          </LegacyCard.Section>
        </LegacyCard>
        </Card>;
      }else if(products.length === 0){
            if (totalProduct == 0) {
             content =  <Card>        <EmptyState
                heading="Product Not Found On Etsy"
                action={{content: 'Create Etsy Product',url:`https://www.etsy.com/in-en/your/shops/me/onboarding/listing-editor/create`,target:"_blank" }}
                image="https://cdn.shopify.com/shopifycloud/web/assets/v1/vite/client/en/assets/empty-state-personalized-Bu4xlcHV0rQu.svg"
                fullWidth
              >
                 <Text variant="bodyLg" as="p">
                  You currently have no products available in your <strong>Etsy store.</strong>  Please create a product to continue.
                 </Text>
              </EmptyState>
              </Card>
          }else{
            content =        <Card>
              <EmptyState
                heading="Product Not Found"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                fullWidth
              >
              </EmptyState>
              </Card>
          }
      }else{
        content =<>
        <IndexTable
              resourceName={resourceName}
              itemCount={products.length}
              onChange={handleAllSelections}
              selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
              onSelectionChange={handleSelectionChange}
              promotedBulkActions = {promotedBulkActions}
                headings={[
                  { title: <h2 style={headingStyle}>Image</h2> },
                  { title: <h2 style={headingStyle}>Title</h2> },
                  { title: <h2 style={headingStyle}>Variations</h2> },
                  { title: <h2 style={headingStyle}>Status</h2> },
                  { title: <h2 style={headingStyle}>View On</h2> },
                  { title: <h2 style={headingStyle}>Action</h2> },
                ]}
              >
          {rowMarkup}
        </IndexTable>
      </>
      }
  return (
    <Page title='Etsy Products'
    fullWidth={true}
       primaryAction={{
        content: "Fetch Etsy Products",
        onAction: fetchEtsyProduct,
        helpText: "Fetch Products From Your Etsy Store.",
        primary: true,
        loading:fetchEtsyProductLoading,
        icon: InboundIcon,
      }}
    >
    <div style={{ width: "100%", marginRight: "20px", marginBottom: "40px" }}>
       
      <LegacyCard>
        <IndexFilters
          sortOptions={sortOptions}
          sortSelected={sortSelected}
          queryValue={queryValue}
          queryPlaceholder="Search products"
          onQueryChange={handleFiltersQueryChange}
          onQueryClear={() => setQueryValue('')}
          onSort={handleSortChange}
          primaryAction={null}
          cancelAction={{
                content:"cancel",
                onAction: handleCancelSearch,
          }}
          tabs={tabs}
          selected={selectedTab}
          filters={[]}
          onSelect={(index) => {
            setSelectedTab(index);
            const selectedStatus = itemProducts[index];
            fetchproduct(selectedStatus);
          }}
          mode={mode}
          setMode={setMode}
          canCreateNewView={false}
          />
        {content}
       <Modal
  open={active}
  onClose={handleClose}
  title="Product Variation List"
  primaryAction={{ content: "Close", onAction: handleClose }}
>
  <Modal.Section>
    {selectedVariants.length > 0 ? (
      <div style={{ overflowX: "auto" }}>
        <table
          className="Polaris-Table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f6f6f7" }}>
              <th
                style={{
                  padding: "10px 14px",
                  textAlign: "left",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#202223",
                  borderBottom: "1px solid #dfe3e8",
                }}
              >
                Option 1
              </th>
              <th style={headerStyle}>Option 2</th>
              <th style={headerStyle}>Sku</th>
              <th style={headerStyle}>Quantity</th>
              <th style={headerStyle}>Price</th>
            </tr>
          </thead>
          <tbody>
            {selectedVariants.map((variant, index) => (
              <tr key={index}>
                <td style={cellStyle}>{variant.option1val}</td>
                <td style={cellStyle}>{variant.option2val}</td>
                <td style={cellStyle}>{variant.sku}</td>
                <td style={cellStyle}>{variant.quantity}</td>
                <td style={cellStyle}>{variant.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <Text>No Variants Available</Text>
    )}
  </Modal.Section>
</Modal>

      </LegacyCard>
         <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#f6f6f7",
                padding: "10px 16px",
                borderTop: "1px solid #dfe3e8",
                borderBottom: "1px solid #dfe3e8",
              }}
            >
              {/* Pagination controls */}
              <Pagination
                onPrevious={() => {
                  setCurrentPage(current_page-1);

                  fetchproduct(status,query,orderBy,perPageValue,current_page-1);
                }}
                onNext={() => {
                  setCurrentPage(current_page+1);
                  fetchproduct(status,query,orderBy,perPageValue,current_page+1);
                }}
                hasPrevious={current_page !== 1}
                hasNext={lastProductNo <totalItems  }
                type="table"
                label={`${firstProductNo}-${lastProductNo} of ${totalItems} products`}
              />
              {/* Dropdown for per page selection */}
              <pre style={{marginLeft: 'auto'}}>Items per page - </pre>
              <select
                name="perPageSelect"
                style={{
                  height: "32px",
                  padding: "4px 8px",
                  fontSize: "14px",
                  border: "1px solid #dfe3e8",
                  borderRadius: "4px",
                  backgroundColor: "#f6f6f7",
                  color: "#000",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='black' height='12' viewBox='0 0 24 24' width='12' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                  backgroundSize: "12px",
                  paddingRight: "24px",
                  cursor: "pointer",
                }}
                value={perPageValue}
                onChange={handlePerPage}
              >
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
             <Modal
                open={upgradeModalActive}
                onClose={toggleUpgradeModal}
                title="Upgrade Required"
                primaryAction={{
                  content: 'Upgrade Plan',
                  onAction: () => {
                    window.open(`${process.env.REACT_APP_BASE_URL}/Plan&Pricing`)
                  },
                }}
                secondaryActions={[
                  {
                    content: 'Cancel',
                    onAction: toggleUpgradeModal,
                  },
                ]}
              >
                <Modal.Section>
                  <TextContainer>
                    <p>
                      You have reached your import limit. Please upgrade your plan to import more products.
                    </p>
                  </TextContainer>
                </Modal.Section>
              </Modal>
    </Page>
  );
}
