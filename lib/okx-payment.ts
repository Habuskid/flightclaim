import { OKXFacilitatorClient } from "@okxweb3/x402-core";
import { ExactEvmScheme } from "@okxweb3/x402-evm/exact/server";
import { x402ResourceServer } from "@okxweb3/x402-next";

const NETWORK = "eip155:196"; // X Layer Mainnet

let serverInstance: x402ResourceServer | null = null;

export const getResourceServer = () => {
  if (!serverInstance) {
    const facilitatorClient = new OKXFacilitatorClient({
      apiKey: process.env.OKX_API_KEY || "",
      secretKey: process.env.OKX_SECRET_KEY || "",
      passphrase: process.env.OKX_PASSPHRASE || "",
    });
    serverInstance = new x402ResourceServer(facilitatorClient);
    serverInstance.register(NETWORK, new ExactEvmScheme());
  }
  return serverInstance;
};
