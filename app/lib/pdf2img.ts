export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

// Initialize PDF.js worker configuration
async function initializePdfJs() {
    try {
        // Try to set the worker source before loading
        if (typeof window !== 'undefined') {
            const workerUrl = new URL('/pdf.worker.min.mjs', window.location.origin).href;
            console.log('Setting PDF.js worker URL to:', workerUrl);
        }
    } catch (error) {
        console.warn('Failed to pre-configure PDF.js worker:', error);
    }
}

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    isLoading = true;
    
    // Initialize worker configuration
    await initializePdfJs();
    
    // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
    loadPromise = import("pdfjs-dist/build/pdf.mjs").then(async (lib) => {
        // Use CDN worker with exact matching version to ensure compatibility
        const version = "5.3.93"; // Match the installed package version
        lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
        
        console.log('PDF.js library version:', lib.version);
        console.log('PDF.js worker source set to CDN version:', version);
        
        pdfjsLib = lib;
        isLoading = false;
        return lib;
    }).catch((error) => {
        console.error('Failed to load PDF.js:', error);
        isLoading = false;
        throw error;
    });

    return loadPromise;
}

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        console.log('Starting PDF to image conversion for:', file.name);
        
        const lib = await loadPdfJs();
        console.log('PDF.js library loaded successfully');

        const arrayBuffer = await file.arrayBuffer();
        console.log('PDF file read as array buffer, size:', arrayBuffer.byteLength);
        
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
        console.log('PDF document loaded, pages:', pdf.numPages);
        
        const page = await pdf.getPage(1);
        console.log('First page loaded');

        const viewport = page.getViewport({ scale: 4 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        console.log('Canvas created with dimensions:', viewport.width, 'x', viewport.height);

        if (context) {
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";
        }

        await page.render({ canvasContext: context!, viewport }).promise;
        console.log('Page rendered to canvas successfully');

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        // Create a File from the blob with the same name as the pdf
                        const originalName = file.name.replace(/\.pdf$/i, "");
                        const imageFile = new File([blob], `${originalName}.png`, {
                            type: "image/png",
                        });

                        resolve({
                            imageUrl: URL.createObjectURL(blob),
                            file: imageFile,
                        });
                        console.log('PDF converted to image successfully');
                    } else {
                        console.error('Failed to create image blob');
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Failed to create image blob",
                        });
                    }
                },
                "image/png",
                1.0
            ); // Set quality to maximum (1.0)
        });
    } catch (err) {
        console.error('PDF to image conversion error:', err);
        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF: ${err}`,
        };
    }
}