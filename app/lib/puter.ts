import { create } from "zustand";

declare global {
    interface Window {
        puter: {
            auth: {
                getUser: () => Promise<PuterUser>;
                isSignedIn: () => Promise<boolean>;
                signIn: () => Promise<void>;
                signOut: () => Promise<void>;
            };
            fs: {
                write: (
                    path: string,
                    data: string | File | Blob
                ) => Promise<File | undefined>;
                read: (path: string) => Promise<Blob>;
                upload: (file: File[] | Blob[]) => Promise<FSItem>;
                delete: (path: string) => Promise<void>;
                readdir: (path: string) => Promise<FSItem[] | undefined>;
            };
            ai: {
                chat: (
                    prompt: string | ChatMessage[],
                    imageURL?: string | PuterChatOptions,
                    testMode?: boolean,
                    options?: PuterChatOptions
                ) => Promise<Object>;
                img2txt: (
                    image: string | File | Blob,
                    testMode?: boolean
                ) => Promise<string>;
            };
            kv: {
                get: (key: string) => Promise<string | null>;
                set: (key: string, value: string) => Promise<boolean>;
                delete: (key: string) => Promise<boolean>;
                list: (pattern: string, returnValues?: boolean) => Promise<string[]>;
                flush: () => Promise<boolean>;
            };
        };
    }
}

interface PuterStore {
    isLoading: boolean;
    error: string | null;
    puterReady: boolean;
    auth: {
        user: PuterUser | null;
        isAuthenticated: boolean;
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
        refreshUser: () => Promise<void>;
        checkAuthStatus: () => Promise<boolean>;
        getUser: () => PuterUser | null;
    };
    fs: {
        write: (
            path: string,
            data: string | File | Blob
        ) => Promise<File | undefined>;
        read: (path: string) => Promise<Blob | undefined>;
        upload: (file: File[] | Blob[]) => Promise<FSItem | undefined>;
        delete: (path: string) => Promise<void>;
        readDir: (path: string) => Promise<FSItem[] | undefined>;
    };
    ai: {
        chat: (
            prompt: string | ChatMessage[],
            imageURL?: string | PuterChatOptions,
            testMode?: boolean,
            options?: PuterChatOptions
        ) => Promise<AIResponse | undefined>;
        feedback: (
            path: string,
            message: string
        ) => Promise<AIResponse | undefined>;
        img2txt: (
            image: string | File | Blob,
            testMode?: boolean
        ) => Promise<string | undefined>;
    };
    kv: {
        get: (key: string) => Promise<string | null | undefined>;
        set: (key: string, value: string) => Promise<boolean | undefined>;
        delete: (key: string) => Promise<boolean | undefined>;
        list: (
            pattern: string,
            returnValues?: boolean
        ) => Promise<string[] | KVItem[] | undefined>;
        flush: () => Promise<boolean | undefined>;
    };

    init: () => void;
    clearError: () => void;
}

const getPuter = (): typeof window.puter | null =>
    typeof window !== "undefined" && window.puter ? window.puter : null;

// AI Model configurations with priority and capabilities
const AI_MODELS = {
    // Premium models (best quality)
    premium: [
        { name: "claude-3-5-sonnet-20241022", provider: "Anthropic", tier: "premium" },
        { name: "gpt-4o", provider: "OpenAI", tier: "premium" },
        { name: "claude-3-7-sonnet", provider: "Anthropic", tier: "premium" },
    ],
    // Balanced models (good quality, better availability)
    balanced: [
        { name: "gpt-4o-mini", provider: "OpenAI", tier: "balanced" },
        { name: "claude-3-haiku-20240307", provider: "Anthropic", tier: "balanced" },
        { name: "gemini-1.5-pro", provider: "Google", tier: "balanced" },
        { name: "gemini-1.5-flash", provider: "Google", tier: "balanced" },
    ],
    // Free tier friendly models
    freeTier: [
        { name: "llama-3.1-405b-instruct", provider: "Meta", tier: "free" },
        { name: "llama-3.1-70b-instruct", provider: "Meta", tier: "free" },
        { name: "mistral-large-latest", provider: "Mistral", tier: "free" },
        { name: "qwen2.5-72b-instruct", provider: "Qwen", tier: "free" },
    ]
};

