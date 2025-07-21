import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import { ToastContainer } from 'react-toastify';
// import cron from 'node-cron';
//  cron.schedule('* * * * *', () => {
//     console.log('running a task every minute');
//   });
import { FaEtsy } from "react-icons/fa6";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};
export default function App() {
 
  const { apiKey } = useLoaderData();
  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">Home</Link>
        <Link to="/app/setup">Setup</Link>
        <Link to="/app/etsy-products">Etsy Products</Link>
        <Link to="/app/Shopify-products">Shopify Products</Link>
        <Link to="/app/etsyaccount">Etsy Account</Link>
        <Link to="/app/profile">Profile</Link>
        <Link to="/app/settings">Settings</Link>
        <Link to="/app/plan">Plan&Pricing</Link>
      </NavMenu>
      <Outlet />

    </AppProvider>
  );
}


// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
