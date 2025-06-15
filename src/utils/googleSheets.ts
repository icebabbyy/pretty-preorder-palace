import { Product } from "@/types/inventory"; // corrected import

export const appendDataToSheet = async (data: Product) => {
  const apiUrl = process.env.NEXT_PUBLIC_SHEET_API_URL;

  if (!apiUrl) {
    console.error("Sheet API URL is not defined in environment variables.");
    return;
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      mode: 'no-cors',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return;
    }

    const result = await response.json();
    console.log("Success:", result);
  } catch (error) {
    console.error("There was an error!", error);
  }
};
