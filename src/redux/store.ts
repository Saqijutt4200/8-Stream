import { configureStore } from "@reduxjs/toolkit";
import options from "./slices/options";
import epModal from "./slices/epModal";
import { persistReducer, persistStore } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import posterUrl from "./slices/posterUrl"

const createNoopStorage = () => {
  return {
    getItem(_key: any) {
      return Promise.resolve(null);
    },
    setItem(_key: any, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: any) {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["api", "posterUrl"],
};

const optionPersistedReducer = persistReducer(persistConfig, options);
const posterUrlPersistedReducer = persistReducer(persistConfig, posterUrl);

export const store = configureStore({
  reducer: {
    options: optionPersistedReducer,
    epModal,
    posterUrl: posterUrlPersistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
