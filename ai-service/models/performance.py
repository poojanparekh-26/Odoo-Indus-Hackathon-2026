import pandas as pd

def get_warehouse_performance(conn) -> list[dict]:
    """
    Analyzes warehouse operation completion rates (Receipts and Deliveries).
    """
    # 1. Fetch Warehouses
    warehouses = pd.read_sql_query("SELECT id, name FROM Warehouse", conn)
    
    # 2. Fetch Receipts and group by Warehouse
    # (Extracting warehouseId from products linked via lines - or easier, look at warehouseId in DamageReport or Product)
    # Actually, Receipt doesn't have a direct warehouseId in schema.
    # But usually, a receipt/delivery is related to a warehouse.
    # Looking at schema: Product has warehouseId. ReceiptLines have productId.
    
    receipts_query = """
        SELECT r.id, r.status, p.warehouseId 
        FROM Receipt r
        JOIN ReceiptLine rl ON r.id = rl.receiptId
        JOIN Product p ON rl.productId = p.id
    """
    receipts_df = pd.read_sql_query(receipts_query, conn)
    
    deliveries_query = """
        SELECT d.id, d.status, p.warehouseId 
        FROM Delivery d
        JOIN DeliveryLine dl ON d.id = dl.deliveryId
        JOIN Product p ON dl.productId = p.id
    """
    deliveries_df = pd.read_sql_query(deliveries_query, conn)

    if warehouses.empty:
        return []

    results = []
    for _, wh in warehouses.iterrows():
        wh_id = wh['id']
        
        # Receipt Performance
        wh_receipts = receipts_df[receipts_df['warehouseId'] == wh_id]
        total_receipts = wh_receipts['id'].nunique()
        done_receipts = wh_receipts[wh_receipts['status'] == 'Done']['id'].nunique()
        receipt_rate = round((done_receipts / total_receipts * 100), 1) if total_receipts > 0 else 0
        
        # Delivery Performance
        wh_deliveries = deliveries_df[deliveries_df['warehouseId'] == wh_id]
        total_deliveries = wh_deliveries['id'].nunique()
        done_deliveries = wh_deliveries[wh_deliveries['status'] == 'Done']['id'].nunique()
        delivery_rate = round((done_deliveries / total_deliveries * 100), 1) if total_deliveries > 0 else 0
        
        results.append({
            "warehouseId": wh_id,
            "warehouseName": wh['name'],
            "receiptCompletion": receipt_rate,
            "deliveryCompletion": delivery_rate,
            "totalOperations": total_receipts + total_deliveries
        })
        
    return results
