import wyreApi from "../wyreapiconfig.json";
import axios from "axios";
import crypto from "crypto";

const instance = axios.create({
  baseURL: wyreApi.testWyreApiUrl,
  headers: {
    "Content-Type": "application/json"
  }
});
async function generateWyreSecretKey() {
  return crypto.randomBytes(30).toString("hex");
}

async function submitWyreAuthToken(secretKey) {
  const { data } = await axios.post(
    wyreApi.testWyreApiUrl + "/v2/sessions/auth/key",
    { secretKey: secretKey },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
  return data;
}
export async function createWyreAccount() {
  console.log("Creating an empty Wyre Account");
  let secretKey = await generateWyreSecretKey();

  await submitWyreAuthToken(secretKey);
  let newWyreAccount = {
    type: "INDIVIDUAL",
    country: "US",
    subaccount: false,
    referrerAccountId: wyreApi.testAccountId
  };
  const { data } = await instance.post("/v3/accounts", newWyreAccount);
  localStorage.setItem("wyreSecretKey", secretKey);
  return data;
}

function setAxiosHeaders() {
  instance.defaults.headers.common.Authorization =
    "Bearer " + localStorage.getItem("wyreSecretKey");
}

export async function getWyreAccountInformation(accountId, secretKey) {
  console.log("Getting account information for: " + accountId);
  setAxiosHeaders();
  const { data } = await instance.get("/v3/accounts/" + accountId);
  return data;
}

export async function updateWyreAccount(wyreValueObj, accountId) {
  console.log("Updating Address...");
  setAxiosHeaders();
  const updateWyreAccount = {
    profileFields: [wyreValueObj]
  };
  console.log(updateWyreAccount);
  const { data } = await instance.post(
    "/v3/accounts/" + accountId,
    updateWyreAccount
  );
  return data;
}

export async function updateWyrePersonalDetailsAccount(
  personalDetailsArray,
  accountId
) {
  console.log("Updating personal details: ");
  const updateWyreAccount = {
    profileFields: personalDetailsArray
  };
  setAxiosHeaders();
  const { data } = await instance.post(
    "/v3/accounts/" + accountId,
    updateWyreAccount
  );
  return data;
}

export async function uploadWyreDocument(file, fieldId, accountId) {
  console.log("Uploading document: " + fieldId);
  await instance.post("/v3/accounts/" + accountId + "/" + fieldId, file, {
    baseURL: wyreApi.testWyreApiUrl,
    headers: {
      "Content-Type": file.type,
      Authorization: "Bearer " + localStorage.getItem("wyreSecretKey")
    }
  });
}

export async function createWyrePaymentMethod(publicToken) {
  setAxiosHeaders();
  let wyrePaymentMethod = {
    publicToken: publicToken,
    paymentMethodType: "LOCAL_TRANSFER",
    country: "US"
  };
  console.log("Creating A Payment Method...");
  const { data } = await instance.post("/v2/paymentMethods", wyrePaymentMethod);
  return data;
}

export default {
  createWyreAccount,
  updateWyreAccount,
  updateWyrePersonalDetailsAccount,
  uploadWyreDocument,
  createWyrePaymentMethod
};
