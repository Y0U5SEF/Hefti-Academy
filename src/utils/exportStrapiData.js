// src/utils/exportStrapiData.js
import fs from "fs/promises";
import path from "path";

const STRAPI_URL = "http://localhost:1337";
const SUPPORTED_LANGUAGES = ["en", "ar"]; // Add all your supported languages
const OUTPUT_DIR = path.join(process.cwd(), "src", "data");
const IMAGES_DIR = path.join(process.cwd(), "public", "images", "slides");

async function fetchStrapiData(endpoint, locale) {
  const response = await fetch(
    `${STRAPI_URL}/api/${endpoint}?populate=*&locale=${locale}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint} for locale ${locale}`);
  }
  return response.json();
}

async function downloadImage(imageUrl, filename) {
  const response = await fetch(`${STRAPI_URL}${imageUrl}`);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${imageUrl}`);
  }

  const buffer = await response.arrayBuffer();
  await fs.writeFile(path.join(IMAGES_DIR, filename), Buffer.from(buffer));
}

async function exportStrapiData() {
  try {
    // Create directories if they don't exist
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.mkdir(IMAGES_DIR, { recursive: true });

    // Fetch data for all supported languages
    const allData = { data: [] };

    for (const locale of SUPPORTED_LANGUAGES) {
      const { data } = await fetchStrapiData("slides", locale);

      // Process each slide
      for (const slide of data) {
        // Download images if they exist
        if (slide.attributes.image?.data) {
          const images = Array.isArray(slide.attributes.image.data)
            ? slide.attributes.image.data
            : [slide.attributes.image.data];

          for (const image of images) {
            const formats = image.attributes.formats;
            for (const [format, data] of Object.entries(formats)) {
              const filename = data.url.split("/").pop();
              await downloadImage(data.url, filename);
            }
          }
        }

        // Transform the data structure
        allData.data.push({
          id: slide.id,
          locale: locale,
          order: slide.attributes.order || 0,
          title: slide.attributes.title,
          description: slide.attributes.description,
          image: slide.attributes.image?.data
            ? [
                {
                  formats: Object.entries(
                    slide.attributes.image.data[0].attributes.formats
                  ).reduce(
                    (acc, [format, data]) => ({
                      ...acc,
                      [format]: {
                        url: `/images/slides/${data.url.split("/").pop()}`,
                      },
                    }),
                    {}
                  ),
                },
              ]
            : [],
        });
      }
    }

    // Save the JSON file
    await fs.writeFile(
      path.join(OUTPUT_DIR, "slides.json"),
      JSON.stringify(allData, null, 2)
    );

    console.log("Successfully exported Strapi data and images!");
  } catch (error) {
    console.error("Error exporting Strapi data:", error);
    process.exit(1);
  }
}

// You can run this directly with Node.js
if (require.main === module) {
  exportStrapiData();
}

export default exportStrapiData;
