import React, {
    createContext,
    useContext,
    useReducer,
    ReactNode,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import Animal from "../../domain/entities/animal.entity";
import { catalogService } from "../../services/catalog/catalog.service";
import { useAuth } from "./auth-context";

// 1. Define State and Actions
interface State {
    isLoading: boolean;
    error: string | null;
    catalog: Animal[];
}

type Action =
    | { type: "FETCH_ALL_START" }
    | { type: "FETCH_ALL_SUCCESS"; payload: Animal[] }
    | { type: "FETCH_ALL_FAILURE"; payload: string }
    | { type: "RESET" };

interface CatalogContextType extends State {
    fetchCatalog: () => Promise<void>;
    reset: () => void;
}

// 2. Initial State and Reducer
const initialState: State = {
    isLoading: false,
    error: null,
    catalog: [],
};

const catalogReducer = (state: State, action: Action): State => {
    switch (action.type) {
        case "FETCH_ALL_START":
            return { ...state, isLoading: true, error: null };
        case "FETCH_ALL_SUCCESS":
            return { ...state, isLoading: false, catalog: action.payload };
        case "FETCH_ALL_FAILURE":
            return { ...state, isLoading: false, error: action.payload };
        case "RESET":
            return initialState;
        default:
            return state;
    }
};

// 3. Create Context
const CatalogContext = createContext<CatalogContextType | undefined>(
    undefined
);

// 4. Create Provider Component
export const CatalogProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [state, dispatch] = useReducer(catalogReducer, initialState);

    const fetchCatalog = useCallback(async () => {
        if (!user) {
            dispatch({ type: "RESET" });
            return; 
        }
        dispatch({ type: "FETCH_ALL_START" });
        try {
            const data = await catalogService.getAllCatalogs(1, 10);
            console.log("[CatalogContext] Catalog", data);
            dispatch({ type: "FETCH_ALL_SUCCESS", payload: data });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "An unknown error occurred";
            dispatch({ type: "FETCH_ALL_FAILURE", payload: errorMessage });
        }
    }, [user]);

    useEffect(() => {
        fetchCatalog();
    }, [fetchCatalog, user]);

    const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

    const contextValue = useMemo<CatalogContextType>(() => ({
        ...state,
        fetchCatalog,
        reset,
    }), [
        state,
        fetchCatalog,
        reset
    ]);

    return (
        <CatalogContext.Provider value={contextValue}>
            {children}
        </CatalogContext.Provider>
    );
};

// 5. Create custom hook for easy access
export const useCatalog = () => {
    const context = useContext(CatalogContext);
    if (context === undefined) {
        throw new Error("useCatalog must be used within a CatalogProvider");
    }
    return context;
};