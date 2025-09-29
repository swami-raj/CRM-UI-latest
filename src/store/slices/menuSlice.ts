import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { MenuControllerService } from "../../api/generated/services/MenuControllerService";
import type { MenuListResponse } from "../../api/generated/models/MenuListResponse";

export const fetchMenu = createAsyncThunk("menu/fetch", async () => {
  const response = await MenuControllerService.getAllMenusWithSubmenus();
  return response.data; // ✅ unwrap .data
});

const menuSlice = createSlice({
  name: "menu",
  initialState: {
    items: [] as MenuListResponse[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenu.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch menu";
      });
  },
});

export default menuSlice.reducer;
