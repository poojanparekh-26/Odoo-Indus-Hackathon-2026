import pandas as pd
from datetime import datetime, timedelta

def get_stockout_risk(conn) -> list[dict]:
    """
    Analyzes daily usage rates vs. on-hand quantity to predict stockout dates.
    daysRemaining = onHandQty / avgDailyUsage (last 30 days)
    """
    # 1. Fetch products
    products_df = pd.read_sql_query("SELECT id, name, sku, onHandQty FROM Product", conn)
    
    # 2. Fetch stock movements (OUT type in last 30 days)
    thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
    movements_query = f"SELECT productId, quantity, createdAt FROM StockMovement WHERE type = 'OUT' AND createdAt >= '{thirty_days_ago}'"
    movements_df = pd.read_sql_query(movements_query, conn)
    
    if products_df.empty:
        return []

    # 3. Calculate avgDailyUsage
    # Group by productId and sum quantity, then divide by 30
    usage = movements_df.groupby('productId')['quantity'].sum().reset_index()
    usage['avgDailyUsage'] = usage['quantity'] / 30
    
    # 4. Merge with products
    result = pd.merge(products_df, usage[['productId', 'avgDailyUsage']], left_on='id', right_on='productId', how='left')
    result['avgDailyUsage'] = result['avgDailyUsage'].fillna(0)
    
    # 5. Calculate daysRemaining
    # Use a large number for infinity cases (no usage)
    result['daysRemaining'] = result.apply(
        lambda row: row['onHandQty'] / row['avgDailyUsage'] if row['avgDailyUsage'] > 0 else 9999, 
        axis=1
    )
    
    # 6. Filter and Tag Urgency
    # Filter for products with < 30 days remaining (excluding those with no usage)
    risk_df = result[result['daysRemaining'] < 30].copy()
    
    def tag_urgency(days):
        if days < 7: return "critical"
        if days < 14: return "warning"
        return "watch"
    
    risk_df['urgency'] = risk_df['daysRemaining'].apply(tag_urgency)
    
    # 7. Format final list
    # Sort by daysRemaining ascending
    risk_df = risk_df.sort_values(by='daysRemaining')
    
    final_list = []
    for _, row in risk_df.iterrows():
        final_list.append({
            "productId": row['id'],
            "productName": row['name'],
            "sku": row['sku'],
            "onHandQty": int(row['onHandQty']),
            "avgDailyUsage": round(float(row['avgDailyUsage']), 2),
            "daysRemaining": round(float(row['daysRemaining']), 1) if row['daysRemaining'] != 9999 else "Infinity",
            "urgency": row['urgency']
        })
        
    return final_list
