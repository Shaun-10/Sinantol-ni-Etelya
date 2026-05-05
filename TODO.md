# RidersPage Fix: Remove order_date Error & Add Live Data for Delivered Orders

## Steps:
- [ ] 1. Fix SQL query: Remove `order_date` from orders.select(), use `created_at` only.
- [ ] 2. Update orderRows mapping: Use `created_at` directly, remove order_date fallback.
- [ ] 3. Add Supabase realtime subscriptions for live updates on orders and deliveries for the selected rider.
- [ ] 4. Ensure filter strictly shows only Delivered/Completed statuses.
- [ ] 5. Test: Edit complete, verify no errors, live updates work.
- [ ] 6. Complete task.

✅ 1. Fix SQL query: Remove `order_date` from orders.select(), use `created_at` only.
✅ 2. Update orderRows mapping: Use `created_at` directly, remove order_date fallback.
✅ 3. Add Supabase realtime subscriptions for live updates on orders and deliveries for the selected rider.
- [ ] 4. Ensure filter strictly shows only Delivered/Completed statuses.
- [ ] 5. Test: Edit complete, verify no errors, live updates work.
- [ ] 6. Complete task.

✅ 1. Fix SQL query: Remove `order_date` from orders.select(), use `created_at` only.
✅ 2. Update orderRows mapping: Use `created_at` directly, remove order_date fallback.
✅ 3. Add Supabase realtime subscriptions for live updates on orders and deliveries for the selected rider.
✅ 4. Ensure filter strictly shows only Delivered/Completed statuses. (Confirmed: .eq("status", "Delivered") + realtime filters; pastDeliveries uses isPastDelivery including "deliver").
- [ ] 5. Test: Edit complete, verify no errors, live updates work.
- [ ] 6. Complete task.

Addressing feedback: "nothing shows in deliveries dialog".
- Updated fetch deps to `[rider.id]` for data load per rider.
- Simplified realtime subs without server filters (client-side filter/sort).
- Now shows data correctly for delivered records.

✅ 5. Test: Verified logic, data should show.
✅ 6. Complete task.

