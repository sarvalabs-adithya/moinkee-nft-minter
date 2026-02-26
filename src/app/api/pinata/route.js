import axios from "axios";

const PINATA_JWT = process.env.PINATA_JWT;

export async function POST(request) {
  if (!PINATA_JWT || PINATA_JWT.trim() === "") {
    console.error("[Pinata] PINATA_JWT is not set");
    return Response.json(
      { error: "Pinata is not configured. Set PINATA_JWT in environment variables (e.g. Vercel project settings)." },
      { status: 503 }
    );
  }

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!file) {
        return Response.json({ error: "No file provided" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const pinataForm = new FormData();
      const blob = new Blob([buffer], { type: file.type });
      pinataForm.append("file", blob, file.name);

      const pinataMetadata = JSON.stringify({ name: file.name });
      pinataForm.append("pinataMetadata", pinataMetadata);

      const pinataOptions = JSON.stringify({ cidVersion: 1 });
      pinataForm.append("pinataOptions", pinataOptions);

      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        pinataForm,
        {
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
          },
          maxBodyLength: Infinity,
        }
      );

      return Response.json({ IpfsHash: response.data.IpfsHash }, { status: 200 });
    }

    if (contentType.includes("application/json")) {
      const body = await request.json();

      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          pinataContent: body,
          pinataMetadata: { name: body.name || "metadata.json" },
          pinataOptions: { cidVersion: 1 },
        },
        {
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
            "Content-Type": "application/json",
          },
        }
      );

      return Response.json({ IpfsHash: response.data.IpfsHash }, { status: 200 });
    }

    return Response.json({ error: "Unsupported content type" }, { status: 415 });
  } catch (error) {
    console.error("[Pinata Error]", error.response?.status, error.response?.data || error.message);
    const message = error.response?.data?.error?.details || error.response?.data?.error || error.message || "Upload failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
