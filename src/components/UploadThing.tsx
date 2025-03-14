// UploadThing.tsx
import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { OurFileRouter } from "@/server/uploadthing"; // שים את הנתיב האמיתי לקובץ שלך

export const { UploadButton, UploadDropzone, useUploadThing } =
  generateReactHelpers<OurFileRouter>();
