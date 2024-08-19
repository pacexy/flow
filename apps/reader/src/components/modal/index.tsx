import { AnimatePresence, motion } from "framer-motion";
import Image from 'next/image';
import { SetStateAction, useEffect, useState } from "react";

import { generationsApi, getImageFromGenerationId } from "@flow/reader/services/images";

interface Props {
  isOpen: boolean;
  setIsOpen: SetStateAction<any>;
  onCancel: () => void;
  prompt?: string;
}

const Modal = ({ isOpen, setIsOpen, onCancel, prompt }: Props) => {
  console.log('prompt request', prompt);
  const [image, setImage] = useState(undefined);
  useEffect(() => {
    async function generateImageFromAI() {
      try {
        const response = await generationsApi(prompt);
        console.log('response generateImageFromAI', response);
        const generationId = response.data.sdGenerationJob?.generationId;
        await getImageFromGenerationId(generationId);
        setTimeout(async () => {
          console.log('response generationId', generationId);
          const responseImage = await getImageFromGenerationId(generationId);
            const images = responseImage.data?.generations_by_pk?.generated_images;
            if (images && images.length > 0) {
              setImage(images[0].url);
            }
          console.log('responseImage generateImageFromAI', responseImage);
        }, 4000);
      } catch (error) {
        console.log('error');
      }
    }
    if (isOpen) {
      generateImageFromAI()
    }
  }, [isOpen]);

  const imageDisplay = () => {
    if (image) {
      return (
        <Image
        src={image}
        alt="ai-image"
        width={0}
        height={0}
        sizes="100vw"
        objectFit={"contain"}
        style={{
          width: "100%",
          minWidth: "200px",
          maxHeight: "300px",
        }}
      />
      )
    }
  }
  const loadingGeneration = () => {
    if (!image) {
      return (
        <motion.div
        initial={{ scale: 0, rotate: "12.5deg" }}
        animate={{ scale: 1, rotate: "0deg" }}
        exit={{ scale: 0, rotate: "0deg" }}
        onClick={(e) => e.stopPropagation()}
        className="relative  max-w-lg cursor-default overflow-hidden  text-white  items-center justify-center flex mb-6"
      >
        <div className="relative z-10">
          <div className="flex aspect-square w-24 flex-col items-center justify-center ">
            <div className="flex justify-center">
              <svg
                className="animate-spin border-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
              >
                <g id="Group 1000003698">
                  <circle
                    id="Ellipse 713"
                    cx="19.9997"
                    cy="19.9277"
                    r="15"
                    stroke="#E5E7EB"
                    strokeWidth="2"
                  />
                  <path
                    id="Ellipse 714"
                    d="M26.3311 33.528C29.9376 31.8488 32.7294 28.8058 34.0923 25.0683C35.4552 21.3308 35.2775 17.2049 33.5984 13.5984C31.9193 9.99189 28.8762 7.20011 25.1387 5.83723C21.4012 4.47434 17.2754 4.652 13.6689 6.33112"
                    stroke="url(#paint0_linear_13416_7408)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <linearGradient
                    id="paint0_linear_13416_7408"
                    x1="0.0704424"
                    y1="12.6622"
                    x2="12.7327"
                    y2="39.8591"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#4F46E5" />
                    <stop offset="1" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="text-sm font-normal leading-snug text-white mt-4">
            Generating...
            </span>
          </div>
        </div>
      </motion.div>
      )
    }
  }
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[9999] grid cursor-pointer place-items-center overflow-y-scroll bg-slate-900/20 p-8 backdrop-blur"
        >
          <motion.div
            initial={{ scale: 0, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg cursor-default overflow-hidden rounded-lg  bg-gray-500 bg-gradient-to-br p-6 text-white shadow-xl"
          >
            <div className="relative z-10">
          {loadingGeneration()}
          {imageDisplay()}
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="w-full rounded bg-transparent py-2 font-semibold text-gray-light transition-colors hover:bg-white/10"
            >
              Close
            </button>
          </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
