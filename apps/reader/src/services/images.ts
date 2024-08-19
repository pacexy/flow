import {AxiosPromise} from 'axios';

import { api } from "./httpClient";

export const generationsApi = (prompt: any): AxiosPromise<any> => {
    const request = {
        "height": 384,
        "modelId": "6b645e3a-d64f-4341-a6d8-7a3690fbf042",
        // "prompt": "Demen the cricket stands upright on its two hind legs, proudly occupying the foreground in front of the cave opening, which frames a serene view of the tranquil pond in the distance. The entrance of the cave is flanked by sparse, vibrant green blades of grass that grow in scattered tufts, their delicate tips swaying gently in the breeze. Demen s body is a warm, earthy brown color with a subtle sheen, and its large, round eyes shine like polished onyx. Its antennae, long and slender, twitch slightly as it gazes out at the ponds glassy surface, which reflects the soft, feathery clouds drifting lazily across the sky. The atmosphere is peaceful, with a sense of stillness and anticipation, as if Demen is waiting for something to emerge from the caves depths or watching for a ripple to disturb the ponds mirrored calm.",
        "width": 688,
       "num_images": 1,
       prompt
    }
    console.log('request', request);
    const endPoint = '/v1/generations';
    return api.post(endPoint, request);
};
  
export const getImageFromGenerationId = (generationId: string):  AxiosPromise<any> => {
    const endPoint = "/v1/generations/" + generationId;
    return api.get(endPoint, {'axios-retry': {
      retries: 2
    }});
};
  