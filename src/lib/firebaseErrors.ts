/**
 * Maps Firebase Auth error codes to user-friendly messages.
 * Prevents leaking internal Firebase error details to the UI.
 */

const firebaseErrorMap: Record<string, string> = {
    // Sign-in errors
    "auth/user-not-found": "No account found with this email address.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled": "This account has been disabled. Contact support.",

    // Sign-up errors
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password is too weak. Use at least 6 characters with a mix of letters and numbers.",
    "auth/operation-not-allowed": "This sign-in method is not enabled.",

    // Rate limiting
    "auth/too-many-requests": "Too many failed attempts. Please try again later.",

    // Network
    "auth/network-request-failed": "Network error. Please check your connection.",

    // General
    "auth/internal-error": "An unexpected error occurred. Please try again.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
};

export const getAuthErrorMessage = (error: unknown): string => {
    if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        typeof (error as { code: unknown }).code === "string"
    ) {
        const code = (error as { code: string }).code;
        return firebaseErrorMap[code] ?? "An unexpected error occurred. Please try again.";
    }

    return "An unexpected error occurred. Please try again.";
};
