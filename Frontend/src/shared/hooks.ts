import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../App/app.store";

/** Pre-typed dispatch hook */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/** Pre-typed selector hook */
export const useAppSelector = useSelector.withTypes<RootState>();
