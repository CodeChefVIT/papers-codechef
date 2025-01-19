import '@ungap/with-resolvers';


import { Mistral } from "@mistralai/mistralai";
import {type  ExamDetail } from '@/interface';

// Type definitions


type AnalysisResult = {
  examDetail: ExamDetail;
  rawAnalysis: string;
};

type MistralResponse = {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
};

// Custom error type
class ProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProcessingError";
  }
}

// Function to ensure output directory exists
export default async function processAndAnalyze({
  imageURL,
}: {
  imageURL:string;
}) {

  if (imageURL) {
    const analysisResult = await analyzeImage(imageURL);
    return analysisResult[0]?.examDetail;
  } else {
    throw "Error Creating the Image";
  }
}
// export async function pdfToImage(file: File) {
//   // GlobalWorkerOptions.workerSrc = process.cwd() + '/public/pdf.worker.js'
//     const bytes = await file.arrayBuffer();
  
//     const buffer = Buffer.from(bytes);
//     const singlePage = await PdfToImg(buffer, {
//       returnType: "base64", // accept "base64" and "buffer"
//       imgType: "png", // accept "png" and "jpg"
//       pages: "firstPage",
//   });
//     return singlePage
//   }
// Function to convert PDF file's first page to image


// Function to convert the downloaded PDF to images
// async function convertPDFToImages(binaryData: string): Promise<string> {

//   const pdf = await  PDFDocument.load(binaryData)
//   const bytes = await (await pdf.save())
//   const buffer = Buffer.from(bytes);
//   const dataUrl = `data:${'application/pdf'};base64,${buffer.toString("base64")}`;
//   return dataUrl

// }

// Function to parse Mistral's response into ExamDetail format
function parseExamDetail(analysis: string): ExamDetail {
  try {
    // Try to find JSON in the response
    const jsonMatch = analysis.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const examDetail: ExamDetail = JSON.parse(jsonMatch[0]) as ExamDetail;
      if (examDetail.semester) {
        const validSemesters = ["Fall", "Winter", "Summer", "Weekend"];
        if (!validSemesters.includes(examDetail.semester)) {
          examDetail.semester = "Fall"; // Default to Fall if invalid
        }
      }
      
      if (examDetail.year) {
        const yearPattern = /^\d{4}$/;
        if (!yearPattern.test(examDetail.year)) {
          examDetail.year = new Date().getFullYear().toString(); // Default to current year if invalid
        }
      }
      return examDetail
    }

    throw new Error("Could not parse exam details from response");
  } catch (error) {
    console.error("Error parsing exam details:", error);
    return {
      "course-name": "Unknown",
      slot: "Unknown",
      "course-code": "Unknown",
      "exam-type": "Unknown",
      semester: "Fall",
      year: new Date().getFullYear().toString() 
    };
  }
}

// Function to analyze images using Mistral AI
async function analyzeImage(dataUrl: string): Promise<AnalysisResult[]> {
  try {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new ProcessingError("MISTRAL_API_KEY environment variable not set");
    }
    const client = new Mistral({ apiKey });

    const results: AnalysisResult[] = [];

    // const dataUrl = `data:image/png;base64,${imageBase64}`;

    const prompt = `Please analyze this exam paper image and extract the following details in JSON format:
    - course-name: The full name of the course (3-4 words, no numbers or special characters)
    - slot: One of A1|A2|B1|B2|C1|C2|D1|D2|E1|E2|F1|F2|G1|G2
    - course-code: The course code (format: department letters + numbers)
    - exam-type: One of "Final Assessment Test|Continuous Assessment Test - 1|Continuous Assessment Test - 2"
    - semester: Must be exactly one of "Fall", "Winter", "Summer", or "Weekend"
    - year: The year in YYYY format (e.g., "2023")
    
    Provide the response in this exact format:
    {
        "course-name": "...",
        "slot": "...",
        "course-code": "...",
        "exam-type": "...",
        "semester": "...",
        "year": "..."
    }`;

    const chatResponse = (await client.chat.complete({
      model: "pixtral-12b",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", imageUrl: dataUrl },
          ],
        },
      ],
    })) as MistralResponse;

    if (!chatResponse?.choices?.[0]?.message?.content) {
      throw new ProcessingError("Invalid response from Mistral API");
    }

    const rawAnalysis = chatResponse.choices[0].message.content;
    const examDetail: ExamDetail = parseExamDetail(rawAnalysis);

    results.push({
      examDetail,
      rawAnalysis,
    });

    return results;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error analyzing images:", errorMessage);

    return [
      {
        examDetail: {
          "course-name": "Error",
          slot: "Error",
          "course-code": "Error",
          "exam-type": "Error",
          semester: "Fall", 
          year: new Date().getFullYear().toString()
        },
        rawAnalysis: `Error analyzing image: ${errorMessage}`,
      },
    ];
  }
}
// Main function to process everything
// async function processPDFAndAnalyze(pdfUrl: string): Promise<void> {
//     try {
//         // Convert PDF to images and get the output directory
//         const outputDir = await convertPDFToImages(pdfUrl);

//         // Analyze all the generated images
//         const analysisResults = await analyzeImages(outputDir);

//         // Save results to a JSON file
//         const resultsPath = join(outputDir, 'analysis_results.json');
//         fs.writeFileSync(
//             resultsPath,
//             JSON.stringify(analysisResults, null, 2)
//         );

//         console.log('Analysis completed. Results saved to:', resultsPath);

//         // Log results to console
//         analysisResults.forEach(result => {
//             console.log(`\nAnalysis for ${result.imageName}:`);
//             console.log('Exam Details:', result.examDetail);
//             console.log('Raw Analysis:', result.rawAnalysis);
//         });

//     } catch (error: unknown) {
//         const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
//         console.error('Error in processing:', errorMessage);
//         throw new ProcessingError(errorMessage);
//     }
// }

// Example usage - Replace with your PDF URL
// const pdfUrl =
//   "https://res.cloudinary.com/dtorpaj1c/image/upload/v1731668830/papers/mykcs2yxaman61kx0jvj.pdf";

// Run the complete process
// processPDFAndAnalyze(pdfUrl)
// .then(() => console.log('Complete processing finished'))
// .catch(error => console.error('Processing failed:', error));

// Function to download the PDF from the URL

// async function downloadPDF(url: string): Promise<string> {
//     try {
//         const tmpFile = tmp.fileSync({ postfix: '.pdf' });
//         const response = await axios({
//             method: 'GET',
//             url,
//             responseType: 'arraybuffer',
//         });
//         fs.writeFileSync(tmpFile.name, response.data);
//         return tmpFile.name;
//     } catch (error: unknown) {
//         const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
//         console.error('Error downloading PDF:', errorMessage);
//         throw new ProcessingError(errorMessage);
//     }
// }

// // Function to convert image to base64
// function imageToBase64(image: Buffer): string {
//   try {
//     return Buffer.from(image).toString("base64");
//   } catch (error: unknown) {
//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown error occurred";
//     throw new ProcessingError(
//       `Error converting image to base64: ${errorMessage}`,
//     );
//   }
// }
