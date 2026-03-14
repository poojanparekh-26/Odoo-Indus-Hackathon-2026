import pandas as pd
from datetime import datetime, timedelta

def get_slow_moving(conn) -> list[dict]:
    """
    Identifies products with no StockMovement (any type) in last 30 days.
    """
    # 1. Fetch all products
    products_df = pd.read_sql_query("SELECT id, name, sku FROM Product", conn)
    
    # 2. Fetch last movement for each product
    movements_query = """
        SELECT productId, MAX(createdAt) as lastMovementDate 
        FROM StockMovement 
        GROUP BY productId
    """
    last_move_df = pd.read_sql_query(movements_query, conn)
    
    if products_df.empty:
        return []

    # 3. Merge products with their last movement date
    result = pd.merge(products_df, last_move_df, left_on='id', right_on='productId', how='left')
    
    # 4. Filter for products with no movement in last 30 days
    # (Including those with NO movement at all)
    thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
    
    # Products with lastMovementDate < 30 days ago OR lastMovementDate is NULL
    slow_df = result[(result['lastMovementDate'] < thirty_days_ago) | (result['lastMovementDate'].isna())].copy()
    
    # 5. Calculate days since last movement
    now = datetime.now()
    def calculate_days(date_str):
        if pd.isna(date_str):
            return 999  # Treat as very old
        try:
            # Handle ISO timestamp: 2024-03-14T...
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return (now - dt.replace(tzinfo=None)).days
        except:
            return 999

    slow_df['daysSinceLastMovement'] = slow_df['lastMovementDate'].apply(calculate_days)
    
    # 6. Sort and Format
    slow_df = slow_df.sort_values(by='daysSinceLastMovement', ascending=False)
    
    final_list = []
    for _, row in slow_df.iterrows():
        final_list.append({
            "productId": row['id'],
            "productName": row['name'],
            "sku": row['sku'],
            "lastMovementDate": row['lastMovementDate'] if not pd.isna(row['lastMovementDate']) else "Never",
            "daysSinceLastMovement": int(row['daysSinceLastMovement']) if row['daysSinceLastMovement'] != 999 else "N/A"
        })
        
    return final_list
