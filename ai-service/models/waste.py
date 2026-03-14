import pandas as pd
from datetime import datetime, timedelta

def get_waste_analysis(conn) -> list[dict]:
    """
    Analyzes DamageReports from last 30 days, grouped by productId.
    """
    # 1. Fetch damage reports with product unitCost in last 30 days
    thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
    query = f"""
        SELECT dr.productId, dr.quantity, p.name, p.sku, p.unitCost 
        FROM DamageReport dr
        JOIN Product p ON dr.productId = p.id
        WHERE dr.createdAt >= '{thirty_days_ago}'
    """
    df = pd.read_sql_query(query, conn)
    
    if df.empty:
        return []

    # 2. Calculate wasteValue (quantity * unitCost)
    df['wasteValue'] = df['quantity'] * df['unitCost']
    
    # 3. Group by product
    summary = df.groupby(['productId', 'name', 'sku']).agg({
        'quantity': 'sum',
        'wasteValue': 'sum'
    }).reset_index()
    
    # 4. Sort by waste value descending and take top 10
    summary = summary.sort_values(by='wasteValue', ascending=False).head(10)
    
    final_list = []
    for _, row in summary.iterrows():
        final_list.append({
            "productId": row['productId'],
            "productName": row['name'],
            "sku": row['sku'],
            "quantity": int(row['quantity']),
            "wasteValue": round(float(row['wasteValue']), 2)
        })
        
    return final_list
