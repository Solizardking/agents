export declare const CLAWD_PROJECT_ID = "x402-477302";
export declare const CLAWD_PROJECT_NUMBER = "1013652097839";
export declare const CLAWD_REASONING_ENGINE_LOCATION = "us-west1";
export declare const CLAWD_REASONING_ENGINE_ID = "9023111387018166272";
export declare const CLAWD_REASONING_ENGINE_URN = "urn:agent:projects-1013652097839:projects:1013652097839:locations:us-west1:aiplatform:reasoningEngines:9023111387018166272";
export declare const CLAWD_SA = "service-1013652097839@gcp-sa-aiplatform-re.iam.gserviceaccount.com";
export interface RegisteredEndpoint {
    name: string;
    location: string;
    url: string;
    description: string;
}
export declare const REGISTERED_ENDPOINTS: RegisteredEndpoint[];
export { CLAWD_AUTH_BASE, CLAWD_DISCOVERY_URL } from "./auth/index.js";
