export const handleCommonErrors = (error: any, addToast: Function) => {
    if (error.code === 'UNAUTHORIZED') {
        addToast("Unauthorized Access", { appearance: "error", autoDismiss: true });
    }
    else if (error.code === 'ERR_NETWORK' || error.code === 'ERR_INTERNET_DISCONNECTED') {
        if (!navigator.onLine) {
            addToast("It seems you're offline. Please check your internet connection.", { appearance: "error", autoDismiss: true });
        } else {
            const errorMsg = error?.msg ? `: ${error.msg}` : '';
            addToast(`Your network may have changed or the server is unavailable. Please try again.${errorMsg}.`, { appearance: "error", autoDismiss: true });
            console.log(error);
        }
    }
    else if (error.code === 'SESSION_EXPIRED') {
        addToast("Session Expired !!. Please login again.", { appearance: "error", autoDismiss: true });
        Cookies.remove('authToken');
        Cookies.remove('userDetails');
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    } else {
        addToast(error.message || 'An error occurred', { appearance: "error", autoDismiss: true });
    }
};

export const compressImage = async (imagebase64: string): Promise<string> => {
    // Convert base64 image to HTMLImageElement
    const img = new Image();
    img.src = imagebase64;

    // Function to convert image to base64
    const imageToBase64 = (image: HTMLImageElement, maxWidth: number, maxHeight: number): Promise<string> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(imagebase64); // fallback to original if canvas 2d context is not supported
                return;
            }

            // Calculate new dimensions maintaining aspect ratio
            let width = image.width;
            let height = image.height;

            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }

            if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
            }

            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;

            // Draw image on canvas
            ctx.drawImage(image, 0, 0, width, height);

            // Get base64 representation
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // Adjust quality as needed

            resolve(compressedBase64);
        });
    };

    // Ensure image is loaded before processing
    await new Promise<void>((resolve) => {
        img.onload = () => resolve();
    });

    // Maximum allowed size in bytes (4 MB)
    const maxSizeBytes = 4 * 1024 * 1024;

    // Check if the size is greater than maxSizeBytes
    if (imagebase64.length > maxSizeBytes) {
        // Convert image to base64 with reduced dimensions and quality
        return await imageToBase64(img, 1200, 1200); // Adjust maximum dimensions as needed
    } else {
        // Return original base64 string if within size limit
        return imagebase64;
    }
};