// @ts-ignore
import * as faceapiTypes from 'face-api.js';

const MODEL_URL = '/models';

// Helper to safely get the face-api.js instance (handling default export quirks)
export const getFaceApi = async () => {
    try {
        const faceapiModule = await import('face-api.js');
        // @ts-ignore
        const faceapi = faceapiModule.default || faceapiModule;
        return faceapi;
    } catch (e) {
        console.error("Failed to load face-api.js", e);
        return null;
    }
};

export const loadFaceApiModels = async () => {
    try {
        console.log("Loading Face API models...");
        const faceapi = await getFaceApi();
        if (!faceapi) return false;

        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        console.log("Face API models loaded successfully");
        return true;
    } catch (error) {
        console.error("Failed to load Face API models:", error);
        return false;
    }
};

export const detectFace = async (videoElement: HTMLVideoElement) => {
    if (!videoElement) return null;
    const faceapi = await getFaceApi();
    if (!faceapi) return null;

    // Detect single face
    const detection = await faceapi.detectSingleFace(videoElement)
        .withFaceLandmarks()
        .withFaceDescriptor();

    return detection;
};
