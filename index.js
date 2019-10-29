const core = require("@actions/core");
const axios = require("axios");

// Get inputs from core
const baseURL = core.getInput("baseURL");
const routes = core.getInput("routesToTest");
const hook = core.getInput("hook");

const allResponses = [];

// Create baseApi with Axios

const baseApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${process.env.AUTH_TOKEN}`
  },
  timeout: 60000
});

// Function to handle get route
const handleGetRoute = async (route = "/") => {
  const response = await baseApi.get(route);
  allResponses.push({ route, response });
  return response;
};

// Function to handle post route
const handlePostRoute = async (route = "/", data = {}) => {
  const response = await baseApi.post(route, data);
  allResponses.push({ route, response });
  return response;
};

const sendToWebHook = async (webHook = "/", response = {}) => {
  await baseApi.post(webHook, response);
};

// Handle different cases
/**
 * @todo: handle for other HTTP Verbs
 */
routes.forEach(async (item, index, array) => {
  switch (item.method.toUpperCase()) {
    case "GET":
      await handleGetRoute(item.route);
      break;
    case "POST":
      await handlePostRoute(item.route, item.data);
      break;
    default:
      await handleGetRoute(item.route);
  }

  if (index === array.length - 1) {
    await sendToWebHook(hook, allResponses);
  }
});