// Get models in order of preference for different use cases
const getModelList = (useCase: 'feedback' | 'chat' = 'chat'): string[] => {
    if (useCase === 'feedback') {
        // For feedback, prioritize quality over speed
        return [
            ...AI_MODELS.premium.map(m => m.name),
            ...AI_MODELS.balanced.map(m => m.name),
            ...AI_MODELS.freeTier.map(m => m.name)
        ];
    } else {
        // For general chat, prioritize speed and availability
        return [
            ...AI_MODELS.balanced.map(m => m.name),
            ...AI_MODELS.freeTier.map(m => m.name),
            ...AI_MODELS.premium.map(m => m.name)
        ];
    }
};

export const usePuterStore = create<PuterStore>((set, get) => {
    const setError = (msg: string) => {
        console.error("[Puter Store] Error occurred:", msg);
        set({
            error: msg,
            isLoading: false,
            auth: {
                user: null,
                isAuthenticated: false,
                signIn: get().auth.signIn,
                signOut: get().auth.signOut,
                refreshUser: get().auth.refreshUser,
                checkAuthStatus: get().auth.checkAuthStatus,
                getUser: get().auth.getUser,
            },
        });
    };

    const checkAuthStatus = async (): Promise<boolean> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return false;
        }

        set({ isLoading: true, error: null });

        try {
            const isSignedIn = await puter.auth.isSignedIn();
            if (isSignedIn) {
                const user = await puter.auth.getUser();
                set({
                    auth: {
                        user,
                        isAuthenticated: true,
                        signIn: get().auth.signIn,
                        signOut: get().auth.signOut,
                        refreshUser: get().auth.refreshUser,
                        checkAuthStatus: get().auth.checkAuthStatus,
                        getUser: () => user,
                    },
                    isLoading: false,
                });
                return true;
            } else {
                set({
                    auth: {
                        user: null,
                        isAuthenticated: false,
                        signIn: get().auth.signIn,
                        signOut: get().auth.signOut,
                        refreshUser: get().auth.refreshUser,
                        checkAuthStatus: get().auth.checkAuthStatus,
                        getUser: () => null,
                    },
                    isLoading: false,
                });
                return false;
            }
        } catch (err) {
            const technicalMsg = err instanceof Error ? err.message : "Failed to check auth status";
            console.error("[Auth] Authentication check failed:", technicalMsg);
            setError("Unable to verify your login status. Please try refreshing the page.");
            return false;
        }
    };

    const signIn = async (): Promise<void> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }

        set({ isLoading: true, error: null });

        try {
            await puter.auth.signIn();
            await checkAuthStatus();
        } catch (err) {
            const technicalMsg = err instanceof Error ? err.message : "Sign in failed";
            console.error("[Auth] Sign in attempt failed:", technicalMsg);
            setError("Unable to sign in. Please try again or check your connection.");
        }
    };

    const signOut = async (): Promise<void> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }

        set({ isLoading: true, error: null });

        try {
            await puter.auth.signOut();
            set({
                auth: {
                    user: null,
                    isAuthenticated: false,
                    signIn: get().auth.signIn,
                    signOut: get().auth.signOut,
                    refreshUser: get().auth.refreshUser,
                    checkAuthStatus: get().auth.checkAuthStatus,
                    getUser: () => null,
                },
                isLoading: false,
            });
        } catch (err) {
            const technicalMsg = err instanceof Error ? err.message : "Sign out failed";
            console.error("[Auth] Sign out attempt failed:", technicalMsg);
            setError("Unable to sign out. Please try again.");
        }
    };

    const refreshUser = async (): Promise<void> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const user = await puter.auth.getUser();
            set({
                auth: {
                    user,
                    isAuthenticated: true,
                    signIn: get().auth.signIn,
                    signOut: get().auth.signOut,
                    refreshUser: get().auth.refreshUser,
                    checkAuthStatus: get().auth.checkAuthStatus,
                    getUser: () => user,
                },
                isLoading: false,
            });
        } catch (err) {
            const technicalMsg = err instanceof Error ? err.message : "Failed to refresh user";
            console.error("[Auth] User refresh failed:", technicalMsg);
            setError("Unable to update your account information. Please try signing in again.");
        }
    };

    const init = (): void => {
        const puter = getPuter();
        if (puter) {
            set({ puterReady: true });
            checkAuthStatus();
            return;
        }

        const interval = setInterval(() => {
            if (getPuter()) {
                clearInterval(interval);
                set({ puterReady: true });
                checkAuthStatus();
            }
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            if (!getPuter()) {
                console.error("[Init] Puter.js failed to load within timeout period");
                setError("Application failed to initialize. Please refresh the page.");
            }
        }, 10000);
    };

    const write = async (path: string, data: string | File | Blob) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.fs.write(path, data);
    };

    const readDir = async (path: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.fs.readdir(path);
    };

    const readFile = async (path: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.fs.read(path);
    };

    const upload = async (files: File[] | Blob[]) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.fs.upload(files);
    };

    const deleteFile = async (path: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.fs.delete(path);
    };

    const chat = async (
        prompt: string | ChatMessage[],
        imageURL?: string | PuterChatOptions,
        testMode?: boolean,
        options?: PuterChatOptions
    ) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }

        // Get models optimized for general chat
        let models = getModelList('chat');

        // If specific model is requested in options, try that first
        if (options?.model || (typeof imageURL === 'object' && imageURL?.model)) {
            const requestedModel = options?.model || (typeof imageURL === 'object' ? imageURL?.model : undefined);
            if (requestedModel) {
                // Put requested model first, then fallback to others
                models = [requestedModel, ...models.filter(m => m !== requestedModel)];
            }
        }

        // Try each model in sequence until one succeeds
        for (let i = 0; i < models.length; i++) {
            const model = models[i];
            const modelInfo = [...AI_MODELS.premium, ...AI_MODELS.balanced, ...AI_MODELS.freeTier]
                .find(m => m.name === model);
            
            console.log(`[AI Chat] Attempting ${modelInfo?.provider} ${model} (${modelInfo?.tier}) - ${i + 1}/${models.length}`);
            
            try {
                // Create options with current model
                let currentOptions: PuterChatOptions;
                if (typeof imageURL === 'object') {
                    currentOptions = { ...imageURL, model };
                } else {
                    currentOptions = { ...options, model };
                }

                const response = await puter.ai.chat(prompt, typeof imageURL === 'string' ? imageURL : currentOptions, testMode, currentOptions);
                console.log(`[AI Chat] Successfully connected to ${modelInfo?.provider} ${model}`);
                return response as AIResponse | undefined;
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.warn(`[AI Chat] ${modelInfo?.provider} ${model} failed: ${errorMsg}`);
                
                // Check if it's a rate limit or quota error
                const isRateLimit = errorMsg.toLowerCase().includes('rate') || 
                                   errorMsg.toLowerCase().includes('quota') || 
                                   errorMsg.toLowerCase().includes('limit') ||
                                   errorMsg.toLowerCase().includes('usage');
                
                if (isRateLimit) {
                    console.log(`[AI Chat] Rate limit reached for ${model}, switching to backup model`);
                } else {
                    console.log(`[AI Chat] Connection failed for ${model}, trying alternative provider`);
                }
                
                // If this is the last model, throw the error
                if (i === models.length - 1) {
                    console.error(`[AI Chat] All AI providers exhausted. Final error from ${model}:`, error);
                    setError("AI service is currently unavailable. Please try again in a few minutes.");
                    throw new Error("AI service temporarily unavailable");
                }
                
                // Add shorter delay for chat (more responsive)
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        return undefined;
    };

    const feedback = async (path: string, message: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }

        // Get models optimized for feedback analysis
        const models = getModelList('feedback');
        
        const chatPayload: ChatMessage[] = [
            {
                role: "user" as const,
                content: [
                    {
                        type: "file",
                        puter_path: path,
                    },
                    {
                        type: "text",
                        text: message,
                    },
                ],
            },
        ];

        // Try each model in sequence until one succeeds
        for (let i = 0; i < models.length; i++) {
            const model = models[i];
            const modelInfo = [...AI_MODELS.premium, ...AI_MODELS.balanced, ...AI_MODELS.freeTier]
                .find(m => m.name === model);
            
            console.log(`[AI Analysis] Attempting ${modelInfo?.provider} ${model} (${modelInfo?.tier}) - ${i + 1}/${models.length}`);
            
            try {
                const response = await puter.ai.chat(chatPayload, { model });
                console.log(`[AI Analysis] Successfully connected to ${modelInfo?.provider} ${model}`);
                return response as AIResponse | undefined;
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.warn(`[AI Analysis] ${modelInfo?.provider} ${model} failed: ${errorMsg}`);
                
                // Check if it's a rate limit or quota error
                const isRateLimit = errorMsg.toLowerCase().includes('rate') || 
                                   errorMsg.toLowerCase().includes('quota') || 
                                   errorMsg.toLowerCase().includes('limit') ||
                                   errorMsg.toLowerCase().includes('usage');
                
                const isServerError = errorMsg.toLowerCase().includes('server') ||
                                     errorMsg.toLowerCase().includes('503') ||
                                     errorMsg.toLowerCase().includes('502') ||
                                     errorMsg.toLowerCase().includes('timeout');
                
                if (isRateLimit) {
                    console.log(`[AI Analysis] Rate limit reached for ${model}, switching to backup provider`);
                } else if (isServerError) {
                    console.log(`[AI Analysis] Server error detected for ${model}, trying alternative service`);
                } else {
                    console.log(`[AI Analysis] Connection failed for ${model}, attempting fallback provider`);
                }
                
                // If this is the last model, throw the error
                if (i === models.length - 1) {
                    console.error(`[AI Analysis] All AI providers exhausted. Final error from ${model}:`, error);
                    setError("Resume analysis service is currently unavailable. Please try again later.");
                    throw new Error("Resume analysis temporarily unavailable");
                }
                
                // Add exponential backoff delay for better reliability
                const delay = Math.min(1000 * Math.pow(2, Math.min(i, 4)), 5000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        return undefined;
    };

    const img2txt = async (image: string | File | Blob, testMode?: boolean) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.ai.img2txt(image, testMode);
    };

    const getKV = async (key: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.kv.get(key);
    };

    const setKV = async (key: string, value: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.kv.set(key, value);
    };

    const deleteKV = async (key: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        // Try different possible method names for delete
        if (typeof puter.kv.delete === 'function') {
            return puter.kv.delete(key);
        } else if (typeof (puter.kv as any).del === 'function') {
            return (puter.kv as any).del(key);
        } else if (typeof (puter.kv as any).remove === 'function') {
            return (puter.kv as any).remove(key);
        } else {
            console.error("No delete method found on puter.kv:", Object.keys(puter.kv));
            setError("KV delete operation not supported");
            return false;
        }
    };

    const listKV = async (pattern: string, returnValues?: boolean) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        if (returnValues === undefined) {
            returnValues = false;
        }
        return puter.kv.list(pattern, returnValues);
    };

    const flushKV = async () => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.kv.flush();
    };

    return {
        isLoading: true,
        error: null,
        puterReady: false,
        auth: {
            user: null,
            isAuthenticated: false,
            signIn,
            signOut,
            refreshUser,
            checkAuthStatus,
            getUser: () => get().auth.user,
        },
        fs: {
            write: (path: string, data: string | File | Blob) => write(path, data),
            read: (path: string) => readFile(path),
            readDir: (path: string) => readDir(path),
            upload: (files: File[] | Blob[]) => upload(files),
            delete: (path: string) => deleteFile(path),
        },
        ai: {
            chat: (
                prompt: string | ChatMessage[],
                imageURL?: string | PuterChatOptions,
                testMode?: boolean,
                options?: PuterChatOptions
            ) => chat(prompt, imageURL, testMode, options),
            feedback: (path: string, message: string) => feedback(path, message),
            img2txt: (image: string | File | Blob, testMode?: boolean) =>
                img2txt(image, testMode),
        },
        kv: {
            get: (key: string) => getKV(key),
            set: (key: string, value: string) => setKV(key, value),
            delete: (key: string) => deleteKV(key),
            list: (pattern: string, returnValues?: boolean) =>
                listKV(pattern, returnValues),
            flush: () => flushKV(),
        },
        init,
        clearError: () => set({ error: null }),
    };
});

// Export utility functions for direct use
export const exportDeleteKV = async (key: string) => {
    const puter = (window as any).puter;
    if (!puter) {
        console.error("Puter.js not available");
        return false;
    }
    // Try different possible method names for delete
    if (typeof puter.kv.delete === 'function') {
        return puter.kv.delete(key);
    } else if (typeof (puter.kv as any).del === 'function') {
        return (puter.kv as any).del(key);
    } else if (typeof (puter.kv as any).remove === 'function') {
        return (puter.kv as any).remove(key);
    } else {
        console.error("No delete method found on puter.kv:", Object.keys(puter.kv));
        return false;
    }
};